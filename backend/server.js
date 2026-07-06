const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('FilmSync Gelişmiş WebSocket Sunucusu Çalışıyor.');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Aktif odaları ve bağlantıları tutalım
// Yapısı: 
// { 
//   [roomId]: { 
//     password: string, 
//     clients: Set(wsClients), 
//     lastState: object 
//   } 
// }
const rooms = {};

// İstemci eşleme bilgileri
const clientInfo = new Map();

wss.on('connection', (ws) => {
  console.log('Yeni bir istemci bağlandı.');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const { type, payload } = data;

      switch (type) {
        case 'join':
          handleJoin(ws, payload);
          break;
        case 'play':
        case 'pause':
        case 'seek':
          broadcastMediaEvent(ws, type, payload);
          break;
        case 'chat-message':
          handleChatMessage(ws, payload);
          break;
        default:
          console.log('Bilinmeyen mesaj tipi:', type);
      }
    } catch (err) {
      console.error('Mesaj işleme hatası:', err);
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });
});

function handleJoin(ws, { roomId, username, password }) {
  handleDisconnect(ws); // Varsa eski odadan çıkar

  // Oda zaten mevcutsa şifreyi kontrol et
  if (rooms[roomId]) {
    if (rooms[roomId].password !== password) {
      console.log(`Hatalı şifre denemesi. Oda: ${roomId}, Kullanıcı: ${username}`);
      ws.send(JSON.stringify({
        type: 'join-error',
        payload: { message: 'Hatalı oda şifresi!' }
      }));
      return;
    }
  } else {
    // Oda yoksa yeni oluştur ve şifreyi tanımla
    rooms[roomId] = {
      password: password || '',
      clients: new Set(),
      lastState: { isPlaying: false, currentTime: 0, lastUpdated: Date.now() }
    };
    console.log(`Yeni oda oluşturuldu: ${roomId} (Şifre: ${password ? 'Var' : 'Yok'})`);
  }

  // Kullanıcıyı odaya ekle
  rooms[roomId].clients.add(ws);
  clientInfo.set(ws, { roomId, username: username || 'Anonim' });

  console.log(`${username || 'Anonim'} kullanıcı ${roomId} odasına katıldı.`);

  // Katılan kullanıcıya başarılı onay gönder
  ws.send(JSON.stringify({
    type: 'join-success',
    payload: { roomId, username }
  }));

  // Odanın mevcut medya durumunu yeni katılan kullanıcıya ilet
  ws.send(JSON.stringify({
    type: 'room-state',
    payload: rooms[roomId].lastState
  }));

  // Odadaki herkese güncel kullanıcı listesini gönder
  broadcastUserList(roomId);

  // Odadaki diğer kullanıcılara yeni katılımı bildir (sistem mesajı olarak)
  const systemMsg = JSON.stringify({
    type: 'sync-chat-message',
    payload: {
      username: 'Sistem',
      message: `${username || 'Anonim'} odaya katıldı.`,
      timestamp: Date.now(),
      isSystem: true
    }
  });
  rooms[roomId].clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(systemMsg);
    }
  });
}

function handleChatMessage(senderWs, { message }) {
  const info = clientInfo.get(senderWs);
  if (!info) return;

  const { roomId, username } = info;
  const room = rooms[roomId];

  if (room && message.trim()) {
    const msg = JSON.stringify({
      type: 'sync-chat-message',
      payload: {
        username,
        message: message.trim(),
        timestamp: Date.now()
      }
    });

    // Odanın içindeki herkese (gönderen dahil) mesajı gönder
    room.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }
}

function broadcastMediaEvent(senderWs, type, payload) {
  const info = clientInfo.get(senderWs);
  if (!info) return;

  const { roomId, username } = info;
  const room = rooms[roomId];

  if (room) {
    // Son oynatma durumunu güncelle
    if (type === 'play') room.lastState.isPlaying = true;
    if (type === 'pause') room.lastState.isPlaying = false;
    room.lastState.currentTime = payload.currentTime;
    room.lastState.lastUpdated = Date.now();

    const msg = JSON.stringify({
      type: `sync-${type}`,
      payload: { ...payload, sender: username }
    });

    room.clients.forEach((client) => {
      if (client !== senderWs && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }
}

function broadcastUserList(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const userList = [];
  room.clients.forEach((client) => {
    const info = clientInfo.get(client);
    if (info) {
      userList.push(info.username);
    }
  });

  const msg = JSON.stringify({
    type: 'user-list',
    payload: { users: userList }
  });

  room.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

function handleDisconnect(ws) {
  const info = clientInfo.get(ws);
  if (!info) return;

  const { roomId, username } = info;
  clientInfo.delete(ws);

  const room = rooms[roomId];
  if (room) {
    room.clients.delete(ws);
    console.log(`${username} bağlantıyı kesti. Oda: ${roomId}`);

    // Kullanıcı ayrılınca odadaki diğer kişilere bildir
    if (room.clients.size > 0) {
      broadcastUserList(roomId);

      const systemMsg = JSON.stringify({
        type: 'sync-chat-message',
        payload: {
          username: 'Sistem',
          message: `${username} odadan ayrıldı.`,
          timestamp: Date.now(),
          isSystem: true
        }
      });
      room.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(systemMsg);
        }
      });
    } else {
      // Oda boşsa sil
      delete rooms[roomId];
      console.log(`Oda ${roomId} boşaldığı için silindi.`);
    }
  }
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`FilmSync Gelişmiş WebSocket sunucusu port ${PORT} üzerinde yayında.`);
});

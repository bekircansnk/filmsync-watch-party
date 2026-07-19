// FilmSync Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('FilmSync Watch Party eklentisi başarıyla kuruldu.');
});

// Sekme Yönlendirme ve Bilgi Dinleyicisi
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'redirect-tab' && message.url) {
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      console.log(`[FilmSync Background] Sekme ${tabId} yeni adrese yönlendiriliyor: ${message.url}`);
      chrome.tabs.update(tabId, { url: message.url }, () => {
        sendResponse({ status: 'success' });
      });
      return true; // Asenkron yanıt için true dön
    }
  } else if (message.type === 'get-tab-id') {
    const tabId = sender.tab ? sender.tab.id : null;
    sendResponse({ tabId: tabId });
    return true;
  } else if (message.type === 'page-unload') {
    const { roomId, username, userId } = message;
    if (roomId && username) {
      // 1. lastState nesnesini duraklatıldı olarak güncelle
      fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}/lastState.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPlaying: false,
          lastUpdated: Date.now(),
          senderId: userId || 'unloaded_user'
        })
      }).catch(err => console.error('[FilmSync Unload Patch Hatası]', err));

      // 2. Sistem mesajı gönder
      fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}/messages.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Sistem',
          message: `${username} sayfayı yeniledi, film duraklatıldı.`,
          isSystem: true,
          timestamp: Date.now()
        })
      }).catch(err => console.error('[FilmSync Unload Msg Hatası]', err));
    }
    sendResponse({ status: 'success' });
    return true;
  }
});

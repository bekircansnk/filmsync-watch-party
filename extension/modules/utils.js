// FilmSync Yardımcı Araçlar ve Utility Fonksiyonları

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function isEmbedUrl(urlStr) {
  if (!urlStr) return false;
  const lower = urlStr.toLowerCase();
  return (
    lower.includes('/embed') ||
    lower.includes('embed-') ||
    lower.includes('embed.') ||
    lower.includes('vidsrc') ||
    lower.includes('player.php') ||
    lower.includes('video.php') ||
    lower.includes('stream.php')
  );
}

function checkIsMoviePage() {
  const url = window.location.href.toLowerCase();
  
  // 1. Google arama sayfaları veya Vercel/GitHub çalışma ortamları dışındaki her web sayfasını geçerli kabul et
  if (url.includes('google.com/search') || url.includes('google.com.tr/search')) return false;

  // 2. Sayfada video varsa veya izin verilen film platformuysa geçerli
  if (document.querySelector('video')) return true;
  if (url.includes('netflix.com/watch/')) return true;
  if (url.includes('hdfilmcehennemi')) return true;
  if (url.includes('dizipal')) return true;
  if (url.includes('youtube.com/watch')) return true;
  if (url.includes('disneyplus.com')) return true;
  if (url.includes('primevideo.com') || url.includes('amazon.com/gp/video')) return true;
  if (url.includes('blutv.com') || url.includes('exxen.com') || url.includes('gain.tv') || url.includes('todtv.com.tr')) return true;

  // Varsayılan olarak izin ver (kullanıcı zaten oda koduna bağlandıysa panel açılabilmeli)
  return true;
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

function showNotificationToast(user, msgText) {
  const existingToast = document.getElementById('filmsync-notification-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'filmsync-notification-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: rgba(20, 20, 24, 0.95);
    border: 1px solid rgba(255, 61, 71, 0.4);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    border-radius: 12px;
    padding: 12px 16px;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 300px;
    backdrop-filter: blur(8px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateY(20px);
    opacity: 0;
  `;

  toast.innerHTML = `
    <div style="font-size: 18px;">💬</div>
    <div style="flex: 1; overflow: hidden;">
      <div style="font-weight: 700; color: #ff3d47; margin-bottom: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user}</div>
      <div style="color: #e0e0e0; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${msgText}</div>
    </div>
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(10px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showMovieRedirectBanner(url) {
  if (document.getElementById('filmsync-redirect-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'filmsync-redirect-banner';
  banner.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(20, 20, 24, 0.95);
    border: 1px solid rgba(255, 61, 71, 0.5);
    border-radius: 12px;
    padding: 14px 18px;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
  `;

  banner.innerHTML = `
    <div style="font-size: 20px;">🎬</div>
    <div>
      <div style="font-weight: bold; color: #ff3d47; font-size: 13px;">Oda Sahibi Yeni Bir Film Başlattı!</div>
      <div style="font-size: 12px; color: #ccc; margin-top: 2px;">Tüm üyeler bu filme yönlendiriliyor.</div>
    </div>
    <button id="fs-btn-banner-go" style="background: #ff3d47; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; margin-left: 8px;">Filme Git 🍿</button>
    <button id="fs-btn-banner-close" style="background: transparent; color: #aaa; border: none; font-size: 16px; cursor: pointer; padding: 0 4px;">✕</button>
  `;

  document.body.appendChild(banner);

  document.getElementById('fs-btn-banner-go').addEventListener('click', () => {
    window.location.href = url;
  });

  document.getElementById('fs-btn-banner-close').addEventListener('click', () => {
    banner.remove();
  });
}

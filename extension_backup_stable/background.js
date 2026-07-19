// FilmSync Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('FilmSync Watch Party eklentisi başarıyla kuruldu.');
});

// Sekme Yönlendirme Dinleyicisi (Canlı URL Senkronizasyonu İçin)
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
  }
});

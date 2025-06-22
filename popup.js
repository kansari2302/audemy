document.getElementById('start-button').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'start' });
});

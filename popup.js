document.getElementById('open-all-courses-button').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openAllCourses' });
});

document.getElementById('start-button').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'start' });
});

document.getElementById('close-udemy-tabs-button').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'closeUdemyTabs' });
});

// Copy URLs of all tabs in current window except Real.Discount /courses listing tabs
document.getElementById('copy-tab-urls-button').addEventListener('click', async () => {
  chrome.runtime.sendMessage({ action: 'copyTabUrls' }, async (response) => {
    try {
      const urls = (response && Array.isArray(response.urls)) ? response.urls : [];
      const text = urls.join('\n');
      if (!text) return;
      await navigator.clipboard.writeText(text);
      // Optional quick feedback by changing button text briefly
      const btn = document.getElementById('copy-tab-urls-button');
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = prev; }, 1200);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  });
});

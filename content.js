// content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCourseLinks') {
    const links = Array.from(document.querySelectorAll('a.css-nk4uxn')).map(a => a.href);
    sendResponse({ courseLinks: links });
  }
});

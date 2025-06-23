// udemy_content.js
console.log('udemy_content.js: Script injected successfully.');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkUdemyTag') {
    const pageContent = document.body.textContent;
    console.log('udemy_content.js: Checking for "Go to course" in page content.');
    const tagFound = pageContent.includes('Go to course');
    console.log('udemy_content.js: Tag found status:', tagFound);
    sendResponse({ tagFound: tagFound });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    findAndProcessTabs();
  }
});

function findAndProcessTabs() {
  chrome.tabs.query({ url: "https://real.discount/offer/*" }, (tabs) => {
    if (tabs.length === 0) {
      console.log('No matching tabs found.');
      return;
    }

    for (const tab of tabs) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: grabLink,
        },
        (injectionResults) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
          }

          if (injectionResults && injectionResults[0] && injectionResults[0].result) {
            const link = injectionResults[0].result;
            chrome.tabs.create({ url: link });
            chrome.tabs.remove(tab.id);
          }
        }
      );
    }
  });
}

function grabLink() {
  // The user specified the class contains 'css-16i8b94'. 
  // The *= attribute selector finds an element if the class attribute string contains the value.
  const linkElement = document.querySelector('a[class*="css-16i8b94"]');
  return linkElement ? linkElement.href : null;
}

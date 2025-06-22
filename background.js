chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === 'start') {
    findAndProcessTabs();
  }
});

function findAndProcessTabs() {
  console.log('Starting to find and process tabs.');
  chrome.tabs.query({}, (allTabs) => {
    console.log('All open tabs:', allTabs);
  });

  chrome.tabs.query({ url: "https://real.discount/offer/*" }, (tabs) => {
    console.log(`Found ${tabs.length} matching tabs.`);
    if (tabs.length === 0) {
      console.log('No matching tabs found.');
      return;
    }

    for (const tab of tabs) {
      console.log(`Processing tab: ${tab.id} - ${tab.url}`);
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: grabLink,
        },
        (injectionResults) => {
          if (chrome.runtime.lastError) {
            console.error(`Error injecting script into tab ${tab.id}:`, chrome.runtime.lastError.message);
            return;
          }

          console.log(`Injection results for tab ${tab.id}:`, injectionResults);
          if (injectionResults && injectionResults[0] && injectionResults[0].result) {
            const link = injectionResults[0].result;
            console.log(`Found link in tab ${tab.id}: ${link}`);
            console.log(`Creating new tab with link: ${link}`);
            chrome.tabs.create({ url: link });
            console.log(`Removing old tab: ${tab.id}`);
            chrome.tabs.remove(tab.id);
          } else {
            console.log(`No link found in tab ${tab.id}.`);
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
  if (linkElement) {
    console.log('Content script: Found link element:', linkElement);
    return linkElement.href;
  } else {
    console.log('Content script: Link element not found.');
    return null;
  }
}

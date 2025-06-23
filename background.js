chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === 'start') {
    findAndProcessTabs();
  } else if (request.action === 'openAllCourses') {
    openAllCourseLinks();
  } else if (request.action === 'closeUdemyTabs') {
    closeUdemyTabsWithTag();
  }
});

function closeUdemyTabsWithTag() {
  console.log('closeUdemyTabsWithTag: Initiating check for Udemy tabs.');
  chrome.tabs.query({ url: '*://*.udemy.com/*' }, (tabs) => {
    console.log(`closeUdemyTabsWithTag: Found ${tabs.length} Udemy tabs.`);
    if (tabs.length === 0) {
      console.log('closeUdemyTabsWithTag: No Udemy tabs found.');
      alert('No Udemy tabs found to check.');
      return;
    }

    tabs.forEach(tab => {
      console.log(`Processing Udemy tab: ${tab.id} - ${tab.url}`);
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ['udemy_content.js'],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(`Script injection failed for tab ${tab.id}:`, chrome.runtime.lastError.message);
            return;
          }
          chrome.tabs.sendMessage(tab.id, { action: 'checkUdemyTag' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error(`Message sending failed for tab ${tab.id}:`, chrome.runtime.lastError.message);
              return;
            }
            if (response && response.tagFound) {
              console.log(`Tag found in tab ${tab.id}. Closing tab.`);
              chrome.tabs.remove(tab.id);
            } else {
              console.log(`Tag not found in tab ${tab.id}. Keeping tab open.`);
            }
          });
        }
      );
    });
  });
}

function openAllCourseLinks() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.log('No active tab found.');
      return;
    }

    const activeTab = tabs[0];
    const url = activeTab.url;
    console.log(`openAllCourseLinks: Active tab URL: ${url}`);

    // Check if the URL matches the real.discount courses page pattern
    if (url.startsWith('https://www.real.discount/courses?page=') || url.startsWith('https://real.discount/courses?page=')) {
      console.log('openAllCourseLinks: URL matches RealDiscount courses page pattern. Injecting content.js.');
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          files: ['content.js'],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error('openAllCourseLinks: Script injection failed:', chrome.runtime.lastError.message);
            return;
          }
          console.log('openAllCourseLinks: content.js injected. Sending message to get course links.');
          chrome.tabs.sendMessage(activeTab.id, { action: 'getCourseLinks' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('openAllCourseLinks: Message sending failed:', chrome.runtime.lastError.message);
              return;
            }
            if (response && response.courseLinks && response.courseLinks.length > 0) {
              console.log(`openAllCourseLinks: Received ${response.courseLinks.length} course links. Opening in new tabs.`);
              response.courseLinks.forEach(link => {
                chrome.tabs.create({ url: link });
              });
            } else {
              console.log('openAllCourseLinks: No course links found on this page or response was empty.');
            }
          });
        }
      );
    } else {
      console.log('openAllCourseLinks: Current tab is not a real.discount courses page. URL:', url);
      alert('Please navigate to a Real.Discount courses page (e.g., https://www.real.discount/courses?page=1) to use this feature.');
    }
  });
}

function findAndProcessTabs() {
  console.log('Starting to find and process tabs in the current window.');
  chrome.tabs.query({}, (allTabs) => {
    console.log('All open tab URLs:', allTabs.map(tab => tab.url));
  });
  chrome.tabs.query({ url: ["https://real.discount/offer/*", "https://www.real.discount/offer/*"], currentWindow: true }, (tabs) => {
    console.log(`Found ${tabs.length} matching tabs in the current window.`);
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

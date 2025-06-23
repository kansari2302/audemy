document.getElementById('open-all-courses-button').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openAllCourses' });
});

document.getElementById('start-button').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'start' });
});

document.getElementById('close-udemy-tabs-button').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'closeUdemyTabs' });
});

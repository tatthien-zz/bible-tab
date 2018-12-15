chrome.browserAction.onClicked.addListener(function(tab) {
  var newURL = "./index.html";
  chrome.tabs.create({ url: newURL });
});

'use strict';
var re = /^https?:\/\/(?:[a-z]+)\.reddit\.com\/(?!search)(?!user)(?!prefs)(?!message)(?!r\/mod)(?!friends)(?:r\/[a-z0-9]+\/)??(?:r\/[a-z0-9]+(?:\/(?:comments)?(?:submit)?\/.*))?/i;

function checkForValidUrl(tabId, changeInfo, tab) {
	if (re.test(tab.url)) {
		chrome.pageAction.show(tabId);
	}
}

chrome.pageAction.onClicked.addListener(function (tab) {
	chrome.storage.sync.get('whiteList', function (query) {
		chrome.tabs.sendMessage(tab.id, {
			req: query,
			type: 'whiteList'
		});
	});
});

chrome.tabs.onUpdated.addListener(function (tabid, changeinfo, tab) {
	if (changeinfo.status === 'complete') {
		checkForValidUrl(tabid, changeinfo, tab);
	}
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	var senderTab = sender.tab.id,
		reqQuery = request.query,
		visited = [],
		checked = 0,
		i, len;
	reqQuery.forEach(function(url){
		chrome.history.getVisits({'url': url}, function(item) {
			checked++;
			if (item.length) visited.push(url);
			if (checked === reqQuery.length) {
				chrome.tabs.sendMessage(senderTab, {
					matches: visited
				});
			}
		});
	});
});

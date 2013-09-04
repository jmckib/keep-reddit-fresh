'use strict';
var re = /^https?:\/\/(?:[a-z]+)\.reddit\.com\/(?!user)(?!prefs)(?!message)(?!r\/mod)(?!friends)(?:r\/[a-z0-9]+\/)??(?:r\/[a-z0-9]+(?:\/(?:comments)?(?:submit)?\/.*))?/i;

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
		now = new Date(),
		then = now.setDate(now.getDate() - 1),
		i, len;
	if ( request.type === 'history' && reqQuery.length ) {
		for ( i = 0, len = reqQuery.length; i < len; i += 1 ) {
			chrome.history.search({
				text: reqQuery[i],
				startTime: then,
				maxResults: 1
			}, function ( query ) {
				if ( query !== 'undefined' ) {
					if ( query.length ) {
						chrome.tabs.sendMessage(senderTab, {
							historyMatch: this.args[0].text,
							type: 'history'
						});
					} else {
						chrome.tabs.sendMessage(senderTab, {
							type: 'null'
						});
					}
				}
			});
		}
	}
});

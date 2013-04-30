//regex 'borrowed' from RES
var commentsR = /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*comments\/?[-\w\.\/]*/i,
	friendsR = /https?:\/\/([a-z]+).reddit.com\/r\/friends\/*comments\/?/i,
	inboxR = /https?:\/\/([a-z]+).reddit.com\/message\/[-\w\.\/]*/i,
	profileR = /https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.#=]*\/?(comments)?\/?(\?([a-z]+=[a-zA-Z0-9_%]*&?)*)?$/i,
	submitR = /https?:\/\/([a-z]+).reddit.com\/([-\w\.\/]*\/)?submit\/?$/i,
	prefsR = /https?:\/\/([a-z]+).reddit.com\/prefs\/?/i,
	modR = /https?:\/\/([a-z]+).reddit.com\/r\/mod\/[-\w\.\/]*/i;

function checkForValidUrl(tabId, changeInfo, tab) {
	if (tab.url.indexOf('reddit.com') > -1 && tab.url.indexOf('chrome-devtools://') === -1 && (!commentsR.test(tab.url) || !friendsR.test(tab.url) || !profileR.test(tab.url) || !inboxR.test(tab.url) || !submitR.test(tab.url) || !prefsR.test(tab.url) || !modR.test(tab.url))) {
		chrome.pageAction.show(tabId);
	}
}

chrome.pageAction.onClicked.addListener(function(tab) {
	chrome.storage.sync.get('whiteList', function(query) {
		chrome.tabs.sendMessage(tab.id, {
			req: query,
			type: 'whiteList'
		});
	});
});

chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
	if (changeinfo.status == 'complete') {
		console.log(changeinfo.status);
		checkForValidUrl(tabid, changeinfo, tab);
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var senderTab = sender.tab.id;
	if (request.type === 'history' && request.query.length) {
		var reqQuery = request.query;
		for (i = 0, len = reqQuery.length; i < len; i += 1) {
			chrome.history.getVisits({
				url: reqQuery[i]
			}, function(query) {
				if (query !== 'undefined') {
					if (query.length) {
						chrome.tabs.sendMessage(senderTab, {
							historyMatch: this.args[0].url,
							type: 'history'
						});
					}
				}
			});
		}
	}
});

'use strict';

// Find which posts are already in user's history. This can only be done in
// a background script because otherwise chrome.history not available.
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

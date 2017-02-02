var re = /^\/r\//,
	location_origin = location.origin,
	last_page;

chrome.runtime.onMessage.addListener(function( request, sender ) {
	request.matches.forEach(function(href) {
		if (href.startsWith(location_origin)) {
			href = href.slice(location_origin.length);
		}

		var post = last_page.querySelector('.linklisting .link:not(.hidden):not(.RESFiltered) a.title[href="' + href + '"]');
		var hideBtn = post.parentNode.parentNode.querySelector('.hide-button a');
		click( hideBtn );
	});
});

function hidePosts() {
	// Get pages of posts. There will be multiple if RES never ending scroll is used.
	var pages = document.querySelectorAll('div.linklisting');
	last_page = pages[pages.length - 1];

	// We only want to hide visited posts from the most recently loaded page,
	// because hiding posts from the previous page would be jarring for the user.
	var linkList = last_page.querySelectorAll('.linklisting .link:not(.hidden):not(.RESFiltered) a.title');
	var links = Array.prototype.slice.call( linkList, 0 );
	// Take self post links, which point directly to /r/subreddit and prepend
	// the protocol/host so that it's a valid URL to pass to chrome.history
	links.forEach(function( ele, ind ) {
		if ( re.test( ele.href ) ) {
			 ele.href = location_origin + ele.href;
		}
		links[ind] = ele.href;
	});

	chrome.runtime.sendMessage({query: links, type: 'history'});
}

function click( ele ){
	evt = document.createEvent('MouseEvents');
	evt.initMouseEvent( 'click', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, 0, null );
	ele.dispatchEvent( evt );
}

hidePosts();

window.addEventListener('neverEndingLoad', hidePosts);

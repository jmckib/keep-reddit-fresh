$(document).ready(function(){
	var modal = document.createElement('div');
	modal.className = 'notifyDiv';
	modal.textContent = 'Hiding posts';
	document.body.appendChild(modal);
});

var delay, count;

chrome.runtime.onMessage.addListener(
function(request, sender) {
	var r = request;
	if (r.type === 'whiteList') {
		delay = 500, count = 500;
		filterPosts(r.req.whiteList);
	}
	if (r.type === 'history') {
		if (r.historyMatch) {
			delay += 750, count += 750;
			hidePost(r.historyMatch, delay);
		}
	}
});

// Filter out an posts from whitelisted subreddits
function filterPosts(whiteList) {
	var $links = $('.linklisting .link a.title'), links = [],
		i, len, link, validLink, commentsLink, _len;

	// Take self post links, which point directly to /r/subreddit and prepend
	// the protocol/host so that it's a valid URL to pass to chrome.history
	$links.each(function(i, e) {
		if ( $(e).attr('href').match(/^\/r\//) ) {
			validLink = location.protocol + '//' + location.host + $(e).attr('href');
			$links.eq(i).attr('href', validLink);
		}
	});

	// Filter whitelisted subreddits from $links nodelist
	if (whiteList && whiteList.length) {
		for (i = 0, len = whiteList.length; i < len; i += 1) {
			_len = $links.length
			//Take the bare subreddit name and prepend '/r/'
			whiteList[i] = new RegExp('reddit.com\/r\/' + whiteList[i], 'i');
			while (_len--) {
				// Find the href of the comments link relative to the current link
				commentsLink = $links.eq(_len).parent().parent().find('.comments').attr('href');
				// Splice out any links that match whitelisted subreddits
				if (whiteList[i].test(commentsLink)) {
					$links.splice( _len, 1 );
				}
			}
		}
	}
	
	// Push all resulting links into a plain 'links' array
	for (i = 0, _len = $links.length; i < _len; i += 1) {
		links.push($links.eq(i).attr('href'));
	}
	
	if (links.length) queryHistory(links);
}

// Hide the visited posts on the current page that match entries in the user history
function hidePost(post, delay) {
	setTimeout(function() {
		$(".title[href='" + post + "']").parent().parent().find('.hide-button a').click();
		return (function(){
			setTimeout(function(){
				if (count > delay) {
					notifyHidden();
				} else {
					notifyHidden(true);
				}
			}, 20);
		}());
	}, delay);
}

// Query user history for any matching links on the current page
function queryHistory(links) {
	chrome.runtime.sendMessage({
		query: links,
		type: 'history'
	});
}

function notifyHidden(done){
	if (done) {
		$('.notifyDiv').delay(600).fadeOut(600);
	} else {
		$('.notifyDiv').fadeIn(300);
	}
}

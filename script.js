"use strict";

var linksCount = 0, // store total count of links on page
	matchCount = 0, // counter for returned requests from history
	matchPool = [], // keep track of links on the page that were found in history
	re = /^\/r\//,
	links = [],
	r, modal, counter, label, i, _i, len, link, commentsLink, _len, post, evt

	// Insert modal for displaying message-hiding count
	modal = document.createElement('div'),
	label = document.createElement('span'),
	counter = document.createElement('span');
	modal.className = 'notifyDiv';
	label.textContent = 'Processing post(s)';
	counter.id = 'counter';
	counter.textContent = ''
	modal.appendChild(label);
	modal.appendChild(counter);
	document.body.appendChild(modal);

// Process messages from the background page
chrome.runtime.onMessage.addListener(function( request, sender ) {
	r = request;
	if ( r.type !== 'whiteList' ) matchCount++;
	if ( r.type === 'whiteList' ) {
		filterPosts( r.req.whiteList );
		document.getElementById('counter').textContent = '';
		showModal();
	}
	if ( r.type === 'history' ) matchPool.push( r.historyMatch );
	if ( ( matchCount >= linksCount ) && matchPool.length ) {
		processMatches( matchPool );
	} else if ( ( matchCount >= linksCount ) && !matchPool.length ) {
		document.getElementById('counter').textContent = 'No visited posts';
		setTimeout( hideModal, 1000 );
	}
});

function processMatches( matches ) {
	// Strip the location.origin so that text post hrefs match the history entry
	matches.forEach(function( ele, ind ) {
		if ( ele.match( location.origin ) ) {
			matches[ind] = ele.replace( location.origin, '' );
		}
	});
	hidePost( matches );
}

// Hide the visited posts on the current page that match entries in the user history
function hidePost( matches ) {
	matches = Array.prototype.slice.call( matches, 0 );
	modal = document.querySelector('.notifyDiv'),
	counter = document.getElementById('counter');
	showModal();
	matches.forEach(function( ele, ind ) {
		// setTimeout here to give a breather in between hiding posts
		setTimeout(function () {
			counter.textContent = 'Hiding ' + (ind+1) + ' of ' + matchPool.length;
			post = '.title[href="' + ele + '"]';
			post = document.querySelector(post);
			if ( post ) {
				post = post.parentNode.parentNode.querySelector('.hide-button a');
				click( post );
			}
			if ( ind === matchPool.length-1 ) {
				// Done processing links - hide modal
				hideModal();
			}
		}, 1000 * ind);
	});
}

// Filter out any posts from whitelisted subreddits
function filterPosts( whiteList ) {
	links = document.querySelectorAll('.linklisting .link:not(.hidden) a.title');
	links = Array.prototype.slice.call( links, 0 );
	// Take self post links, which point directly to /r/subreddit and prepend
	// the protocol/host so that it's a valid URL to pass to chrome.history
	links.forEach(function( ele, ind ) {
		if ( re.test( ele.href ) ) {
			 ele.href = location.origin + '/' + ele.href;
		}
	});
	// Filter whitelisted subreddits from links nodelist
	if ( whiteList && whiteList.length ) {
		for ( i = 0, len = whiteList.length; i < len; i += 1 ) {
			_len = links.length
			//Take the bare subreddit name and prepend '/r/'
			whiteList[i] = new RegExp('reddit.com\/r\/' + whiteList[i], 'i');
			while (_len--) {
				// Find the href of the comments link relative to the current link
				commentsLink = links[_len].parentNode.parentNode.querySelector('.comments').href;
				// Splice out any links that match whitelisted subreddits
				if ( whiteList[i].test(commentsLink) ) {
					links.splice( _len, 1 );
				}
			}
		}
	}
	// Push all resulting link hrefs into an array
	links.forEach(function( ele, ind ){
		links[ind] = ele.href;
	});

	if ( links.length ) {
		linksCount = links.length;
		queryHistory(links);
	}
}

// Query user history for any matching links on the current page
function queryHistory( links ) {
	chrome.runtime.sendMessage({
		query: links,
		type: 'history'
	});
}

function hideModal() {
	setTimeout(function(){
		modal.classList.remove('visible');
		modal.classList.add('hidden');
	}, 1000);
	// Reset vars in case of future passes
	matchPool = [];
	linksCount = matchCount = i = _i = len = _len = 0;
}

function showModal() {
	modal.classList.remove('hidden');
	modal.classList.add('visible');
}

function click( ele ){
	evt = document.createEvent('MouseEvents');
	evt.initMouseEvent('click', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, 0, null);
	ele.dispatchEvent( evt );
}

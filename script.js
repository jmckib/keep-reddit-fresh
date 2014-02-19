"use strict";

var re = /^\/r\//,
	links = [], toHide = [],
	r, modal, counter, label, i, _i, len, _len, link, hideBtn,
	commentsLink, post, evt, matches, linksCount, linkList,

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

	if ( r.matches && r.matches.length === 0 ) {
		document.getElementById('counter').textContent = 'No visited posts';
		setTimeout( hideModal, 1000 );
	}
	if ( r.type === 'whiteList' && !document.querySelector('.notifyDiv.visible') ) {
		showModal();
		filterPosts( r.req.whiteList );
		document.getElementById('counter').textContent = '';
	}
	if ( r.matches && r.matches.length && document.querySelector('.notifyDiv.visible') ) {
		processMatches( r.matches );
	}

});

//  Prep posts that match history entries
function processMatches( matches ) {
	matches.forEach(function( ele ) {
		for ( i = 0, len = linkList.length; i < len; i += 1 ){
			if ( ele === linkList[i].href ){
				toHide.push(linkList[i]);
			}
		}
	});
	hidePost( toHide );
}

// Hide the visited posts on the current page that match entries in the user history
function hidePost( toHide ) {
	modal = document.querySelector('.notifyDiv'),
	counter = document.getElementById('counter');
	toHide.forEach(function( ele, ind ) {
		// setTimeout here to give a breather in between hiding posts
		setTimeout(function () {
			counter.textContent = 'Hiding ' + ( ind + 1 ) + ' of ' + toHide.length;
			hideBtn = ele.parentNode.parentNode.querySelector('.hide-button a');
			click( hideBtn );			//click( post );
			if ( ind === toHide.length-1 ) {
				// Done processing links - hide modal and reset arrays
				linkList = links = matches = toHide = [];
				hideModal();
			}
		}, 1000 * ind);
	});
}

// Filter out any posts from whitelisted subreddits
function filterPosts( whiteList ) {
	linkList = document.querySelectorAll('.linklisting .link:not(.hidden):not(.RESFiltered) a.title');
	links = Array.prototype.slice.call( linkList, 0 );
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
		queryHistory( links );
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
		modal.classList.add('notVisible');
	}, 1500);
}

function showModal() {
	modal.classList.remove('notVisible');
	modal.classList.add('visible');
}

function click( ele ){
	evt = document.createEvent('MouseEvents');
	evt.initMouseEvent('click', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, 0, null);
	ele.dispatchEvent( evt );
}

function save_options() {
	var subs = document.querySelector('#subs');
	sub = subs.value.replace(/\s/g, '').split(','),
	sublist = [];
	for (var i = 0, len = sub.length; i < len; i += 1) {
		sublist.push(sub[i]);
	}
	chrome.storage.sync.set({whiteList: sublist});
	var status = document.querySelector('.status');
	status.setAttribute('style','inline-block');
	status.innerHTML = "Options Saved.";
	setTimeout(function() {
		status.style.display = 'none';
	}, 2000);
}

function restore_options() {
	chrome.storage.sync.get('whiteList', function(e) {
		if (e.whiteList) {
			for (var i = 0, len = e.whiteList.length; i < len; i += 1) {
				document.querySelector('#subs').value = e.whiteList.join(',');
			}
		}
	});
}

function delete_options() {
	chrome.storage.sync.remove('whiteList', function(){console.log( "DESTROYED!" );});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#del').addEventListener('click', delete_options);

var lock = new Auth0Lock('yRATDah9GsiZbDacs_4hY29KgwVkfig8', 'lowpost.auth0.com');

var currentVideo = 0;
var videos = [];
var player;

$(document).ready(function () {
	updateAuthenticationStatus();
});

function logout() {
	localStorage.removeItem('profile');
	localStorage.removeItem('token');
	updateAuthenticationStatus();
}

function login() {
	lock.show(function(err, profile, id_token) {
		if (err) {
			return alert(err.message);
		}
		localStorage.setItem('profile', JSON.stringify(profile));
		localStorage.setItem('token', id_token);
		updateAuthenticationStatus();
	});
}

function updateAuthenticationStatus() {
	$('#user').empty();
	$('#login').empty();
	var user = getUser();
	if (user) {
		$('#user').show().append('<a href="#" onclick="logout()">' + user.email + ' (Log out)</a>');
		$('#login').hide();
		$('#video-content').show();
		loadVideos(user);
	} else {
		$('#login').show().append('<a href="#" onclick="login()">Log in to view videos</a>');
		$('#user').hide();
		$('#video-content').hide();
	}
}

function getUser() {
	var user = localStorage.getItem('profile');
	if (user) {
		return JSON.parse(user);
	}
}

function loadVideos(user) {
	$.ajax({
		type : 'GET',
		url : 'https://wt-5dd25e6d4ef4b1b47550f77ba43a37f6-0.run.webtask.io/tv/videos?user=' + user.email
	}).done(function(data) {
		console.log(data);
		videos = data.newVideos;
		var watched = $('#watched');
		$.each(data.watchedVideos, function(index, value) {
			watched.append('<li>' + cleanseTitle(value) + '</li>');
		});
		player = new YT.Player('player', {
			height: '450',
			width: '800',
			videoId : videos[currentVideo].id.videoId,
			events: {
	            'onStateChange': onPlayerStateChange
			}
		});
		updateTitles();
	});
}

function blockVideo() {
	updateVideo('block');
}

function watchedVideo() {
	$('#watched').prepend('<li>' + cleanseTitle(videos[currentVideo]) + '</li>');
	updateVideo('watched');
}

function skipVideo() {
	nextVideo();
}

function updateVideo(verb) {
	var user = getUser();
	if (user) {
		$.ajax({
			type : 'POST',
			url : 'https://wt-5dd25e6d4ef4b1b47550f77ba43a37f6-0.run.webtask.io/tv/' + verb,
			data : {user : user.email, video : videos[currentVideo].id.videoId}
		}).done(function(data) {
			console.log(data);
		});
		nextVideo();		
	}
}

function nextVideo() {
	currentVideo++;
	player.loadVideoById(videos[currentVideo].id.videoId);
	updateTitles();
}

function updateTitles() {
	$('#playing').text(cleanseTitle(videos[currentVideo]));
	var coming = $('#coming');
	coming.html('');
	var i;
	for (i = currentVideo + 1; i < videos.length; i++) {
		coming.append('<li>' + cleanseTitle(videos[i]) + '</li>');
	}
}

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.ENDED) {
		watchedVideo();
	}
}

function cleanseTitle(video) {
	var title = video.snippet.title;
	title = title.replace('Key & Peele - ', '');
	return title;
}

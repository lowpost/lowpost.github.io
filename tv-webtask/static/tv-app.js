var lock = new Auth0Lock('yRATDah9GsiZbDacs_4hY29KgwVkfig8', 'lowpost.auth0.com');

var currentVideo = 0;
var videos = [];
var player;

$(document).ready(function(){
	updateAuthenticationStatus();
});

function logout(){
	localStorage.removeItem('profile');
	localStorage.removeItem('token');
	updateAuthenticationStatus();
};

function login(){
	lock.show(function(err, profile, id_token) {
		if (err) {
			return alert(err.message);
		}
		localStorage.setItem('profile', JSON.stringify(profile));
		localStorage.setItem('token', id_token);
		updateAuthenticationStatus();
	});
};

function updateAuthenticationStatus(){
	$('#user').empty();
	$('#login').empty();
	var user = localStorage.getItem('profile');
	if(user){
		user = JSON.parse(user);
		$('#user').show().append('<a onclick="logout()">' + user.email + ' (Log out)</a>');
		$('#login').hide();
		$('#block').show();
		loadVideos(user)
	} else {
		$('#login').show().append('<a onclick="login()">Log in</a>');
		$('#user').hide();
		$('#block').hide();
	}
}

function loadVideos(user) {
	$.ajax({
		type : 'GET',
		url : 'https://wt-5dd25e6d4ef4b1b47550f77ba43a37f6-0.run.webtask.io/tv/videos?user=' + user.email
	}).done(function(data) {
		console.log(data);
		videos = data.newVideos;
		player = new YT.Player('player', {
			height: '450',
			width: '800',
			videoId : videos[currentVideo].id.videoId,
			events: {
	            'onStateChange': onPlayerStateChange
			}
		});
		updateVideoTitle();
	});
}

function blockVideo() {
	updateVideo('block');
}

function watchedVideo() {
	updateVideo('watched');
}

function updateVideo(verb) {
	$.ajax({
		type : 'POST',
		url : 'https://wt-5dd25e6d4ef4b1b47550f77ba43a37f6-0.run.webtask.io/tv/' + verb,
		data : {user : user.email, video : videos[currentVideo].id.videoId}
	}).done(function(data) {
		console.log(data);
	});
	nextVideo();
}

function nextVideo() {
	currentVideo++;
	player.loadVideoById(videos[currentVideo].id.videoId);
	updateVideoTitle();
}

function updateVideoTitle() {
	$('#block').text('Block ' + videos[currentVideo].snippet.title);
}

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.ENDED) {
		watchedVideo();
	}
}

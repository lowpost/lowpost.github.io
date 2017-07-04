var lock = new Auth0Lock('yRATDah9GsiZbDacs_4hY29KgwVkfig8', 'lowpost.auth0.com');

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
		loadVideos(user)
	} else {
		$('#login').show().append('<a onclick="login()">Log in</a>');
		$('#user').hide();
	}
}

function loadVideos(user) {
	$.ajax({
	type : 'GET',
	url : 'https://wt-5dd25e6d4ef4b1b47550f77ba43a37f6-0.run.webtask.io/tv/videos?user=' + user.email,
	}).done(function(data) {
		console.log(data);
		var player = new YT.Player('player', {
			height: '450',
			width: '800',
			videoId: data.newVideos[0].id.videoId
		});
	});
}

function onYouTubeIframeAPIReady() {
	//loadVideos();
}


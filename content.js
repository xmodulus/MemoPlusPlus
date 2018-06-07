$(document).ready(function() {
	muteUsers();
	fancyPolls();
	settings();
	generalChanges();
	parseMemos();
	$("body").fadeIn(150);		//	Fade in.
});

const base_url = 'https://memo.cash';
const urls = 	{
					'posts' : {
						'ranked': '/posts/ranked',
						'top': '/posts/top',
						'personalized': '/posts/personalized',
						'new': '/posts/new'
					},
					'topics' : {
						'following': '/topics',
						'all': '/topics/all',
						'most-followed': '/topics/most-followed',
						'most-posts': '/topics/most-posts',
					},
				}
const default_prefs =  	{
							'default_posts' : 'ranked',
							'default_topics' : 'all',
						}

function generalChanges(){
	var settings = getSettings();
	$('nav.navbar').addClass('navbar-fixed-top');
	$('div.wrapper').css('padding-top', '60px');

	$('li a:contains("New")').css('font-weight','bold');

	$('a:contains("Dashboard")').hide();

	$('a:contains("Settings")').parent().before('<li><a href="/">Dashboard</a></li>');

	
	var notif = Number($('li.notifications a').first().text().replace(/\s/g,''));
	if(notif != 0){
		var title = $(document).attr('title');
		var favicon = new Favico({animation :'slide'});		//	favico.js is lit.
		title = '('+notif+') ' + title;						//	set notification in title
		$(document).attr('title', title);
		$('li.notifications a').css('color', 'red');
		favicon.badge(notif);
	}

	//Make changes to UI based on settings.
	$('a:contains("Posts")').attr('href', base_url + urls.posts[settings.default_posts] );
	$('a:contains("Topics")').attr('href', base_url + urls.topics[settings.default_topics] );
}

/*
	Get user settings
*/
function getSettings(){
	var settings = localStorage.getItem('memo-settings');

	if(!settings){
		var default_settings = default_prefs;
		localStorage.setItem('memo-settings', JSON.stringify(default_settings));
		return default_settings;
	}
	return JSON.parse(settings);
}

/*
	Set user settings form in the settings page.
*/
function settings(){
	var settings = getSettings();

	if(window.location.href.indexOf("/settings") > -1) {

	//Just hard code this. No biggie.
	var template_start =	'<h2>Memo++ settings</h2><br><form id="memo-settings-form" class="form-horizontal">';
	var settings_0 =		'<div class="form-group row">' +
							'<label class="col-form-label col-sm-3">Default Posts Tab</label>' +
							'<div class="col-sm-9">' +
							'<div class="checkbox"><input id="posts-ranked" type="radio" name="default-posts" class="form-check-input" value="ranked"/>' +
							'<label for="posts-ranked" class="form-check-label">' +
									'Ranked' +
							'</label></div>' +
							'<div class="checkbox"><input id="posts-top" type="radio" name="default-posts" class="form-check-input" value="top" />' +
							'<label for="posts-top" class="form-check-label">' +
									'Top' +
							'</label></div>' +
							'<div class="checkbox"><input id="posts-personalized" type="radio" name="default-posts" class="form-check-input" value="personalized" />' +
							'<label for="posts-personalized" class="form-check-label">' +
									'Personalized' +
							'</label></div>' +
							'<div class="checkbox"><input id="posts-new" type="radio" name="default-posts" class="form-check-input" value="new"/>' +
							'<label for="posts-new" class="form-check-label">' +
									'New' +
							'</label></div></div></div>';
	var settings_1 =		'<div class="form-group row">' +
							'<label class="col-form-label col-sm-3">Default Topics Tab</label>' +
							'<div class="col-sm-9">' +
							'<div class="checkbox"><input id="topics-following" type="radio" name="default-topics" class="form-check-input" value="following"/>' +
							'<label for="topics-following" class="form-check-label">' +
									'Following' +
							'</label></div>' +
							'<div class="checkbox"><input id="topics-all" type="radio" name="default-topics" class="form-check-input" value="all"/>' +
							'<label for="topics-all" class="form-check-label">' +
									'All' +
							'</label></div>' +
							'<div class="checkbox"><input id="topics-most-followed" type="radio" name="default-topics" class="form-check-input" value="most-followed"/>' +
							'<label for="topics-most-followed" class="form-check-label">' +
									'Most Followed' +
							'</label></div>' +
							'<div class="checkbox"><input id="topics-most-posts" type="radio" name="default-topics" class="form-check-input" value="most-posts"/>' +
							'<label for="topics-most-posts" class="form-check-label">' +
							'Most Posts' +
							'</label></div></div></div>';
	var save_btn =			'<br><div class="form-group"><div class="col-sm-3"></div><div class="col-sm-9"><input type="button" id="memo-save" class="btn btn-success" value="Save memo++ settings"></div></div>'						
	var template_end =		'</form>';

	var template = template_start + settings_0 + settings_1 + save_btn + template_end;
	$('#settings-form').after(template);	//add form after memo's default form
		
	$('[value="'+settings.default_posts+'"]').prop('checked', true);		//set checked based on current settings
	$('[value="'+settings.default_topics+'"]').prop('checked', true);

	//Save settings to localStorage.
	$('#memo-save').on('click', function(e) {
		e.preventDefault();
		var posts = $('[name="default-posts"]:checked').val();
		var topics = $('[name="default-topics"]:checked').val();

		settings.default_posts = posts;
		settings.default_topics = topics;
		localStorage.setItem('memo-settings', JSON.stringify(settings));

		alert('Settings updated!');
		location.reload();
	})

	}
}

/*
	Main muteUser method.
*/
function muteUsers(){
	const mute_btn = '<button type="button" class="btn btn-danger btn-sm memo-mute">Mute</button>';
	const hidden_0 = '<div class="post-header"><p class="name" style="padding:0.5em;"><span class="memo-name">';
	const hidden_1 = '</span><span> has been muted.</span><button type="button" class="memo-unmute btn btn-info btn-sm" style="margin-left:1em;">Unmute</button></p></div>';
	
	var list = localStorage.getItem('memo-list');

	if(list === null || list === undefined)	localStorage.setItem('memo-list', JSON.stringify([]));

	$('p.name').append(mute_btn);									//	Add mute button.

	$('button.memo-mute').click(function(e) {						//	Handle mute button click.
		e.preventDefault();
		var name = $(this).siblings('a.profile').text();
		mute(name);
	});	

	$(document).on('click', 'button.memo-unmute',function(e) {		//	Handle unmute button click.
		e.preventDefault();
		var name = $(this).siblings('span.memo-name').text();
		unmute(name);
	});	

	$('div.post').each(function(index) {
		var name = $(this).find('a.profile').first().text();
		if(isMuted(name)){
			var string = hidden_0 + name + hidden_1;
			$(this).children().not('div.post').not('script').remove();	//delete all child elements except script and div.post
			$(this).prepend(string);
		}
	});	
}

/*
	Adds user's name to mute list
*/
function mute(name){
	var list = localStorage.getItem('memo-list');
	if(list === undefined || list === null){
		list = [];
	}else{
		list = JSON.parse(list);
	}
	if(!isMuted(name)) {
		list.push(name);
		localStorage.setItem('memo-list', JSON.stringify(list));
		// alert(name + ' muted.');
		location.reload();
	}else{
		alert(name + ' is already muted.');
	}	
}

/*
	Removes user's name from mute list
*/
function unmute(name){
	var list = localStorage.getItem('memo-list');
	if(list !== null || list !== undefined){
		list = JSON.parse(list);
		var index = list.indexOf(name);
		if (index > -1) {
			list.splice(index, 1);
			localStorage.setItem('memo-list', JSON.stringify(list));
			// alert(name + ' is unmuted.');
			location.reload();
		}
	}
}

/*
	Returns whether a user is in mute list.
*/
function isMuted(name){
	var list = localStorage.getItem('memo-list');	
	list = JSON.parse(list);
	return list.indexOf(name) > -1;
}

/*
	Make polls look fancy
*/
function fancyPolls(){
	if(window.location.href.indexOf("/poll") > -1 || window.location.href.indexOf("/post") > -1 ) {
		$('tbody').each(function(index){
			var totalVotes = 0;
			$(this).children('tr').each(function(index){
				var votes = $(this).children('td').eq(1).text().split(' votes');
				totalVotes += Number(votes[0]);	//get total number of votes
			});
			$(this).children('tr').each(function(index){
				var votes = $(this).children('td').eq(1).text().split(' votes');
				var percentage = totalVotes != 0 ? Math.round((votes[0]/totalVotes)*100) : 0;
				var barwidth = totalVotes != 0 ? Math.round((votes[0]/totalVotes)*94) : 0;

				$(this).children('td').css('width', '30%');
				$(this).children('td').eq(0).after(	'<td><div class="progress memo-poll" style="margin: 0.3em;"><div class="progress-bar progress-bar-striped" '+
													'style="width: '+(barwidth+6)+'%; text-align:left; padding-left:0.4em; font-weight:bold;">'+percentage+'%</div></div></td>');
				$(this).children('td').css('margin', 'auto');
				$(this).children('td').css('padding', '0.5em');
			});
		});
	}
}

/*
	General method that loops through all memos on the page.
*/

function parseMemos(){
	$('.message').each(function(){
		var context = $(this);
		nameTag(context);
	});

	//searching through all links
	$('a').each(function(){
		var context = $(this);
		twitterEmbed(context);
		instagramEmbed(context);
	})
}


/*
	Converts @handles to links that go to the profile search page.
*/
function nameTag(context){
	var text = context.html();
    out = text.replace(/@([a-z\d_]+)/ig, '<a href="https://memo.cash/profiles?s=$1">@$1</a>'); 
    context.html(out); 
}

/*
	Embeds tweet when twitter URL is detected.
*/
function twitterEmbed(context){
	var text = context.html();
	var regex = /(^|[^'"])(https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+))/;
	var matched = text.match(regex);
	if(matched) {
		context.text('Loading Tweet...');
		$.get('https://publish.twitter.com/oembed?link-color=487521&cards=hidden&url='+matched[2], function(res) {
			var out = text.replace(regex, res.html); 
			context.replaceWith(out);
		});
	}
};

/*
	Embeds Instagram post when instagram URL is detected.
*/
function instagramEmbed(context){
	var text = context.html();
	var regex = /(https?:\/\/www\.)?instagram\.com(\/p\/\w+\/?)/
	var matched = text.match(regex);
	if(matched) {
		context.text('Loading Instagram post...');
		$.get('https://api.instagram.com/oembed?maxwidth=500&url='+matched[0], function(res) {
			var out = text.replace(regex, res.html); 
			context.replaceWith(out);
		});
	}
}
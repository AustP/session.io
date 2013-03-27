module.exports = function(handshake, done, cookieParser, sessionStore, key){
	key = key || 'connect.sid';
	cookieParser(handshake, {}, function(err){
		if(err) done(err, false);
		var cookie = (handshake.secureCookies && handshake.secureCookies[key])
			|| (handshake.signedCookies && handshake.signedCookies[key])
			|| (handshake.cookies && handshake.cookies[key]);
		sessionStore.load(cookie, function(err, session){
		if(err) done(err, false);
			handshake.session = session;
			done(null, true);
		});
	});	
}

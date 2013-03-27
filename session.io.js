module.exports = function(cookieParser, sessionStore, key, fn){
	fn = (typeof key === 'string')? fn: key;
	key = (typeof key === 'string')? key: 'connect.sid';

	return function(handshake, done){
		function next(err, bool){
			fn? fn(handshake, done): done(err, bool);
		}

		if(!handshake || !handshake.headers || !handshake.headers.cookie) next('No cookie in header', false);
		cookieParser(handshake, {}, function(err){
			if(err) next(err, false);
			
			var session_id = (handshake.secureCookies && handshake.secureCookies[key])
				|| (handshake.signedCookies && handshake.signedCookies[key])
				|| (handshake.cookies && handshake.cookies[key]);
			if(!session_id) next('Could not find cookie with key: ' + key, false);
			
			sessionStore.load(session_id, function(err, session){
				if(err) next(err, false);
				handshake.session = session;
				next(null, true);
			});
		});	
	}
}

#session.io
<hr>
###Introduction
Back when <a href="http://expressjs.com">Express</a> was in version 2, we had access to our 
<a href="http://www.danielbaulig.de/socket-ioexpress/">session data</a> in socket.io. But when Express upgraded to 
version 3, our session data was cut off. After scrambling from module to module trying to restore session data in 
socket.io, I decided to bring it back to the way it was.

I had been using <a href="https://github.com/functioncallback/session.socket.io">session.socket.io</a> with quite
a bit of success. The problem with this module and many others is that when getting session data, the call is 
asynchronous. This caused problems when trying to get session data for other sockets besides the one that was
currently being used. i.e. `io.sockets.forEach(function(_socket){...});`

So I needed to get session data during authorization like I was doing previously. I wrote my piece of code basing it
off of session.socket.io. Because it was such a re-write I just decided to create a new module for it. After writing
my module I found <a href="https://github.com/tcr/socket.io-session/">socket.io-session</a>. I looked at their code
and saw some things that I liked in it and adapted it to my code (i.e. allowing a callback to continue authorization).

##Quick Start
###Installation

    npm install session.io
    
###Setup
This script is under <a href="https://github.com/AustP/session.io/blob/master/examples/test.js">/examples/test.js</a>
if you want to test it.

    var express = require('express');
    var app = express();
    var server = require('http').createServer(app);
    
    //Setup cookie and session handlers
    //Note: for sessionStore you can use any sessionStore module that has the .load() function
    //but I personally use the module 'sessionstore' to handle my sessionStores.
    var cookieParser = express.cookieParser('secret');
    var sessionStore = require('sessionstore').createSessionStore();
    
    app.configure(function(){
      app.set('port', process.env.PORT || 3000);
      //...truncate...//
      app.use(cookieParser);
      //make sure to use the same secret as you specified in your cookieParser
      app.use(express.session({secret: 'secret', store: sessionStore}));
      app.use(app.router);
    });
    
    app.get('/', function(req, res){
      res.send('<script src="/socket.io/socket.io.js"></script><script>io.connect();</script>Connected');
    });
    
    server.listen(app.get('port'), function(){
      console.log('Listening on port ' + app.get('port'));
    });
    
    var io = require('socket.io').listen(server);
    
    io.configure(function(){
      //use session.io to get our session data
      io.set('authorization', require('session.io')(cookieParser, sessionStore));
    });
    
    io.on('connection', function(socket){
      //we now have access to our session data like so
      var session = socket.handshake.session;
      console.log(session);
    });
    
##Specifics
When you call `require('session.io')`, it returns a function. You may be thinking, "So what exactly can I pass to the 
`session.io` function?" Well, let me tell you. When you call that function, it takes the following parameters:

- cookieParser :: required - instance of `express.cookieParser()`
- sessionStore :: required - instance of any sessionStore module that has the `.load()` function
- key :: optional - the key used in `express.session()` if you set one
- fn :: optional - function to call to handle any additional authorization you may want to do - session will be set here

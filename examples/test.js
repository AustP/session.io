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

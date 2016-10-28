var restify = require('restify');
var rethinkdb = require('rethinkdb');
var socketio = require('socket.io');
GLOBAL.io=null;
GLOBAL.dbConn=null;
GLOBAL.ioClients=[];
var server=null;
var users = require('./endpoints/users');
var paths = require('./endpoints/paths');

 rethinkdb.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
  if(err) throw err;
  
  GLOBAL.dbConn=conn;

	server = restify.createServer({
	  name: 'reecepoolapi',
	  version: '1.0.0'
	});
	
	server.use(restify.CORS());
	
	GLOBAL.io=socketio.listen(server.server);
	
	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.queryParser());
	server.use(restify.bodyParser());

	var usersEndpoint=new users.Endpoint();
	usersEndpoint.registerListeners(server);
	
	var pathsEndpoint=new paths.Endpoint();
	pathsEndpoint.registerListeners(server);
	 
	server.listen(8081, function () {
	  console.log('%s listening at %s', server.name, server.url);
	});
	
	GLOBAL.io.sockets.on('connection', function (socket) {
		socket.emit('foo', { hello: 'world' });
		
		//console.log(socket);
		
		GLOBAL.ioClients.push(socket);
	});
});



function list(req, res, next) {
  rethinkdb.table('tv_shows').run(rethinkdbConn, function(err, cursor) {
     if(err) {
       return next(err);
     }

     //Retrieve all the todos in an array.
     cursor.toArray(function(err, result) {
     if(err) {
          return next(err);
     }

     res.send(result);
     return next();
     });	
  });
}


function sample(req, res, next) {
	rethinkdb.db('test').tableCreate('user').run(GLOBAL.dbConn, function(err, result) {
	    if(err) throw err;
	    console.log(result);
	});
}



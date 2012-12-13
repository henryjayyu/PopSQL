/*
 * APP FOG MongoDB
 */
if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
}

else {
  var mongo = {
      "hostname":"localhost"
  ,   "port":27017
  ,   "username":""
  ,   "password":""
  ,   "name":""
  ,   "db":"db"
  }
}

var generate_mongo_url = function(obj) {
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');
  if (obj.username && obj.password) {
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }

  else {
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

var mongourl = generate_mongo_url(mongo);

/*
 * Module dependencies.
 */

var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , routes = require('./routes')
  , user = require('./routes/user')
  , path = require('path')
  , mongoose = require('mongoose');

var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

mongoose.connection.on('open', function (ref) {
  console.log('Connected to mongo server.');
});

mongoose.connection.on('error', function (err) {
  console.log('Could not connect to mongo server!');
  console.log(err);
});

mongoose.connect('mongodb://localhost/test');


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);

  app.use(stylus.middleware(
    {
      src: __dirname + '/public',
      compress: true
    }));

 app.use(express.static(path.join(__dirname, 'public'))); 
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// set up the RESTful, handler methods
app.get('/', routes.index);
app.get('/aboutus', routes.index_aboutus);
app.get('/users', user.list);

app.post('/postback', routes.index_postback);
app.post('/post', routes.index_post);


server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

//Websocket
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log("server:" + data);
  });
});

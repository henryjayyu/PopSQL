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

//Websocket Globals
var Post = require('./models/post.js');

    users_ip = ''
,   str = ''
,   str_parts = ''
,   tags = []
,   adds = []
,   queries = [];

function pushPost() {

  //POST to mongo
  new Post({
    post: str
  , user_ip: users_ip
  , tags: tags
  , adds: adds
  }).save(function (err, callback1) {
    if (err) {
      console.log('Post ERROR!');
    }
    else {
      Post.findOne( { post: str, user_ip : users_ip } ).exec(function (err, callback2) {
        return callback2;
      });
    }
    console.log("this is cb1" + callback1);
    return callback1;
  });


}

function manageSprites(data, users_ip) {
  for(var i = 0; i < data.length; i++) {
    if (data[i].spriteID != '/images/host.png' && data[i].user_ip != users_ip) {
      data[i].spriteID = '/images/guest_b.png';
    }
  }
  return data; 
}

function declareToken(value) {
  console.log("declareToken!");
  if (value.charAt(0).match(/#/)) {
    tags.push(value); //located tag
  }
  else if (value.charAt(0).match(/@/)) {
    adds.push(value); //located add
  }
}

function isToken(value, arg) {
  console.log("isToken!");
  if (arg == '?') {
    value = value.replace(/\?/g, ""); //scrub char(?)
    declareToken(value);
  }
  else {
    declareToken(value);
  }
}

function findTokens(str_parts) {
  var isQuery = 0
  ,   query = 0;

  for (var i = 0; i < str_parts.length; i++) {
    var value = str_parts[i];

    if (isQuery == 0) {
      isToken(value);
      if (value.charAt(0).match(/\?/)) {
        if (i == 0) { 
          //query?
        }
        else { 
          //query include?
        }
        isToken(value, '?');
        isQuery = 1
      , queries[query] = value;
      }
    }

    else {
      isToken(value, '?');
      if (value.charAt(value.length -1).match(/\?/)) {
        queries[query] += ' ' + value
      , query++
      , isQuery = 0;
      }
      else {
        queries[query] += ' ' + value;
      }
    }
  }

  if (queries[0] != undefined) {
    for (var i = 0; i < queries.length; i++) {
      str = str.replace(queries[i], "<query>" + queries[i] + "</query>");
    }
    console.log('Query: FOUND!');
  }

  else {
    console.log('Query: NONE!');
  }

  //POST to mongo
  new Post({
    post: str
  , user_ip: users_ip
  , tags: tags
  , adds: adds
  }).save(function (err) {
    
    if (err) {
      console.log('Post ERROR!');
    }
    else {
      console.log("Post: SUCCESS!");
      Post.findOne( { post: str, user_ip : users_ip } ).exec(function (err, userPost) {
        console.log("Post: CONSTRUCTED!");
        return callback("hello");
      });
    }
  });
}

var test = require('./models/test.js');

io.sockets.on('connection', function (socket) {

  users_ip = socket.handshake.address.address;

  Post.find().limit(5).exec(function (err, post) {
    //initialize feed
    manageSprites(post, users_ip);
    socket.emit('connected', post);
  });

  socket.on('userPost', function (data) {
    console.log("received post: " + data['content']);
    socket.emit('receipt', true); //send receipt

    str = data['content']
  , str_parts = str.split(' ');

    var callback = test.callback(str, function (data) {
      console.log('callback: ' + data);
    });

/*
    findTokens(str_parts, function (callback) {
      if (callback) {
        console.log("callback");
      }
    });
*/    
    //socket.broadcast.emit('newPost', true);
  });
});

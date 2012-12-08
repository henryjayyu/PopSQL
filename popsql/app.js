
/*
 * Module dependencies.
 */

var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')

var app = express();

var mongoose = require('mongoose');

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

app.post('/poll', routes.index_poll);
app.post('/', routes.index_post);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

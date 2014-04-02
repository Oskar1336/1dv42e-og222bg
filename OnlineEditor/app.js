
/**
 * Module dependencies.
 */

var express = require('express'),
    https = require("https"), // @TODO: Implement https
    http = require('http'),
    path = require('path'),
    mongoose = require("mongoose"),
    everyauth = require("./config/everyauthConfig"),
    app = express();

module.exports = {
    app: app,
    everyauth: everyauth
};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({ secret: "keyboard cat" }));
app.use(everyauth.middleware());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

require('./routes');

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

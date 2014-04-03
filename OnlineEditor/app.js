
/**
 * Module dependencies.
 */

var express = require('express');
var https = require("https"); // @TODO: Implement https
var http = require('http');
// var mongoose = require("mongoose");
var app = module.exports = express();

// require("./config/mongodbConfig.js")(app, mongoose); // Database settings.
// var models = {};
// models.User = require("./models/user")(mongoose);
var config = require("./config/config")(app, express);

require('./routes')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

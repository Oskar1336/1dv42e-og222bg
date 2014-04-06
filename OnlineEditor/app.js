

var express = require('express');
var https = require("https"); // @TODO: Implement https
var http = require('http');
var path = require("path");
var mongoose = require("mongoose");

// Database configuration and mongoDB models.
require("./config/mongodbConfig.js")(mongoose); // Database settings.
var models = {};
models.Users = require("./models/user")(mongoose); // require mongoose User model
models.Projects = require("./models/project")(mongoose); // require mongoose Project model
models.Files = require("./models/file")(mongoose); // require mongoose File model

// Passport config.
var passport = require("./config/passportConfig")(models);

var app = module.exports = express();
// App config.
require("./config/config")(app, express, passport);

// Auth routes.
require("./routes/auth")(app, models, passport);
// Index routes
require('./routes')(app);

app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

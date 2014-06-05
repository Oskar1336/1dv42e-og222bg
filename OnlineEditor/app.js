

var express = require('express');
var https = require("https"); // @TODO: Implement https
var http = require('http');
var path = require("path");
var mongoose = require("mongoose");
var S = require("string");

// Database configuration and mongoDB models.
require("./config/mongodbConfig.js")(mongoose); // Database settings.
var models = {};
models.User = require("./models/user")(mongoose); // require mongoose User model
models.Project = require("./models/project")(mongoose); // require mongoose Project model
models.File = require("./models/file")(mongoose); // require mongoose File model
models.Folder = require("./models/folder")(mongoose); // require mongoose Folder model

// Passport config.
var passport = require("./config/passportConfig")(models);

var app = module.exports = express();
// App config.
require("./config/config")(app, express, passport);

// Index routes.
require('./routes')(app);
// Auth routes.
require("./routes/auth")(app, models, passport);
// Project routes.
require("./routes/project")(app, models, S);
// Folder routes.
require("./routes/folder")(app, models);
// File routes.
require("./routes/file")(app, models);
// Github api routes.
require("./routes/github")(app, models);

require("./routes/empty")(app, models);

app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

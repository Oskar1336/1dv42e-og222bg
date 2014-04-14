

var express = require('express');
var https = require("https"); // @TODO: Implement https
var http = require('http');
var path = require("path");
var mongoose = require("mongoose");
var StringValidation = require("string");

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

// Auth routes.
require("./routes/auth")(app, models, passport);
// Index routes
require('./routes')(app);
// Project routes.
require("./routes/project")(app, models, StringValidation);

require("./routes/folder")(app, models);


require("./routes/empty")(app, models);

app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

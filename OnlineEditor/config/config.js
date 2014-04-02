

module.exports = function(app, express, mongoose) {

    var config = this;

    app.requireAuth = true;

    var everyauth = require("./everyauthConfig");

    app.configuration(function() {
        
    });

};

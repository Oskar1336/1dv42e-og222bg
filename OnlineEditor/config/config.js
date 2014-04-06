/*
 * App config file.
 */

module.exports = function(app, express, passport) {
    var path = require('path');

    app.configure(function() {
        app.set('port', process.env.PORT || 3000);
        app.set('views', path.join(__dirname, '../views'));
        app.set('view engine', 'hjs');
        app.use(express.logger('dev'));
        app.use(express.json());
        app.use(express.urlencoded());
        app.use(express.cookieParser());
        app.use(express.methodOverride());
        app.use(express.session({secret: "secretsession"}));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(app.router);
        app.use(express.static(path.join(__dirname, '../public')));

        if ('development' == app.get('env')) {
            app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        }
        if ("production" == app.get("env")) {
            app.use(express.errorHandler());
        }
    });
};

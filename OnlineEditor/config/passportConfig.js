
/*
 * Config for github oauth authentication.
 */

module.exports = function(models) {
    var passport = require("passport");
    var GHStrategy = require("passport-github").Strategy;
    var oauthCreds = require("../models/oauthCreds");

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    passport.use(new GHStrategy({
            clientID: oauthCreds.GITHUB_CLIENT_ID,
            clientSecret: oauthCreds.GITHUB_CLIENT_SECRET,
            callbackURL: oauthCreds.GITHUB_CALLBACKURL
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function() {
                console.log(accessToken);

                // models.User();


                // @TODO: Find and update user or create user.
                return done(null, profile);
            });
        }
    ));
    return passport;
};


/*
 * Config for github oauth authentication.
 */

module.exports = function(models) {
    var passport = require("passport");
    var GHStrategy = require("passport-github").Strategy;
    var oauthCreds = require("../models/oauthCreds");

    var findOrCreateUser = function(profile, accesstoken, callback) {
        models.Users.find({ username: profile.username }, function(err, result) {
            if (result.length <= 0) {
                models.Users.create({
                    username: profile.username,
                    githubId: profile.id,
                    accessToken: accesstoken,
                    name: profile.displayName,
                    email: profile._json.email
                }, function(err, result) {
                    if (err) {
                        callback(err, err ? null : result[0]);
                    } else {
                        callback(null, result[0]);
                    }
                });
            } else {
                callback(err, err ? null : result[0]);
            }
        });
    };

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
                findOrCreateUser(profile, accessToken, function(err, data) {
                    return done(null, data);
                });
            });
        }
    ));
    return passport;
};

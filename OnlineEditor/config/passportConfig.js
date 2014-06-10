
/*
 * Config for github oauth authentication.
 */

module.exports = function(models) {
    var passport = require("passport");
    var GHStrategy = require("passport-github").Strategy;
    var oauthCreds = require("../models/oauthCreds");

    var findOrCreateUser = function(profile, accesstoken, callback) {
        models.User.findOne({ username: profile.username }, function(findErr, user) {
            if (findErr) {
                callback(findErr, null);
            } else {
                if (user === null) {
                    models.User.create({
                        username: profile.username,
                        githubId: profile.id,
                        accessToken: accesstoken,
                        name: profile.displayName,
                        email: profile._json.email
                    }, function(createErr, newUser) {
                        if (createErr) {
                            callback(createErr, null);
                        } else {
                            callback(null, newUser);
                        }
                    });
                } else if (user) {
                    user.accessToken = accesstoken;
                    user.email = profile._json.email;
                    user.name = profile.displayName;
                    user.username = profile.username;
                    user.save(function(saveErr) {
                        if (saveErr) {
                            callback(saveErr, null);
                        } else {
                            callback(null, user);
                        }
                    });
                } else {
                    callback("Error", null);
                }
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
        }, function(accessToken, refreshToken, profile, done) {
            process.nextTick(function() {
                findOrCreateUser(profile, accessToken, function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        return done(null, data);
                    }
                });
            });
        }
    ));
    return passport;
};


/*
 * Config for github oauth authentication.
 */

module.exports = function(models) {
    var passport = require("passport");
    var GHStrategy = require("passport-github").Strategy;
    var oauthCreds = require("../models/oauthCreds");

    var findOrCreateUser = function(profile, accesstoken, callback) {
        models.User.find({ username: profile.username }, function(findErr, users) {
            if (findErr) {
                callback(findErr, null);
            } else {
                if (users.length === 0) {
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
                } else if (users.length === 1) {
                    users[0].accessToken = accesstoken;
                    users[0].email = profile._json.email;
                    users[0].name = profile.displayName;
                    users[0].username = profile.username;
                    users[0].save(function(saveErr) {
                        if (saveErr) {
                            callback(saveErr, null);
                        } else {
                            callback(null, users[0]);
                        }
                    });
                } else {
                    console.log("Major user error!! Row 33");
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
        },
        function(accessToken, refreshToken, profile, done) {
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

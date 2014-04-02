

var everyauth = module.exports = require("everyauth");
var oauthCreds = require("../models/oauthCreds");

everyauth.debug = true;
everyauth.github
    .appId(oauthCreds.GITHUB_CLIENT_ID)
    .appSecret(oauthCreds.GITHUB_CLIENT_SECRET)
    .entryPath("/auth/github")
    .callbackPath("/auth/github/callback")
    .scope("repo")
    .findOrCreateUser(function(sess, accessToken, accessTokenExtra, ghUser) {
        return ghUser;
    })
    .redirectPath("/");

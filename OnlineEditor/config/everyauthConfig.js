

module.exports = function() {
    var everyauth = require("everyauth");
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
    return everyauth;
};



// var checkUser = function(username, accesstoken) {
    //     models.User.find({ username:username },
    //         function(err, result) {
    //             if (!err) {
    //                 if (result.length === 0) {
    //                     models.User.create({ username:username, accessToken: accesstoken },
    //                         function(err, user) {
    //                             return user;
    //                         }
    //                     );
    //                 } else {

    //                 }
    //             }
    //         }
    //     );
    //     console.log("slutet");
    // };
    // 
    // 
    //             // checkUser(ghUser.login, accessToken);

            // models.User.create({ username: ghUser.login, accessToken: accessToken },
            //     function(err, data) {
            //         console.log(data);
            //     }
            // );
            // models.User.find({username: ghUser.login}, function(err, user) {
            //     console.log(user);
            // });

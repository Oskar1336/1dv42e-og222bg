

module.exports = function(app, models, passport) {
    app.get("/auth/github", passport.authenticate("github", {
        scope: ["user", "repo", "delete_repo"]
    }), function(req, res) {});

    app.get("/auth/github/callback", passport.authenticate("github"), function(req, res) {
        console.log("Loggedin");
        res.redirect("/");
    });

    app.get("/logout", function(req, res) {
        req.logout();
        console.log("logged out");
        res.redirect("/");
    });

    app.get("/emptyusertable", function(req, res) {
        // Code for emptying user table
        models.Users.find({}, function(err, docs) {
            res.send(docs);
            for (var i = 0; i < docs.length; i++) {
                docs[i].remove(function(err, user) {
                    console.log("removed");
                });
            }
        });
    });
};

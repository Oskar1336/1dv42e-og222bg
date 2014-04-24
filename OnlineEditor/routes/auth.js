

module.exports = function(app, models, passport) {
    app.get("/auth/github", passport.authenticate("github", {
        scope: ["user", "repo", "delete_repo"]
    }), function(req, res) {});

    app.get("/auth/github/callback", passport.authenticate("github"), function(req, res) {
        res.redirect("/");
    });

    app.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/");
    });
};

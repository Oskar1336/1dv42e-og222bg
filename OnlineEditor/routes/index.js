

module.exports = function(app) {
    app.get("/", function(req, res) {
        if (req.user) {
            res.render("index", { user: req.user } );
        } else {
            res.render("index", { user: null });
        }
    });

    app.get("/test", function(req, res) {
        res.send(req.user);
    });
};

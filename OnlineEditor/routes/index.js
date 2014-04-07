

module.exports = function(app) {
    app.get("/", function(req, res) {
        res.render("index");
    });

    app.get("/test", function(req, res) {
        res.send(req.user);
    });
};

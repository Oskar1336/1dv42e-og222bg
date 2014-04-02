
/*
 * GET home page.
 */

var app = require("../app");

app.app.get("/", function(req, res) {
    res.render("index");
});

app.app.get("/test", function(req, res) {
    res.send(req.user);
});

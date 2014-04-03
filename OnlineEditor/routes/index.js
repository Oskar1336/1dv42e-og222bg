

module.exports = function(app) {
    app.get("/", function(req, res) {
        res.render("index");
    });

    app.get("/test", function(req, res) {
        // models.User.find({}, function(err, docs) {
        //     res.send(docs);
        // });
    });
};


// Code for emptying user table
// models.User.find({}, function(err, docs) {
//     res.send(docs);
//     for (var i = 0; i < docs.length; i++) {
//         docs[i].remove(function(err, user) {
//             console.log("removed");
//         });
//     }
// });

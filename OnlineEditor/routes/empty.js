

module.exports = function(app, models) {
    app.get("/empty", function(req, res) {
        models.User.find({}).exec(function(err, users) {
            console.log("Found users: " + users.length);
            for (var i = 0; i < users.length; i++) {
                models.User.remove({_id: users[i]._id}).exec();
            }
        });
        models.Project.find({}).exec(function(err, projects) {
            console.log("Found projects: " + projects.length);
            for (var i = 0; i < projects.length; i++) {
                models.Project.remove({_id: projects[i]._id}).exec();
            }
        });
        models.File.find({}).exec(function(err, files) {
            console.log("Found files: " + files.length);
            for (var i = 0; i < files.length; i++) {
                models.File.remove({_id: files[i]._id}).exec();
            }
        });
        models.Folder.find({}).exec(function(err, folders) {
            console.log("Found folders: " + folders.length);
            for (var i = 0; i < folders.length; i++) {
                models.Folder.remove({_id: folders[i]._id}).exec();
            }
        });
        res.send("Done");
    });

    app.get("/emptyusers", function(req, res) {
        models.User.find({}).exec(function(err, users) {
            for (var i = 0; i < users.length; i++) {
                models.User.remove({_id: users[i]._id}).exec();
            }
        });
        res.send("Done");
    });

    app.get("/emptyproject", function(req, res) {
        models.Project.find({}).exec(function(err, projects) {
            for (var i = 0; i < projects.length; i++) {
                models.Project.remove({_id: projects[i]._id}).exec();
            }
        });
        res.send("Done");
    });

    app.get("/emptyfiles", function(req, res) {
        models.File.find({}).exec(function(err, files) {
            for (var i = 0; i < files.length; i++) {
                models.File.remove({_id: files[i]._id}).exec();
            }
        });
        res.send("Done");
    });

    app.get("/emptyfolders", function(req, res) {
        models.Folder.find({}).exec(function(err, folders) {
            for (var i = 0; i < folders.length; i++) {
                models.Folder.remove({_id: folders[i]._id}).exec();
            }
        });
        res.send("Done");
    });
};

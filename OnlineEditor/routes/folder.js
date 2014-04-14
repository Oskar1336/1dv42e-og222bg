

module.exports = function(app, models) {
    var helpers = require("../models/helperFunctions");
    var events = require("events");
    var emitter = new events.EventEmitter();

    app.get("/folders/:projectId", helpers.checkIfAuthenticated, function(req, res) {
        models.Folder.find({project: req.params.projectId}).populate("files project").exec(function(err, folders) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                if (helpers.checkIfUserIsAuthorized(req.user, folders[0].project.users)) {
                    res.status(200);
                    res.send(folders);
                } else {
                    res.status(403);
                    res.send({error: "User not authorized to access this project.", statusCode:403});
                }
            }
        });
    });

    app.get("/folder/:id", helpers.checkIfAuthenticated, function(req, res) {
        models.Folder.findById(req.params.id).populate("files project").exec(function(err, folder) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                if (helpers.checkIfUserIsAuthorized(req.user, folder.project.users)) {
                    res.status(200);
                    res.send(folder);
                } else {
                    res.status(403);
                    res.send({error: "User not authorized to access this folder.", statusCode: 403});
                }
            }
        });
    });

    emitter.on("newFolderSaved", function(newFolder, project, res) {
        project.folders.push(newFolder._id);
        project.save(function(err) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                res.status(201);
                res.send({content: newFolder, statusCode: 201});
            }
        });
    });

    emitter.on("projectFound", function(project, newFolder, res) {
        var folder = new models.Folder({
            folderName: newFolder.folderName,
            files: [],
            project: project._id
        });
        folder.save(function(err) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                folder.parent = folder._id;
                folder.save(function(folderupdateerr) {
                    if (folderupdateerr) {
                        res.status(500);
                        res.send({error: folderupdateerr, statusCode: 500});
                    } else {
                        emitter.emit("newFolderSaved", folder, project, res);
                    }
                });
            }
        });
    });

    app.post("/folder/:projectId", helpers.checkIfAuthenticated, function(req, res) {
        models.Project.findById(req.params.projectId, function(err, project) {
            if (helpers.checkIfUserIsAuthorized(req.user, project.users)) {
                emitter.emit("projectFound", project, req.body, res);
            } else {
                res.status(403);
                res.send({error: "User not authorized to access project.", statusCode: 403});
            }
        });
    });

    app.put("/folder/:id", helpers.checkIfAuthenticated, function(req, res) {

    });

    app.delete("/folder/:id", function(req, res) {

    });
};

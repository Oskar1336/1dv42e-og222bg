

module.exports = function(app, models) {
    var S = require("string");
    var authHelpers = require("../models/authHelperFunctions");
    var events = require("events");
    var emitter = new events.EventEmitter();

    // Events
    emitter.on("sendFolder", function(folder, res) {
        models.Folder.populate(folder, {path: "files project folders"}, function(err, resFolder) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                res.status(201);
                res.send(resFolder);
            }
        });
    });

    emitter.on("saveNewFolderToParent", function(newFolder, project, res) {
        models.Folder.findById(newFolder.parent, function(err, folder) {
            folder.folders.push(newFolder._id);
            folder.save(function(err) {
                if (err) {
                    res.status(500);
                    res.send({error: err, statusCode: 500});
                } else {
                    emitter.emit("sendFolder", newFolder, res);
                }
            });
        });
    });

    emitter.on("createFolder", function(project, newFolder, res) {
        var folder = new models.Folder({
            folderName: newFolder.folderName,
            files: [],
            project: project._id,
            parent: newFolder.parent,
            folders: []
        });
        folder.save(function(err) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                emitter.emit("saveNewFolderToParent", folder, project, res);
            }
        });
    });

    // app.get("/folders/:projectId", authHelpers.checkIfAuthenticated, function(req, res) {
    //     models.Folder.find({project: req.params.projectId}).populate("files project folders").exec(function(err, folders) {
    //         if (err) {
    //             res.status(500);
    //             res.send({error: err, statusCode: 500});
    //         } else {
    //             if (authHelpers.checkIfUserIsAuthorized(req.user, folders[0].project.users)) {
    //                 res.status(200);
    //                 res.send(folders);
    //             } else {
    //                 res.status(403);
    //                 res.send({error: "User not authorized to access this project.", statusCode:403});
    //             }
    //         }
    //     });
    // });
    
    app.get("/folder/:id", authHelpers.checkIfAuthenticated, function(req, res) {
        models.Folder.findById(req.params.id).populate("files project folders").exec(function(err, folder) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                if (authHelpers.checkIfUserIsAuthorized(req.user, folder.project.users)) {
                    res.status(200);
                    res.send(folder);
                } else {
                    res.status(403);
                    res.send({error: "User not authorized to access this folder.", statusCode: 403});
                }
            }
        });
    });

    app.post("/folder/:projectId", authHelpers.checkIfAuthenticated, function(req, res) {
        models.Project.findById(req.params.projectId, function(err, project) {
            if (authHelpers.checkIfUserIsAuthorized(req.user, project.users)) {
                emitter.emit("createFolder", project, req.body, res);
            } else {
                res.status(403);
                res.send({error: "User not authorized to access project.", statusCode: 403});
            }
        });
    });

    app.put("/folder/:id", authHelpers.checkIfAuthenticated, function(req, res) {
        models.Folder.findById(req.params.id, function(err, folder) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode:500});
            } else {
                if (folderNameValid(req.body.folderName)) {
                    folder.folderName = req.body.folderName;
                    folder.save();
                    res.status(200);
                    res.send(folder);
                } else {
                    res.status(400);
                    res.send({error: "User not authorized to access current folder", statusCode:400});
                }
            }
        });
    });

    app.delete("/folder/:id", authHelpers.checkIfAuthenticated, function(req, res) {
        models.Folder.findById(req.params.id).populate("project").exec(function(err, folder) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                if (authHelpers.checkIfUserIsAuthorized(req.user, folder.project.users)) {
                    removeFolder(folder._id);
                    res.status(204);
                    res.send("Deleted");
                } else {
                    res.status(403);
                    res.send({error: err, statusCode:403});
                }
            }
        });
    });

    function removeFolder (folderId) {
        models.Folder.findById(folderId, function(err, folder) {
            if (!err && folder) {
                for (var i = 0; i < folder.folders.length; i++) {
                    removeFolder(folder.folders[i]);
                }
                for (var f = 0; f < folder.files.length; f++) {
                    models.File.remove({_id: folder.files[f]}).exec();
                }
                models.Folder.remove({_id: folder._id}).exec();
            }
        });
    }

    function folderNameValid (folderName) {
        var valid = true;
        if (!folderName) {
            valid = false;
        }
        if (S(folderName).stripTags().s !== folderName) {
            valid = false;
        }
        return valid;
    }
};

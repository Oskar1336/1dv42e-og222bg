

module.exports = function(app, models) {
    var helpers = require("../models/helperFunctions");
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

    // @TODO: stop populating project.
    app.get("/folders/:projectId", helpers.checkIfAuthenticated, function(req, res) {
        models.Folder.find({project: req.params.projectId}).populate("files project folders").exec(function(err, folders) {
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
    
    // http://jsfiddle.net/brendanowen/uXbn6/8/
    // http://stackoverflow.com/questions/11854514/is-it-possible-to-make-a-tree-view-with-angular
    app.get("/folder/:id", helpers.checkIfAuthenticated, function(req, res) {
        models.Folder.findById(req.params.id).populate("files project folders").exec(function(err, folder) {
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

    app.post("/folder/:projectId", helpers.checkIfAuthenticated, function(req, res) {
        models.Project.findById(req.params.projectId, function(err, project) {
            if (helpers.checkIfUserIsAuthorized(req.user, project.users)) {
                emitter.emit("createFolder", project, req.body, res);
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

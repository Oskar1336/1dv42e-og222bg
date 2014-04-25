

module.exports = function(app, models) {
    var authHelpers = require("../models/authHelperFunctions");
    var events = require("events");
    var emitter = new events.EventEmitter();
    var S = require("string");

    app.get("/file/:fileId", authHelpers.checkIfAuthenticated, function(req, res) {
        models.File.findById(req.params.fileId).populate("folder").exec(function(err, file) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                if (authHelpers.findProjectAndValidateUser(req.user, file.folder.project, models)) {
                    res.status(200);
                    res.send(file);
                } else {
                    res.status(403);
                    res.send({error: "User not authorized to access file.", statusCode: 403});
                }
            }
        });
    });

    emitter.on("saveNewFileToFolder", function(file, folder, res) {
        models.Folder.findById(folder._id, function(err, folder) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                folder.files.push(file._id);
                folder.save(function(saveErr) {
                    if (saveErr) {
                        res.status(500);
                        res.send({error: saveErr, statusCode: 500});
                    } else {
                        res.status(201);
                        res.send(file);
                    }
                });
            }
        });
    });

    emitter.on("createFile", function(folder, newFile, res) {
        var file = new models.File({
            name: newFile.fileName,
            type: newFile.fileType,
            content: "<html><NL><TAB><head><NL><TAB></head><NL><TAB><body><NL><TAB></body><NL></html>",
            folder: folder._id
        });
        file.save(function(err) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                emitter.emit("saveNewFileToFolder", file, folder, res);
            }
        });
    });

    app.post("/file/:folderId", authHelpers.checkIfAuthenticated, function(req, res) {
        models.Folder.findById(req.params.folderId).populate("project").exec(function(err, folder) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                if (authHelpers.checkIfUserIsAuthorized(req.user, folder.project.users) &&
                    validateFile(req.body)) {
                    emitter.emit("createFile", folder, req.body, res);
                } else {
                    res.status(403);
                    res.send({error: "User not authorized to access folder.", statusCode: 403});
                }
            }
        });
    });

    app.put("/file/:fileId", authHelpers.checkIfAuthenticated, function(req, res) {
        models.File.findById(req.params.fileId).populate("folder").exec(function(err, file) {
            if (err) {

            } else {
                if (authHelpers.findProjectAndValidateUser(req.user, file.folder.project, models)) {
                    if (req.save) {
                        file.content = req.body.content;
                        file.save(function(err) {
                            if (err) {
                                res.status(500);
                                res.send({error: err, statusCode: 500});
                            } else {
                                res.status(200);
                                res.send(file);
                            }
                        });
                    } else if (validateFile(req.body)) {
                        file.name = req.body.fileName;
                        file.type = req.body.fileType;
                        file.save(function(err) {
                            if (err) {
                                res.status(500);
                                res.send({error: err, statusCode: 500});
                            } else {
                                res.status(200);
                                res.send(file);
                            }
                        });
                    } else {
                        res.status(400);
                        res.send({error: "Params missing or not valid", statusCode: 400});
                    }
                } else {
                    res.status(403);
                    res.send({error: "User is not authorized to access file.", statusCode: 403});
                }
            }
        });
    });

    emitter.on("removeFolderReference", function(folderId, fileId, res) {
        models.Folder.findById(folderId, function(err, folder) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                folder.files.splice(folder.files.indexOf(fileId), 1);
                folder.save(function(err) {
                    if (err) {
                        res.status(500);
                        res.send({error: err, statusCode: 500});
                    }
                });
            }
        });
    });

    app.delete("/file/:fileId", authHelpers.checkIfAuthenticated, function(req, res) {
        models.File.findById(req.params.fileId).populate("folder").exec(function(err, file) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                if (authHelpers.findProjectAndValidateUser(req.user, file.folder.project, models)) {
                    emitter.emit("removeFolderReference", file.folder, file._id, res);
                    file.remove(function(err, file) {
                        if (err) {
                            res.status(500);
                            res.send({error: err, statusCode: 500});
                        } else {
                            res.status(204);
                            res.send("File deleted");
                        }
                    });
                } else {
                    res.status(403);
                    res.send({error: "User not authorized to access file.", statusCode: 403});
                }
            }
        });
    });

    function validateFile (file) {
        if (!file.fileName) {
            return false;
        }
        if (!file.fileType) {
            return false;
        }
        if (S(file.fileName).stripTags().s !== file.fileName) {
            return false;
        }
        return true;
    }
};

// @TODO: Implement FTP support
// FTP module
// https://github.com/sergi/jsftp

module.exports = function(app, models, S) {
    var authHelpers = require("../models/authHelperFunctions");
    var request = require("request");
    var events = require("events");
    var emitter = new events.EventEmitter();

    // Route for getting all projects avaiable for current logged user.
    app.get("/projects", authHelpers.checkIfAuthenticated, function(req, res) {
        models.Project.find({users: req.user._id})
                      .populate("owner users rootFolder")
                      .exec(function(err, projects) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                getUserRepos(req.user, function(err, data) {
                    // for (var i = 0; i < data.length; i++) {

                    // }

                    res.status(200);
                    res.send({githubProjects: JSON.parse(data), localProjects: projects, statusCode: 200});
                });
            }
        });
    });
    
    // Route for getting a specific project.
    app.get("/projects/:id", authHelpers.checkIfAuthenticated, function(req, res) {
        models.Project.findById(req.params.id).populate("users rootFolder owner").exec(function(err, project) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                // Check if current user has access to selected project.
                if (authHelpers.checkIfUserIsPartOfProject(req.user, project.users)) {
                    res.status(200);
                    res.send({content: project, statusCode: 200});
                } else {
                    res.status(403);
                    res.send({ error: "User not authorized to access requested project.", statusCode: 403 });
                }
            }
        });
    });

    // Event that sends project to client side.
    emitter.on("sendProject", function(rootFolder, newProject, res) {
        rootFolder.project = newProject._id;
        rootFolder.parent = rootFolder._id;
        rootFolder.save(function(rootFolderErr) {
            if (rootFolderErr) {
                res.status(500);
                res.send({error: rootFolderErr, statusCode: 500});
            } else {
                models.Project.populate(newProject, {path: "owner users rootFolder"}, function(err, project) {
                    if (err) {
                        res.status(500);
                        res.send({error: err, statusCode: 500});
                    } else {
                        res.status(201);
                        res.send({content: project, statusCode: 201});
                    }
                });
            }
        });
    });

    // Event for adding a project to a user.
    emitter.on("addProjectToUser", function(rootFolder, newProject, userId, res) {
        models.User.findById(userId, function(err, user) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                user.projects.push(newProject._id);
                user.save(function(err) {
                    if (err) {
                        res.status(500);
                        res.send({error: err, statusCode: 500});
                    } else {
                        emitter.emit("sendProject", rootFolder, newProject, res);
                    }
                });
            }
        });
    });

    emitter.on("createProjectOnGitHub", function(project, reqBody, rootFolder, user) {
        request({
            url: "https://api.github.com/user/repos",
            method: "POST",
            headers: {
                "User-Agent": "1dv42e-og222bg",
                "Authorization": "token " + user.accessToken
            },
            json: {
                name: project.projectName,
                description: reqBody.description,
                private: reqBody.private,
                homepage: reqBody.homepage,
                auto_init: true
            }
        }, function(err, res, body) {
            if (err) {
                console.log("Error row 105");
            } else {
                project.htmlLink = body.html_url;
                project.githubRepoName = body.name;
                project.save();
            }
        });
    });

    // Event for creating new project.
    emitter.on("createProject", function(rootFolder, newProjectInfo, res, req) {
        var newProject = new models.Project({
            projectName: newProjectInfo.projectName,
            owner: req.user._id,
            users: [ req.user._id ],
            rootFolder: rootFolder._id,
            saveToGithub: req.body.saveToGithub
        });
        newProject.save(function(err) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                if (req.body.saveToGithub) {
                    emitter.emit("createProjectOnGitHub", newProject, req.body, rootFolder, req.user);
                }
                emitter.emit("addProjectToUser", rootFolder, newProject, req.user._id, res);
            }
        });
    });

    // Route for creating new project.
    app.post("/projects", authHelpers.checkIfAuthenticated, function(req, res) {
        if (validateProjectInfo(req.body)) {
            // Create root folder.
            var rootFolder = new models.Folder({
                folderName: req.body.projectName,
                files: [],
                folders: []
            });
            rootFolder.save(function(err) {
                if (err) {
                    res.status(500);
                    res.send({error: err, statusCode: 500});
                } else {
                    emitter.emit("createProject", rootFolder, req.body, res, req);
                }
            });
        } else {
            res.status(400);
            res.send({ error: "Bad request params is not valid.", statusCode: 400 });
        }
    });

    // @TODO: Validate user input.
    // Route for updating project.
    app.put("/projects/:id", authHelpers.checkIfAuthenticated, function(req, res) {
        models.Project.findById(req.params.id, function(err, project) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                if (!authHelpers.checkIfUserIsAuthorized(req.user, project.users)) {
                    res.status(403);
                    res.send({error: "User not authorized to access project", statusCode: 403});
                } else {
                    var updated = false;
                    if (req.body.projectName) {
                        if (validateProjectInfo(req.body)) {
                            project.projectName = req.body.projectName;
                            updated = true;
                        } else {
                            res.status(400);
                            res.send({error: "Bad request params is not valid.", statusCode: 400});
                        }
                    }
                    // @TODO: Implement multiple users per project
                    if (updated) {
                        project.save(function(err) {
                            if (err) {
                                res.status(500);
                                res.send({error: err, statusCode: 500});
                            } else {
                                models.Project.findById(project._id).populate("owner users folders").exec(function(err, project) {
                                    if (err) {
                                        res.status(500);
                                        res.send({error: err, statusCode: 500});
                                    } else {
                                        res.status(200);
                                        res.send(project);
                                    }
                                });
                            }
                        });
                    } else {
                        res.status(400);
                        res.send({error: "Project not updated", statusCode: 400});
                    }
                }
            }
        });
    });

    emitter.on("removeProject", function(projectId, callback) {
        // Delete project.
        models.Project.remove({_id: projectId}).exec(function(err) {
            callback(err, err ? 500 : 204);
        });
    });

    // Route for removing a project.
    app.delete("/projects/:id", authHelpers.checkIfAuthenticated, function(req, res) {
        models.Project.findById(req.params.id, function(err, project) {
            if (S(req.user._id).s === S(project.owner).s) {
                models.Folder.find({project: project._id}, function(foldererr, folders) {
                    for (var i = 0; i < folders.length; i++) {
                        removeFolder(folders[i]);
                    }
                });
                // Remove project reference from project users.
                for (var y = 0; y < project.users.length; y++) {
                    models.User.findById(project.users[y], function(err, user) {
                        user.projects.splice(user.projects.indexOf(project._id), 1);
                        user.save();
                    });
                }

                emitter.emit("removeProject", project._id, function(err, statusCode) {
                    if (err) {
                        res.status(statusCode);
                        res.send({error: err, statusCode: statusCode});
                    } else {
                        res.status(statusCode);
                        res.send({content: "Project deleted", statusCode: statusCode});
                    }
                });
            } else {
                res.status(401);
                res.send({error: "User not authorized to access requested project.", statusCode: 401});
            }
        });
    });

    function validateProjectInfo (project) {
        var valid = true;
        if (!project.projectName) {
            valid = false;
        }
        if (S(project.projectName).stripTags().s !== project.projectName) {
            valid = false;
        }
        models.Project.find({projectName: project.projectName}, function(err, projects) {
            if (projects.length > 0) {
                valid = false;
            }
        });
        return valid;
    }

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

    function getUserRepos (user, callback) {
        request({
            url: "https://api.github.com/user/repos?type=public&sort=updated",
            method: "GET",
            headers: {
                "User-Agent": "1dv42e-og222bg",
                "Authorization": "token " + user.accessToken
            }
        }, function(err, res, body) {
            if (err) {
                callback(err, body);
            } else {
                callback(null, body);
            }
        });
    }
};

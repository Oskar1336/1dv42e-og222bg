

module.exports = function(app, models, StringValidation) {
    var helpers = require("../models/helperFunctions");


    // Route for getting all projects avaiable for current logged user.
    app.get("/projects", helpers.checkIfAuthenticated, function(req, res) {
        models.Project.find({users: req.user._id}).populate("owner users folders").exec(function(err, projects) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                res.status(200);
                res.send({content: projects, statusCode: 200});
            }
        });
    });
    
    // Route for getting a specific project.
    app.get("/projects/:id", helpers.checkIfAuthenticated, function(req, res) {
        models.Project.findById(req.params.id).populate("users folders owner").exec(function(err, project) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                // Check if current user has access to selected project.
                if (helpers.checkIfUserIsPartOfProject(req.user, project.users)) {
                    res.status(200);
                    res.send({content: project, statusCode: 200});
                } else {
                    res.status(403);
                    res.send({ error: "User not authorized to access requested project.", statusCode: 403 });
                }
            }
        });
    });

    // Route for creating new project.
    app.post("/projects", helpers.checkIfAuthenticated, function(req, res) {
        if (validateProjectInfo(req.body)) {
            // Create root folder.
            var rootfolder = new models.Folder({
                folderName: req.body.projectName,
                files: []
            });
            rootfolder.save(function(err) {
                // Create new project with rootfolder and owner.
                var newProject = new models.Project({
                    projectName: req.body.projectName,
                    owner: req.user._id,
                    users: [ req.user._id ],
                    folders: [ rootfolder._id ]
                });
                newProject.save(function(projecterr) {
                    models.User.findById(req.user._id, function(err, user) {
                        if (err) {
                            res.status(500);
                            res.send({error: err, statusCode: 500});
                        } else {
                            user.projects.push(newProject._id);
                            user.save();
                        }
                    });
                    // Adds reference to this project to root folder.
                    rootfolder.project = newProject._id;
                    rootfolder.parent = rootfolder._id;
                    rootfolder.save(function(rootfolderErr) {
                        if (rootfolderErr) {
                            res.status(500);
                            res.send({error: rootfolderErr, statusCode: 500});
                        } else {
                            models.Project.populate(newProject, {path: "owner users folders"}, function(err, project) {
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
            });
        } else {
            res.status(400);
            res.send({ error: "Bad request params is not valid.", statusCode: 400 });
        }
    });

    // Route for updating project.
    app.put("/projects/:id", helpers.checkIfAuthenticated, function(req, res) {
        models.Project.findById(req.params.id, function(err, project) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                if (!helpers.checkIfUserIsAuthorized(req.user, project.users)) {
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
                    // if (req.body.users) {
                    //     if (req.user._id === project.owner) {
                    //         for (var i = 0; i < req.body.users.length; i++) {
                    //             if (req.body.users[i].remove) {
                    //                 project.users.splice(project.users.indexOf(req.body.users[i]._id), 1);
                    //             } else {
                    //                 project.users.push(req.body.users[i]._id);
                    //                 models.User.findById(req.body.users[i]._id, function(err, user) {
                    //                      user.projects.push(project._id);
                    //                      user.save();
                    //                 });
                    //             }
                    //         }
                    //         updated = true;
                    //     } else {
                    //         res.status(403);
                    //         res.send({error: "Forbidden User not allowed to add users to project.", statusCode: 403});
                    //     }
                    // }
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
                    }
                }
            }
        });
    });

    // Route for removing a project.
    app.delete("/projects/:id", helpers.checkIfAuthenticated, function(req, res) {
        models.Project.findById(req.params.id).populate("folders").exec(function(err, project) {
            if (StringValidation(req.user._id).s === StringValidation(project.owner).s) {
                // Remove all folders in project.
                for (var i = 0; i < project.folders.length; i++) {
                    // Delete folder files.
                    for (var x = 0; x < project.folders[i].files.length; x++) {
                        models.File.remove({_id: project.folders[i].files[i]}).exec();
                    }
                    models.Folder.remove({_id: project.folders[i]._id}).exec();
                }
                // Remove project reference from project users.
                for (var y = 0; y < project.users.length; y++) {
                    models.User.findById(project.users[y], function(err, user) {
                        user.projects.splice(user.projects.indexOf(project._id), 1);
                        user.save();
                    });
                }
                // Delete project.
                models.Project.remove({_id: project._id}).exec();

                res.status(204);
                res.send("Project deleted");
            } else {
                res.status(401);
                res.send({error: "User not authorized to access requested project.", statusCode: 401});
            }
        });
    });

    function validateProjectInfo (project) {
        if (!project.projectName) {
            return false;
        }
        if (StringValidation(project.projectName).stripTags().s !== project.projectName) {
            return false;
        }
        return true;
    }
};

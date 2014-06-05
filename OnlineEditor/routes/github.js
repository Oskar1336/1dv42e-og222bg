

module.exports = function(app, models) {
    var authHelpers = require("../models/authHelperFunctions");
    var request = require("request");
    var events = require("events");
    var emitter = new events.EventEmitter();
    
    emitter.on("saveProjectContent", function(newProject, rootFolder, items, accessToken) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].type === "dir") {
                console.log("folder");
                saveFolder(items[i], rootFolder, newProject, accessToken);
            } else if (items[i].type === "file") {
                console.log("file");
                saveFile(items[i], rootFolder, accessToken);
            }
        }
    });

    emitter.on("createGHProject", function(rootFolder, projectName, items, res, user) {
        var newProject = new models.Project({
            projectName: projectName,
            owner: user._id,
            users: [ user._id ],
            rootFolder: rootFolder._id,
            saveToGithub: true
        });
        newProject.save(function(err) {
            if (err) {
                res.status(500);
                res.send({error: err, statusCode: 500});
            } else {
                models.User.findById(user._id, function(err, currentUser) {
                    if (err) {
                        res.status(500);
                        res.send({error: err, statusCode: 500});
                    } else {
                        currentUser.projects.push(newProject._id);
                        currentUser.save();
                    }
                });
                rootFolder.parent = rootFolder._id;
                rootFolder.project = newProject._id;
                rootFolder.save(function(err) {
                    if (err) {
                        res.status(500);
                        res.send({error: err, statusCode: 500});
                    } else {
                        emitter.emit("saveProjectContent", newProject, rootFolder, items, user.accessToken);
                    }
                });
            }
        });
    });

    // Route for importing a Github repository.
    app.post("/loadghproject", authHelpers.checkIfAuthenticated, function(req, res) {
        request({
            url: "https://api.github.com/repos/"+req.user.username+"/"+req.body.projectName+"/contents",
            method: "GET",
            headers: {
                "User-Agent": "1dv42e-og222bg",
                "Authorization": "token "+req.user.accessToken
            }
        }, function(err, response, body) {
            var items = JSON.parse(body);
            console.log(items);
            models.Project.findOne({projectName: req.body.projectName}).populate("users rootFolder owner").exec(function(err, project) {
                if (typeof project === "undefined" || project === null) {
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
                            emitter.emit("createGHProject", rootFolder, req.body.projectName, items, res, req.user);
                        }
                    });
                } else {
                    res.status(200);
                    res.send({content: project, statusCode: 200});
                }
            });
        });
    });

    // Route for commit to github and save all.
    app.put("/commitproject/:id", authHelpers.checkIfAuthenticated, function(req, res) {

    });

    function saveFolder (folder, parentFolder, project, accessToken) {
        var newFolder = new models.Folder({
            folderName: folder.name,
            files: [],
            folders: [],
            githubUrl: folder.url,
            parent: parentFolder._id,
            project: project._id
        });
        newFolder.save(function(err) {
            parentFolder.folders.push(newFolder._id);
            parentFolder.save(function(err) {
                request({
                    url: folder.url,
                    method: "GET",
                    headers: {
                        "User-Agent": "1dv42e-og222bg",
                        "Authorization": "token "+accessToken
                    }
                }, function(err, response, body) {
                    var items = JSON.parse(body);
                    for (var i = 0; i < items.length; i++) {
                        console.log(items[i].type);
                        if (items[i].type === "dir") {
                            saveFolder(items[i], newFolder, project, accessToken);
                        } else if (items[i].type === "file") {
                            saveFile(items[i], newFolder, accessToken);
                        }
                    }
                });
            });
        });
    }

    function saveFile (fileInfo, parentFolder, accessToken) {
        request({
            url: fileInfo.url,
            method: "GET",
            headers: {
                "User-Agent": "1dv42e-og222bg",
                "Authorization": "token "+accessToken
            }
        }, function(err, response, body) {
            var file = JSON.parse(body);
            var newFile = new models.File({
                name: getFileName(file.name),
                type: getFileExtension(file.name),
                content: getFileContent(file.content, file.encoding),
                folder: parentFolder._id
            });
            newFile.save(function(err) {
                models.Folder.findByIdAndUpdate(parentFolder._id, {$push: {files: newFile._id}},
                                                                  {safe: true, upsert: true}).exec();
            });
        });
    }

    function getFileContent (content, encoding) {
        if (typeof content !== "undefined") {
            var utfArray = new Buffer(content, encoding).toString().split("\n");
            var contentArray = [];
            for (var i = 0; i < utfArray.length; i++) {
                contentArray.push(replaceToCustomXML(utfArray[i]));
            }
            return contentArray;
        } else {
            return [""];
        }
    }

    function replaceToCustomXML (string) {
        string = string.replace(/\t/g, "<TAB>");
        string = string.replace(/ /g, "<SPACE>");
        return string;
    }

    function getFileName (fileName) {
        if (typeof fileName !== "undefined") {
            return fileName.split(".")[0];
        } else {
            return "";
        }
    }

    function getFileExtension (fileName) {
        if (typeof fileName !== "undefined") {
            return fileName.split(".").pop();
        }  else {
            return "";
        }
    }
};

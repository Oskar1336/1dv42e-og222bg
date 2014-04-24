

angular.module("OnlineEditor.Editor").controller("EditorCtrl", ["$scope", "$rootScope", "$cookieStore", "$modal", "$compile", "$location", "FolderFactory", "AlertFactory", "FileFactory",
    function($scope, $rootScope, $cookieStore, $modal, $compile, $location, FolderFactory, AlertFactory, FileFactory) {
        "use strict";
        $scope.showFolders = {};
        $rootScope.subfolders = {};
        $rootScope.folderFiles = {};

        $scope.project = $rootScope.selectedProject;
        $rootScope.$watch("selectedProject", function() {
            $scope.project = $rootScope.selectedProject;
        });
        if (typeof $scope.project === "undefined" || $scope.project === null) {
            $location.path("/projects");
        }

        FolderFactory.getById($scope.project.rootFolder._id).success(function(data) {
            $scope.project.rootFolder = data;
            $rootScope.selectedProject = $scope.project;
        }).error(function(error) {
            console.log(error);
        });

        $scope.expandFolder = function(folder) {
            $rootScope.subfolders[folder._id] = [];
            $rootScope.folderFiles[folder._id] = [];
            if ($scope.showFolders[folder._id]) { // Hide subfolders.
                $scope.showFolders[folder._id] = false;
            } else { // Show subfolders.
                for (var i = 0; i < folder.folders.length; i++) {
                    if (typeof folder.folders[i] === "object") {
                        $rootScope.subfolders[folder._id].push(folder.folders[i]);
                    } else if (typeof folder.folders[i] === "string") {
                        // @TODO: Cache folders.
                        FolderFactory.getById(folder.folders[i]).success(function(data) {
                            $rootScope.subfolders[folder._id].push(data);
                        }).error(function(error) {
                            console.log(error);
                        });
                    }
                }
                for (var x = 0; x < folder.files.length; x++) {
                    if (typeof folder.files[x] === "object") {
                        $rootScope.folderFiles[folder._id].push(folder.files[x]);
                    } else if (typeof folder.files[x] === "string") {
                        FileFactory.getById(folder.files[x]).success(function(data) {
                            $rootScope.folderFiles[folder._id].push(data);
                        }).error(function(error) {
                            console.log(error);
                        });
                    }
                }
                $scope.showFolders[folder._id] = true;
            }
        };

        $scope.removeFolder = function(folder) {
            if (confirm("Are you sure you want to delete " + folder.folderName + "?")) {
                FolderFactory.deleteFolder(folder._id).success(function(data) {
                    var rootIndex = $scope.project.rootFolder.folders.indexOf(folder);
                    if (rootIndex !== -1) {
                        $scope.project.rootFolder.folders.splice(rootIndex, 1);
                    } else {
                        $rootScope.subfolders[folder.parent]
                            .splice($rootScope.subfolders[folder.parent].indexOf(folder), 1);
                    }
                }).error(function(error) {
                    console.log(error);
                });
            }
        };

        $scope.removeFile = function(file) {
            var parentId = "";
            if (typeof file.folder === "object") {
                parentId = file.folder._id;
            } else {
                parentId = file.folder;
            }

            if (confirm("Are you sure you want to delete " + file.name + "?")) {
                FileFactory.deleteFile(file._id).success(function(data) {
                    var rootIndex = $scope.project.rootFolder.files.indexOf(file);
                    if (rootIndex !== -1) {
                        $scope.project.rootFolder.files.splice(rootIndex, 1);
                    } else {
                        $rootScope.folderFiles[parentId]
                            .splice($rootScope.folderFiles[parentId].indexOf(file), 1);
                    }
                }).error(function(error) {
                    console.log(error);
                });
            }
        };

        $scope.initAddFile = function(folder) {
            var modalInstance = $modal.open({
                templateUrl: "app/Editor/Views/CreateFolderTemplate.html",
                controller: AddFileCtrl,
                resolve: {
                    folder: function() {
                        return folder;
                    }
                }
            });
        };

        var AddFileCtrl = function($scope, $modalInstance, $rootScope, folder) {
            $scope.isFolder = false;
            $scope.newFile = {};
            $scope.supportedLangs = [{
                    name: "JavaScript",
                    value: "js"
                }, {
                    name: "HTML",
                    value: "html"
                }, {
                    name: "CSS",
                    value: "css"
                }, {
                    name: "PHP",
                    value: "php"
                }
            ];

            $scope.saveFile = function() {
                if (valid()) {
                    FileFactory.createFile($scope.newFile, folder._id).success(function(data) {
                        if (data.folder === $rootScope.selectedProject.rootFolder._id) {
                            $rootScope.selectedProject.rootFolder.files.push(data);
                        } else {
                            $rootScope.folderFiles[data.folder].push(data);
                        }
                        $modalInstance.close();
                    }).error(function(error) {
                        console.log(error);
                    });
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };

            var valid = function() {
                var valid = true;
                if (!$scope.newFile.fileName) {
                    valid = false;
                    AlertFactory.showMessage("File name is not valid", "alert-danger", "createAlertBox");
                }
                if (!$scope.newFile.fileType) {
                    valid = false;
                    AlertFactory.showMessage("File type is not valid", "alert-danger", "createAlertBox");
                }
                return valid;
            };
        };

        $scope.initEditFolder = function(folder) {
            var modalInstance = $modal.open({
                templateUrl: "app/Editor/Views/CreateFolderTemplate.html",
                controller: EditFolderCtrl,
                resolve: {
                    folder: function() {
                        return folder;
                    }
                }
            });
        };

        var EditFolderCtrl = function($scope, $modalInstance, $rootScope, folder) {
            $scope.isFolder = true;
            $scope.newFolder = {};
            $scope.newFolder.folderName = folder.folderName;

            $scope.saveFolder = function() {
                if (valid()) {
                    FolderFactory.updateFolder($scope.newFolder, folder._id).success(function(data) {
                        var rootIndex = $rootScope.selectedProject.rootFolder.folders.indexOf(folder);
                        if (rootIndex !== -1) {
                            $rootScope.selectedProject.rootFolder.folders[rootIndex].folderName = $scope.newFolder.folderName;
                        } else {
                            $rootScope.subfolders[folder.parent][$rootScope.subfolders[folder.parent].indexOf(folder)].folderName = $scope.newFolder.folderName;
                        }
                        $modalInstance.close();
                    }).error(function(error) {
                        console.log(error);
                    });
                } else {
                    AlertFactory.showMessage("Folder name is not valid", "alert-danger", "createAlertBox");
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };

            var valid = function() {
                var valid = true;

                return valid;
            };
        };

        $scope.initAddFolder = function(parentId) {
            var modalInstance = $modal.open({
                templateUrl: "app/Editor/Views/CreateFolderTemplate.html",
                controller: CreateFolderInstanceCtrl,
                resolve: {
                    parentId: function() {
                        if (parentId) {
                            return parentId;
                        } else {
                            return $scope.project.rootFolder._id;
                        }
                    },
                    project: function() {
                        return $scope.project;
                    }
                }
            });
        };

        var CreateFolderInstanceCtrl = function($scope, $modalInstance, $rootScope, parentId, project) {
            $scope.isFolder = true;
            $scope.newFolder = {};

            $scope.saveFolder = function() {
                $scope.newFolder.parent = parentId;
                if (valid()) {
                    FolderFactory.createFolder($scope.newFolder, project._id).success(function(data) {
                        if (parentId === $rootScope.selectedProject.rootFolder._id) {
                            $rootScope.selectedProject.rootFolder.folders.push(data);
                        } else {
                            $rootScope.subfolders[parentId].push(data);
                        }
                        $modalInstance.close();
                    }).error(function(error) {
                        console.log(error);
                    });
                } else {
                    AlertFactory.showMessage("Folder name is not valid", "alert-danger", "createAlertBox");
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };

            var valid = function() {
                var valid = true;
                return valid;
            };
        };
    }
]);

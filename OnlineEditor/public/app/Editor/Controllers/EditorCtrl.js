

angular.module("OnlineEditor.Editor").controller("EditorCtrl", ["$scope", "$rootScope", "$cookieStore", "$modal", "$compile", "FolderFactory", "AlertFactory",
    function($scope, $rootScope, $cookieStore, $modal, $compile, FolderFactory, AlertFactory) {
        "use strict";
        $scope.showFolders = {};
        $scope.subfolders = {};

        $scope.project = $rootScope.selectedProject;
        $rootScope.$watch("selectedProject", function() {
            $scope.project = $rootScope.selectedProject;
        });

        FolderFactory.getById($scope.project.rootFolder._id).success(function(data) {
            $scope.project.rootFolder = data;
            $rootScope.selectedProject = $scope.project;
        }).error(function(error) {
            console.log(error);
        });

        $scope.expandFolder = function(folder) {
            if ($scope.showFolders[folder._id]) { // Hide subfolders.
                $scope.showFolders[folder._id] = false;
            } else { // Show subfolders.
                $scope.subfolders[folder._id] = [];
                for (var i = 0; i < folder.folders.length; i++) {
                    if (typeof folder.folders[i] === "object") {
                        $scope.subfolders[folder._id].push(folder.folders[i]);
                    } else if (typeof folder.folders[i] === "string") {
                        // @TODO: Cache folders.
                        FolderFactory.getById(folder.folders[i]).success(function(data) {
                            $scope.subfolders[folder._id].push(data);
                        }).error(function(error) {
                            console.log(error);
                        });
                    }
                }
                $scope.showFolders[folder._id] = true;
            }
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
            $scope.newFolder = {};

            $scope.saveFolder = function() {
                $scope.newFolder.parent = parentId;
                if (validate()) {
                    FolderFactory.createFolder($scope.newFolder, project._id).success(function(data) {
                        console.log(data);
                        if (parentId === $scope.project.rootFolder._id) {
                            $rootScope.selectedProject.rootFolder.folders.push(data);
                        } else {
                            $scope.subfolders[parentId].push(data);
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

            var validate = function() {
                var valid = true;

                return valid;
            };
        };

        var findFolder = function(folderId) {
            // Loop throug every folder and subfolders and find a specific folder.
        };
    }
]);

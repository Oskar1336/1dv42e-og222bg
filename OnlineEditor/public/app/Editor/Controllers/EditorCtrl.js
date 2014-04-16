

angular.module("OnlineEditor.Editor").controller("EditorCtrl", ["$scope", "$rootScope", "$cookieStore", "$modal", "$compile", "FolderFactory", "AlertFactory",
    function($scope, $rootScope, $cookieStore, $modal, $compile, FolderFactory, AlertFactory) {
        "use strict";
        $scope.showFolders = {};

        $scope.project = $rootScope.selectedProject;
        $rootScope.$watch("selectedProject", function() {
            $scope.project = $rootScope.selectedProject;
        });

        FolderFactory.getById($scope.project.rootFolder._id).success(function(data) {
            $scope.project.rootFolder = data;
            $rootScope.selectedProject = $scope.project;
            console.log($scope.project);
        }).error(function(error) {
            console.log(error);
        });

        $scope.expandFolder = function(folder, index) {
            if ($scope.showFolders[folder._id]) {
                $scope.showFolders[folder._id] = false;
            } else {
                $scope.showFolders[folder._id] = true;
            }
        };

        $scope.initAddFolder = function(parentId, index) {
            console.log(index);
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
                    },
                    folderIndex: function() {
                        return index;
                    }
                }
            });
        };

        var CreateFolderInstanceCtrl = function($scope, $modalInstance, $rootScope, parentId, project, folderIndex) {
            $scope.newFolder = {};

            $scope.saveFolder = function() {
                $scope.newFolder.parent = parentId;
                if (validate()) {
                    FolderFactory.createFolder($scope.newFolder, project._id).success(function(data) {
                        findFolder(parentId);
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

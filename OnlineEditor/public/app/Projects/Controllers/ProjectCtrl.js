

angular.module("OnlineEditor.Projects").controller("ProjectCtrl", ["$scope", "$rootScope", "$modal", "ProjectFactory", "AlertFactory",
    function($scope, $rootScope, $modal, ProjectFactory, AlertFactory) {

        $scope.projects = $rootScope.projects;
        $rootScope.$watch("projects", function() {
            $scope.projects = $rootScope.projects;
        });
        $scope.newProject = {};

        ProjectFactory.get().success(function(data) {
            $rootScope.projects = data.content;
        }).error(function(error) {
            AlertFactory.showMessage("Something went wrong when fetching your projects, try to relode page.", "alert-danger", "createAlertBox");
        });

        $scope.deleteProject = function(project) {
            if (confirm("Are you sure you want to delete " + project.projectName + "?")) {
                ProjectFactory.delete(project._id).success(function(data) {
                    $scope.projects.splice($scope.projects.indexOf(project), 1);
                }).error(function(error) {
                    console.log(error);
                });
            }
        };

        $scope.loadProject = function(project) {
            $rootScope.selectedProject = project;
        };

        var checkIfValid = function(project) {
            var valid = true;
            if (!project.projectName) {
                AlertFactory.showMessage("A project name is required.", "alert-danger", "createAlertBox");
                valid = false;
            }
            return valid;
        };

        $scope.openCreateEditProjectModal = function(project) {
            var modalInstance = null;
            if (project === null) {
                modalInstance = $modal.open({
                    templateUrl: "app/Projects/Views/CreateProjectTemplate.html",
                    controller: CreateProjectInstanceCtrl
                });
            } else {
                modalInstance = $modal.open({
                    templateUrl: "app/Projects/Views/CreateProjectTemplate.html",
                    controller: EditProjectInstanceCtrl,
                    resolve: {
                        project: function() {
                            return project;
                        }
                    }
                });
            }
        };

        var EditProjectInstanceCtrl = function($scope, $modalInstance, $rootScope, project) {
            $scope.newProject = project;
            $scope.ifEdit = true;

            $scope.updateProject = function() {
                if (checkIfValid($scope.newProject)) {
                    ProjectFactory.update($scope.newProject).success(function(data) {
                        $modalInstance.close("Done");
                    }).error(function(error) {
                        AlertFactory.showMessage("Something went wrong when trying to update project.", "alert-danger", "createAlertBox");
                    });
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };
        };

        var CreateProjectInstanceCtrl = function($scope, $modalInstance, $rootScope) {
            $scope.newProject = {};
            $scope.ifEdit = false;

            $scope.createProject = function() {
                if (checkIfValid($scope.newProject)) {
                    ProjectFactory.insert($scope.newProject).success(function(data) {
                        $rootScope.projects.push(data.content);
                        $modalInstance.close("Done");
                    }).error(function(error) {
                        AlertFactory.showMessage("Something went wrong when trying to create project.", "alert-danger", "createAlertBox");
                    });
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };
        };
    }
]);

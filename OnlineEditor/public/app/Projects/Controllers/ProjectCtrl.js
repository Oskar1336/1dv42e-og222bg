

angular.module("OnlineEditor.Projects").controller("ProjectCtrl", ["$scope", "$rootScope", "$modal", "$location", "ProjectFactory", "AlertService",
    function($scope, $rootScope, $modal, $location, ProjectFactory, AlertService) {
        $scope.showLoader = false;
        $scope.newProject = {};
        // Shows loader if there is no projects.
        if (typeof $rootScope.projects === "undefined" || typeof $rootScope.githubProjects === "undefined") {
            $scope.showLoader = true;
        }

        ProjectFactory.get().success(function(data) {
            $scope.showLoader = false;
            $rootScope.projects = data.localProjects;
            $rootScope.githubProjects = data.githubProjects;
        }).error(function(error) {
            $scope.showLoader = false;
            AlertService.showMessage("Something went wrong when fetching your projects, try to relode page.", "alert-danger", "projectAlertBox");
        });

        $scope.deleteProject = function(project) {
            var ending = "?";
            if (project.saveToGithub) {
                ending = "?(This does not remove the Github repository)";
            }
            AlertService.showPopUp("Delete project", "Are you sure you want to delete " + project.projectName + ending, function(ok) {
                if (ok) {
                    ProjectFactory.delete(project._id).success(function(data) {
                        $rootScope.projects.splice($rootScope.projects.indexOf(project), 1);
                    }).error(function(error) {
                        AlertService.showMessage("Something went wrong when deleting project, try again.", "alert-danger", "projectAlertBox");
                    });
                }
            });
        };

        $scope.loadGHProject = function(project) {
            ProjectFactory.loadGHProject({
                id: project.id,
                projectName: project.name,
                contents_url: project.contents_url,
                fullProjectName: project.full_name,
                user: {
                    username: project.owner.login,
                    id: project.owner.id
                }
            }).success(function(data) {
                if (typeof data.content._id !== "undefined") {
                    $rootScope.selectedProject = data.content;
                    $location.path("editor/"+data.content._id);
                } else {

                }
            }).error(function(error) {
                AlertService.showMessage("Something went wrong when importing Github repository, try to import again.", "alert-danger", "projectAlertBox");
            });
        };

        $scope.loadProject = function(project) {
            $rootScope.selectedProject = project;
        };

        var checkIfValid = function(project) {
            var valid = true;
            if (!project.projectName) {
                AlertService.showMessage("A project name is required.", "alert-danger", "createAlertBox");
                valid = false;
            }
            return valid;
        };

        $scope.openCreateEditProjectModal = function(project, ghProject) {
            var modalInstance = null;
            if (project === null) {
                modalInstance = $modal.open({
                    templateUrl: "app/Projects/Views/CreateProjectTemplate.html",
                    controller: CreateProjectInstanceCtrl,
                    resolve: {
                        ghProject: function() {
                            return ghProject;
                        }
                    }
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
            $scope.newProject.saveToGithub = true;
            $scope.ifEdit = true;

            $scope.updateProject = function() {
                if (checkIfValid($scope.newProject)) {
                    ProjectFactory.update($scope.newProject).success(function(data) {
                        $modalInstance.close("Done");
                    }).error(function(error) {
                        AlertService.showMessage("Something went wrong when trying to update project.", "alert-danger", "createAlertBox");
                    });
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };
        };

        var CreateProjectInstanceCtrl = function($scope, $modalInstance, $rootScope, ghProject) {
            $scope.newProject = {};
            $scope.newProject.saveToGithub = ghProject;
            $scope.ifEdit = false;

            $scope.createProject = function() {
                if (checkIfValid($scope.newProject)) {
                    ProjectFactory.insert($scope.newProject).success(function(data) {
                        $rootScope.projects.push(data.content);
                        $modalInstance.close("Done");
                    }).error(function(error) {
                        AlertService.showMessage("Something went wrong when trying to create project.", "alert-danger", "createAlertBox");
                    });
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };
        };
    }
]);

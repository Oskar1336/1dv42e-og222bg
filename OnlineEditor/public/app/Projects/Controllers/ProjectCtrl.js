

angular.module("OnlineEditor.Projects").controller("ProjectCtrl", ["$scope", "$rootScope", "$modal", "ProjectFactory", "AlertService",
    function($scope, $rootScope, $modal, ProjectFactory, AlertService) {

        $scope.projects = $rootScope.projects;
        $rootScope.$watch("projects", function() {
            $scope.projects = $rootScope.projects;
        });
        $rootScope.$watch("githubProjects", function() {
            $scope.githubProjects = $rootScope.githubProjects;
        });
        $scope.newProject = {};

        ProjectFactory.get().success(function(data) {
            console.log(data);
            $rootScope.projects = data.localProjects;
            $rootScope.githubProjects = data.githubProjects;
        }).error(function(error) {
            AlertService.showMessage("Something went wrong when fetching your projects, try to relode page.", "alert-danger", "createAlertBox");
        });

        $scope.deleteProject = function(project) {
            AlertService.showPopUp("Delete project", "Are you sure you want to delete " + project.projectName + "?",
                                   function(ok) {
                if (ok) {
                    ProjectFactory.delete(project._id).success(function(data) {
                        $scope.projects.splice($scope.projects.indexOf(project), 1);
                    }).error(function(error) {
                        console.log(error);
                    });
                }
            });
        };

        $scope.deleteGHProject = function(project) {
            console.log(project);
            AlertService.showPopUp("Delete project", "Are you sure you want to delete " + project.projectName +
                                   "?(The Github repo will also be removed)", function(ok) {
                if (ok) {
                    ProjectFactory.delete(project._id).success(function(data) {
                        $scope.projects.splice($scope.projects.indexOf(project), 1);
                    }).error(function(error) {
                        console.log(error);
                    });
                }
            });
        };

        $scope.loadGHProject = function(project) {
            var tempProject = {
                id: project.id,
                projectName: project.name,
                contents_url: project.contents_url,
                fullProjectName: project.full_name,
                user: {
                    username: project.owner.login,
                    id: project.owner.id
                }
            };

            ProjectFactory.loadGHProject(tempProject).success(function(data) {
                console.log(data);
            }).error(function(error) {
                console.log(error);
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

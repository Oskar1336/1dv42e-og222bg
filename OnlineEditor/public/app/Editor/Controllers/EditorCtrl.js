

angular.module("OnlineEditor.Editor").controller("EditorCtrl", ["$scope", "$rootScope", "$cookieStore", "FolderFactory",
    function($scope, $rootScope, $cookieStore, FolderFactory) {
        "use strict";
        $scope.project = $rootScope.selectedProject;
        $rootScope.$watch("selectedProject", function() {
            $scope.project = $rootScope.selectedProject;
        });

        FolderFactory.getProjectFolders($scope.project._id).success(function(data) {
            $scope.project.folders = data;
            console.log($scope.project);
        }).error(function(error) {
            console.log(error);
        });
    }
]);

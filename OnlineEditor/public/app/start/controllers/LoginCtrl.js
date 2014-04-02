

angular.module("OnlineEditor").controller("LoginCtrl", ["$scope", "$rootScope", "$route", "$http",
    function($scope, $rootScope, $route, $http) {
        "use strict";

        $scope.loginWithGitHub = function() {
            $http({
                method: "GET",
                url: "/test"
            }).success(function(data) {
                console.log(data);
            }).error(function(error) {
                console.log("error");
            });
        };
    }
]);

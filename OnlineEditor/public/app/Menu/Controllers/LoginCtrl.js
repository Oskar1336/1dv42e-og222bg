

angular.module("OnlineEditor.Menu").controller("LoginCtrl", ["$scope", "$rootScope",
    function($scope, $rootScope) {
        "use strict";

        var checkIfLoggedin = function() {
            return $("#53479ae199").html().length > 0;
        };
        $scope.loggedin = checkIfLoggedin();
    }
]);

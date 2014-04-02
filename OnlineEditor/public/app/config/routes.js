/*
    Config file
 */

angular.module("OnlineEditor").config(["$routeProvider",
    function($routeProvider) {
        "use strict";

        $routeProvider.when("/", {
            templateUrl: "/app/start/views/startTemplate.html"
        }).otherwise({
            redirectTo: "/"
        });
    }
]);

/*
 * Config file
 */

angular.module("OnlineEditor").config(["$routeProvider",
    function($routeProvider) {
        "use strict";

        $routeProvider.when("/", {
            templateUrl: "/app/Start/Views/StartTemplate.html",
            controller: "InitStartCtrl"
        }).when("/projects", {
            templateUrl: "/app/Projects/Views/ProjectsTemplate.html",
            controller: "InitStartCtrl"
        }).when("/editor/:id", {
            templateUrl: "/app/Editor/Views/CodeEditTemplate.html",
            controller: "InitEditorCtrl"
        }).otherwise({
            redirectTo: "/"
        });
    }
]);

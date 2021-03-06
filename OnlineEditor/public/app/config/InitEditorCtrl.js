

angular.module("OnlineEditor").controller("InitEditorCtrl", ["$rootScope", "$location",
    function($rootScope, $location) {
        "use strict";
        $("body").css("background-color", "#333333");
        $(".code-content").css("width", window.innerWidth-300+"px");
        $(".left-side-bar").css("height", window.innerHeight-30+"px");
        $(".open-files").css("width", window.innerWidth-300+"px");
        window.onresize = function(e) {
            $(".code-content").css("width", window.innerWidth-300+"px");
            $(".left-side-bar").css("height", window.innerHeight-30+"px");
            $(".open-files").css("width", window.innerWidth-300+"px");
        };
        
        if ($("#53479ae199").html() === "") {
            // Checks if user is loggedin otherwise the user is redirected to the github auth.
            $location.path("/auth/github");
        } else if (typeof $rootScope.selectedProject === "undefined" || $rootScope.selectedProject === null) {
            // Checks if there is a project otherwise user is redirected to the projects page.
            $location.path("/projects");
        }
    }
]);

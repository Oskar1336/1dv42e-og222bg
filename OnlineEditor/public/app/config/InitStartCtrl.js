

angular.module("OnlineEditor").controller("InitStartCtrl", ["$route",
    function($route) {
        "use strict";
        $("body").removeAttr("style");
        if ($route.current.templateUrl === "/app/Projects/Views/ProjectsTemplate.html") {
            if ($("#53479ae199").html() === "") {
                window.location = "/auth/github";
            }
        }
        $(document).unbind("keypres");
    }
]);



angular.module("OnlineEditor").controller("InitEditorCtrl", [
    function() {
        "use strict";
        $("body").css("background-color", "#403333");
        if ($("#53479ae199").html() === "") {
            window.location = "/auth/github";
        }
    }
]);

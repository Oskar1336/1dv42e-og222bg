

angular.module("OnlineEditor.Alert").service("AlertFactory", [function() {
        "use strict";
        this.showMessage = function(message, type, divID) {
            $("#"+divID).removeClass("hidden")
                .addClass(type)
                .append(message + "<br />")
                .delay(5000).fadeOut(300, function() {
                    $("#"+divID).removeAttr("style")
                        .removeClass(type)
                        .addClass("hidden")
                        .empty();
                });
        };
    }
]);

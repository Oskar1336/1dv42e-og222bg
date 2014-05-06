

angular.module("OnlineEditor.Alert").service("AlertService", ["$modal", function($modal) {
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
        this.showPopUp = function(title, message, callback) {
            var modalInstance = $modal.open({
                templateUrl: "app/Alert/Views/PopupModalTemplate.html",
                controller: PopupInstanceCtrl,
                resolve: {
                    title: function() {
                        return title;
                    },
                    message: function() {
                        return message;
                    },
                    callback: function() {
                        return callback;
                    }
                }
            });
        };

        var PopupInstanceCtrl = function($scope, $modalInstance, title, message, callback) {
            $scope.message = message;
            $scope.title = title;
            $scope.close = function() {
                $modalInstance.close();
                callback(true);
            };
            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
                callback(false);
            };
        };
    }
]);

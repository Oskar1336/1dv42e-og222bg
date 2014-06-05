

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
        this.showPopUp = function(title, content, callback, popuplink) {
            var popup = "app/Alert/Views/PopupModalTemplate.html";
            if (popuplink === null) {
                popup = popuplink;
            }
            var modalInstance = $modal.open({
                templateUrl: popup,
                controller: PopupInstanceCtrl,
                resolve: {
                    title: function() {
                        return title;
                    },
                    content: function() {
                        return content;
                    },
                    callback: function() {
                        return callback;
                    }
                }
            });
        };

        var PopupInstanceCtrl = function($scope, $modalInstance, title, content, callback) {
            $scope.content = content;
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



angular.module("OnlineEditor.Editor").controller("CodeCtrl", ["$scope", "$rootScope", "$sce", "$location", "AlertService", "FileFactory", "EditorHelpers",
    function($scope, $rootScope, $sce, $location, AlertService, FileFactory, EditorHelpers) {
        "use strict";
        $rootScope.rows = [{
            text: "",
            rowLength: 0
        }];
        $rootScope.currentPos = { row: 0, char: 0 };
        EditorHelpers.bindKeydown();

        // Public scope functions.
        $scope.stringToChars = function(string) {
            var tempStrig = EditorHelpers.replaceHtmlCodes(string.text);
            var t = tempStrig.split("");
            t.push("");
            return t;
        };

        $scope.checkMarkerPosition = function(parentIndex, index) {
            if ($rootScope.currentPos.row === parentIndex && $rootScope.currentPos.char === index) {
                return true;
            }
            return false;
        };

        $scope.moveMarkerToPos = function(parentIndex, index) {
            $rootScope.currentPos = {
                row: parentIndex,
                char: index
            };
        };

        $scope.toTrustHtml = function(html) {
            return $sce.trustAsHtml(html);
        };
    }
]);

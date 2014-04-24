

angular.module("OnlineEditor.Editor").controller("CodeCtrl", ["$scope", "$rootScope",
    function($scope, $rootScope) {
        "use strict";
        $scope.rows = {};
    }
]);



// <!-- use <pre> if not html code https://developer.mozilla.org/en-US/docs/Web/HTML/Element/pre -->
//         <div>&lt;html&gt;</div>
//         <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;head&gt;</div>
//         <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;/head&gt;</div>
//         <div>&nbsp;&nbsp;&nbsp;&nbsp;</div>
//         <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;body&gt;</div>
//         <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;div&gt;</div>
//         <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hej</div>
//         <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/div&gt;</div>
//         <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;/body&gt;</div>
//         <div>&lt;/html&gt;</div>



angular.module("OnlineEditor.Editor").factory("FileFactory", ["$http",
    function($http) {
        "use strict";
        return {
            getById: function(fileId) {
                return $http({
                    method: "GET",
                    url: "/file/"+fileId
                });
            },
            createFile: function(file, folderId) {
                return $http({
                    method: "POST",
                    url: "/file/"+folderId,
                    data: file
                });
            },
            saveFile: function(content, fileId) {
                var data = {};
                data.content = content;
                data.save = true;
                return $http({
                    method: "PUT",
                    url: "/file/"+fileId,
                    data: data
                });
            },
            updateFile: function(file, fileId) {
                return $http({
                    method: "PUT",
                    url: "/file/"+fileId,
                    data: file
                });
            },
            deleteFile: function(fileId) {
                return $http({
                    method: "DELETE",
                    url: "/file/"+fileId
                });
            }
        };
    }
]);

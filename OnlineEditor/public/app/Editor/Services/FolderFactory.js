

angular.module("OnlineEditor.Editor").factory("FolderFactory", ["$http",
    function($http) {
        "use strict";
        return {
            getProjectFolders: function(projectId) {
                return $http({
                    method: "GET",
                    url: "/folders/"+projectId
                });
            },
            getById: function(folderId) {
                return $http({
                    method: "GET",
                    url: "/folder/"+folderId
                });
            },
            createFolder: function(folder, projectId) {
                return $http({
                    method: "POST",
                    url: "/folder/"+projectId,
                    data: folder
                });
            },
            updateFolder: function(folder, folderId) {
                return $http({
                    method: "PUT",
                    url: "/folder/"+folderId,
                    data: folder
                });
            },
            deleteFolder: function(folderId) {
                return $http({
                    method: "DELETE",
                    url: "/folder/"+folderId
                });
            }
        };
    }
]);

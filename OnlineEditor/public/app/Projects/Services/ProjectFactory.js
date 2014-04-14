

angular.module("OnlineEditor.Projects").factory("ProjectFactory", ["$http",
    function($http) {
        "use strict";
        return {
            // @TODO: Implement caching. $cacheFactory
            get: function() {
                return $http({
                    method: "GET",
                    url: "/projects"
                });
            },
            getById: function(id) {
                return $http({
                    method: "GET",
                    url: "/projects/"+id
                });
            },
            delete: function(id) {
                return $http({
                    method: "DELETE",
                    url: "/projects/"+id
                });
            },
            insert: function(project) {
                return $http({
                    method: "POST",
                    url: "/projects",
                    data: project
                });
            },
            update: function(project) {
                return $http({
                    method: "PUT",
                    url: "/projects/"+project._id,
                    data: project
                });
            }
        };
    }
]);

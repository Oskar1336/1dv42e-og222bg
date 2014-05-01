

angular.module("OnlineEditor.Editor").controller("EditorCtrl", ["$scope", "$rootScope", "$sce", "$modal", "$location", "FolderFactory", "AlertFactory", "FileFactory",
    function($scope, $rootScope, $sce, $modal, $location, FolderFactory, AlertFactory, FileFactory) {
        "use strict";
        $rootScope.subfolders = {};
        $rootScope.folderFiles = {};
        $scope.showFolders = {};
        $scope.openFiles = [];
        $scope.openFile = null;
        $scope.rows = [{
            text: "",
            rowLength: 0
        }];
        $scope.currentPos = { row: 0, char: 0 };

        $scope.project = $rootScope.selectedProject;
        $rootScope.$watch("selectedProject", function() {
            $scope.project = $rootScope.selectedProject;
        });
        // Checks if there is a project otherwise user is redirected to the projects page.
        if (typeof $scope.project === "undefined" || $scope.project === null) {
            $location.path("/projects");
        }
        // Get project rootfolder.
        FolderFactory.getById($scope.project.rootFolder._id).success(function(data) {
            $scope.project.rootFolder = data;
            $rootScope.selectedProject = $scope.project;
        }).error(function(error) {
            console.log(error);
        });

        var joinStringArray = function(array) {
            var string = "";
            for (var i = 0; i < array.length; i++) {
                string += array[i];
            }
            return string;
        };

        var replaceHtmlCodes = function(string) {
            string = string.replace(/&nbsp;/g, " ");
            string = string.replace(/&lt;/g, "<");
            string = string.replace(/&gt;/g, ">");
            return string;
        };

        var convertToHtmlCodes = function(string) {
            string = string.replace(/ /g, "&nbsp;");
            string = string.replace(/</g, "&lt;");
            string = string.replace(/>/g, "&gt;");
            return string;
        };

        var pushCharToString = function(char) {
            var tempString = replaceHtmlCodes($scope.rows[$scope.currentPos.row].text);
            var charArray = tempString.split("");
            charArray.splice($scope.currentPos.char, 0, char);
            $scope.$apply(function() {
                $scope.rows[$scope.currentPos.row].text = convertToHtmlCodes(joinStringArray(charArray));
                $scope.rows[$scope.currentPos.row].rowLength++;
                $scope.currentPos.char++;
            });
        };

        var replaceHtmlCodesToCustomXML = function(string) {
            string = string.replace(/&nbsp;&nbsp;/g, "<TAB>");
            string = string.replace(/&nbsp;/g, "<SPACE>");
            string = string.replace(/&lt;/g, "<");
            string = string.replace(/&gt;/g, ">");
            return string;
        };

        var convertCustomXMLToHTMLCodes = function(string) {
            string = string.replace(/<TAB>/g, "&nbsp;&nbsp;");
            string = string.replace(/<SPACE>/g, "&nbsp;");
            return string;
        };

        $(document).keydown(function(event) {
            var tempString = "";
            var charArray = [];
            if (event.which !== 116 && (event.which >= 48 && event.which <= 226) && event.shiftKey === false && event.ctrlKey === false && event.altKey === false) {
                event.preventDefault();
                if (event.which === 187) {
                    pushCharToString("+");
                } else if (event.which === 188) {
                    pushCharToString(",");
                } else if (event.which === 189) {
                    pushCharToString("-");
                } else if (event.which === 190) {
                    pushCharToString(".");
                } else if (event.which === 191) {
                    pushCharToString("'");
                } else if (event.which === 226) {
                    pushCharToString("<");
                } else {
                    pushCharToString(String.fromCharCode(event.which).toLowerCase());
                }
            } else if (event.which !== 116 && (event.which >= 48 && event.which <= 226) && event.shiftKey === true && event.ctrlKey === false && event.altKey === false) {
                event.preventDefault();
                if (event.which === 49) {
                    pushCharToString("!");
                } else if (event.which === 50) {
                    pushCharToString("\"");
                } else if (event.which === 51) {
                    pushCharToString("#");
                } else if (event.which === 52) {
                    pushCharToString("¤");
                } else if (event.which === 53) {
                    pushCharToString("%");
                } else if (event.which === 54) {
                    pushCharToString("&");
                } else if (event.which === 55) {
                    pushCharToString("/");
                } else if (event.which === 56) {
                    pushCharToString("(");
                } else if (event.which === 57) {
                    pushCharToString(")");
                } else if (event.which === 48) {
                    pushCharToString("=");
                } else if (event.which === 187) {
                    pushCharToString("?");
                } else if (event.which === 188) {
                    pushCharToString(";");
                } else if (event.which === 189) {
                    pushCharToString("_");
                } else if (event.which === 190) {
                    pushCharToString(":");
                } else if (event.which === 191) {
                    pushCharToString("*");
                } else if (event.which === 226) {
                    pushCharToString(">");
                } else {
                    pushCharToString(String.fromCharCode(event.which));
                }
            } else if (event.which !== 116 && (event.which >= 48 && event.which <= 226) && event.shiftKey === false && event.ctrlKey === true && event.altKey === true) {
                event.preventDefault();
                if (event.which === 55) {
                    pushCharToString("{");
                } else if (event.which === 56) {
                    pushCharToString("[");
                } else if (event.which === 57) {
                    pushCharToString("]");
                } else if (event.which === 48) {
                    pushCharToString("}");
                } else if (event.which === 187) {
                    pushCharToString("\\");
                } else if (event.which === 226) {
                    pushCharToString("|");
                }
            } else if (event.which === 83 && event.shiftKey === false && event.ctrlKey === true && event.altKey === false) {
                event.preventDefault();
                if (typeof $scope.openFile === "object") {
                    var stringArray = [];
                    
                    for (var i = 0; i < $scope.rows.length; i++) {
                        stringArray.push(replaceHtmlCodesToCustomXML($scope.rows[i].text));
                    }

                    FileFactory.saveFile(stringArray, $scope.openFile._id).success(function(data) {
                        console.log(data);
                    }).error(function(error) {
                        console.log(error);
                    });
                }
            }
            // Tab
            if (event.which === 9) {
                event.preventDefault();
                tempString = replaceHtmlCodes($scope.rows[$scope.currentPos.row].text);
                charArray = tempString.split("");
                for (var i = 0; i < 2; i++) {
                    charArray.splice($scope.currentPos.char, 0, " ");
                }
                $scope.$apply(function() {
                    $scope.rows[$scope.currentPos.row].text = convertToHtmlCodes(joinStringArray(charArray));
                    $scope.rows[$scope.currentPos.row].rowLength += 2;
                    $scope.currentPos.char += 2;
                });
            }
            // Enter
            if (event.which === 13) {
                event.preventDefault();
                $scope.$apply(function() {
                    $scope.rows.splice($scope.currentPos.row+1, 0, {
                        text: "",
                        rowLength: 0
                    });
                    $scope.currentPos.row++;
                    $scope.currentPos.char = 0;
                });
            }
            // Backspace
            if (event.which === 8) {
                event.preventDefault();
                if ($scope.currentPos.char > 0) {
                    tempString = replaceHtmlCodes($scope.rows[$scope.currentPos.row].text);
                    charArray = tempString.split("");
                    charArray.splice($scope.currentPos.char-1, 1);
                    $scope.$apply(function() {
                        $scope.rows[$scope.currentPos.row].text = convertToHtmlCodes(joinStringArray(charArray));
                        $scope.rows[$scope.currentPos.row].rowLength--;
                        $scope.currentPos.char--;
                    });
                } else {
                    $scope.$apply(function() {
                        $scope.rows.splice($scope.currentPos.row, 1);
                        if ($scope.currentPos.row !== 0) {
                            $scope.currentPos.row--;
                        }
                        if ($scope.rows.length === 0) {
                            $scope.rows.push({
                                text: "",
                                rowLength: 0
                            });
                        }
                    });
                }
            }
            // Space
            if (event.which === 32) {
                event.preventDefault();
                pushCharToString(" ");
            }
            // Left arrow
            if (event.which === 37) {
                event.preventDefault();
                $scope.$apply(function() {
                    if ($scope.currentPos.char > 0) {
                        $scope.currentPos.char--;
                    }
                });
            }
            // Right arrow
            if (event.which === 39) {
                event.preventDefault();
                $scope.$apply(function() {
                    if ($scope.currentPos.char < $scope.rows[$scope.currentPos.row].rowLength+1) {
                        $scope.currentPos.char++;
                    }
                });
            }
            // Up arrow
            if (event.which === 38) {
                event.preventDefault();
                $scope.$apply(function() {
                    if ($scope.currentPos.row > 0) {
                        $scope.currentPos.row--;
                        if ($scope.currentPos.char > $scope.rows[$scope.currentPos.row].text.length-1) {
                            $scope.currentPos.char = $scope.rows[$scope.currentPos.row].text.length-1;
                        }
                    }
                });
            }
            // Down arrow
            if (event.which === 40) {
                event.preventDefault();
                $scope.$apply(function() {
                    if ($scope.currentPos.row < $scope.rows.length-1) {
                        $scope.currentPos.row++;
                        if ($scope.currentPos.char > $scope.rows[$scope.currentPos.row].text.length-1) {
                            $scope.currentPos.char = $scope.rows[$scope.currentPos.row].text.length-1;
                        }
                    }
                });
            }
            // Home
            if (event.which === 36) {
                event.preventDefault();
                $scope.$apply(function() {
                    $scope.currentPos.char = 0;
                });
            }
            // End
            if (event.which === 35) {
                event.preventDefault();
                $scope.$apply(function() {
                    $scope.currentPos.char = $scope.rows[$scope.currentPos.row].rowLength+1;
                });
            }
        });

        var fileExists = function(fileId, folderId) {
            for (var i = 0; i < $rootScope.folderFiles[folderId].length; i++) {
                if ($rootScope.folderFiles[folderId][i]._id === fileId) {
                    return true;
                }
            }
            return false;
        };

        var folderExists = function(folderId, parentId) {
            for (var i = 0; i < $rootScope.subfolders[parentId].length; i++) {
                if ($rootScope.subfolders[parentId][i]._id === folderId) {
                    return true;
                }
            }
            return false;
        };

        var loadSubFolders = function(folder) {
            if (typeof $rootScope.subfolders[folder._id] === "undefined") {
                $rootScope.subfolders[folder._id] = [];
            }
            for (var i = 0; i < folder.folders.length; i++) {
                if (typeof folder.folders[i] === "object") {
                    if (!folderExists(folder.folders[i]._id, folder._id)) {
                        $rootScope.subfolders[folder._id].push(folder.folders[i]);
                    }
                } else if (typeof folder.folders[i] === "string") {
                    if (!folderExists(folder.folders[i], folder._id)) {
                        FolderFactory.getById(folder.folders[i]).success(function(data) {
                            $rootScope.subfolders[folder._id].push(data);
                        }).error(function(error) {
                            console.log(error);
                        });
                    }
                }
            }
        };

        var loadFiles = function(folder) {
            if (typeof $rootScope.folderFiles[folder._id] === "undefined") {
                $rootScope.folderFiles[folder._id] = [];
            }
            for (var x = 0; x < folder.files.length; x++) {
                if (typeof folder.files[x] === "object") {
                    if (!fileExists(folder.files[x]._id, folder._id)) {
                        $rootScope.folderFiles[folder._id].push(folder.files[x]);
                    }
                } else if (typeof folder.files[x] === "string") {
                    if (!fileExists(folder.files[x], folder._id)) {
                        FileFactory.getById(folder.files[x]).success(function(data) {
                            $rootScope.folderFiles[folder._id].push(data);
                        }).error(function(error) {
                            console.log(error);
                        });
                    }
                }
            }
        };

        $scope.expandFolder = function(folder) {
            if ($scope.showFolders[folder._id]) { // Hide subfolders.
                $scope.showFolders[folder._id] = false;
            } else { // Show subfolders.
                loadSubFolders(folder);
                loadFiles(folder);
                $scope.showFolders[folder._id] = true;
            }
        };

        $scope.stringToChars = function(string) {
            var tempStrig = replaceHtmlCodes(string.text);
            var t = tempStrig.split("");
            t.push("");
            return t;
        };

        $scope.checkMarkerPosition = function(parentIndex, index) {
            if ($scope.currentPos.row === parentIndex && $scope.currentPos.char === index) {
                return true;
            }
            return false;
        };

        $scope.toTrustHtml = function(html) {
            return $sce.trustAsHtml(html);
        };

        $scope.loadFile = function(file) {
            if ($scope.openFile === null || $scope.openFile._id !== file._id) {
                $scope.rows = [];
                $scope.openFile = file;
                $scope.currentPos = { row: 0, char: 0 };

                for (var i = 0; i < file.content.length; i++) {
                    var row = convertCustomXMLToHTMLCodes(file.content[i]);
                    $scope.rows.push({
                        text: row,
                        rowLength: replaceHtmlCodes(row).length-1
                    });
                }
            }
        };

        $scope.removeFolder = function(folder) {
            if (confirm("Are you sure you want to delete " + folder.folderName + "?")) {
                FolderFactory.deleteFolder(folder._id).success(function(data) {
                    var rootIndex = $scope.project.rootFolder.folders.indexOf(folder);
                    if (rootIndex !== -1) {
                        $scope.project.rootFolder.folders.splice(rootIndex, 1);
                    } else {
                        $rootScope.subfolders[folder.parent]
                            .splice($rootScope.subfolders[folder.parent].indexOf(folder), 1);
                    }
                }).error(function(error) {
                    console.log(error);
                });
            }
        };

        $scope.removeFile = function(file) {
            if ($scope.openFile._id === file._id) {
                $scope.openFile = {};
            }
            var parentId = "";
            if (typeof file.folder === "object") {
                parentId = file.folder._id;
            } else {
                parentId = file.folder;
            }

            if (confirm("Are you sure you want to delete " + file.name + "?")) {
                FileFactory.deleteFile(file._id).success(function(data) {
                    var rootIndex = $scope.project.rootFolder.files.indexOf(file);
                    if (rootIndex !== -1) {
                        $scope.project.rootFolder.files.splice(rootIndex, 1);
                    } else {
                        $rootScope.folderFiles[parentId]
                            .splice($rootScope.folderFiles[parentId].indexOf(file), 1);
                    }
                }).error(function(error) {
                    console.log(error);
                });
            }
        };

        $scope.initEditFile = function(file) {
            var modalInstance = $modal.open({
                templateUrl: "app/Editor/Views/CreateItemTemplate.html",
                controller: EditFileCtrl,
                resolve: {
                    file: function() {
                        return file;
                    }
                }
            });
        };

        var EditFileCtrl = function($scope, $modalInstance, $rootScope, file) {
            $scope.isFolder = false;
            $scope.newFile = {
                fileName: file.name,
                fileType: file.type
            };
            $scope.supportedLangs = [{
                    name: "JavaScript",
                    value: "js"
                }, {
                    name: "HTML",
                    value: "html"
                }, {
                    name: "CSS",
                    value: "css"
                }, {
                    name: "PHP",
                    value: "php"
                }
            ];

            $scope.saveFile = function() {
                if (valid()) {
                    FileFactory.updateFile($scope.newFile, file._id).success(function(data) {
                        var rootIndex = $rootScope.selectedProject.rootFolder.files.indexOf(file);
                        if (rootIndex !== -1) {
                            $rootScope.selectedProject.rootFolder.files[rootIndex] = data;
                        } else {
                            $rootScope.folderFiles[data.folder._id][$rootScope.folderFiles[data.folder._id].indexOf(file)] = data;
                        }
                        $modalInstance.close();
                    }).error(function(error) {
                        console.log(error);
                    });
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };

            var valid = function() {
                var valid = true;
                if (!$scope.newFile.fileName) {
                    valid = false;
                    AlertFactory.showMessage("File name is not valid", "alert-danger", "createAlertBox");
                }
                if (!$scope.newFile.fileType) {
                    valid = false;
                    AlertFactory.showMessage("File type is not valid", "alert-danger", "createAlertBox");
                }
                return valid;
            };
        };

        $scope.initAddFile = function(folder) {
            var modalInstance = $modal.open({
                templateUrl: "app/Editor/Views/CreateItemTemplate.html",
                controller: AddFileCtrl,
                resolve: {
                    folder: function() {
                        return folder;
                    }
                }
            });
        };

        var AddFileCtrl = function($scope, $modalInstance, $rootScope, folder) {
            $scope.isFolder = false;
            $scope.newFile = {};
            $scope.supportedLangs = [{
                    name: "JavaScript",
                    value: "js"
                }, {
                    name: "HTML",
                    value: "html"
                }, {
                    name: "CSS",
                    value: "css"
                }, {
                    name: "PHP",
                    value: "php"
                }
            ];

            $scope.saveFile = function() {
                if (valid()) {
                    FileFactory.createFile($scope.newFile, folder._id).success(function(data) {
                        if (data.folder === $rootScope.selectedProject.rootFolder._id) {
                            $rootScope.selectedProject.rootFolder.files.push(data);
                        } else {
                            if (typeof $rootScope.folderFiles[data.folder] === "undefined") {
                                $rootScope.folderFiles[data.folder] = [];
                            }
                            $rootScope.folderFiles[data.folder].push(data);
                        }
                        $modalInstance.close();
                    }).error(function(error) {
                        console.log(error);
                    });
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };

            var valid = function() {
                var valid = true;
                if (!$scope.newFile.fileName) {
                    valid = false;
                    AlertFactory.showMessage("File name is not valid", "alert-danger", "createAlertBox");
                }
                if (!$scope.newFile.fileType) {
                    valid = false;
                    AlertFactory.showMessage("File type is not valid", "alert-danger", "createAlertBox");
                }
                return valid;
            };
        };

        $scope.initEditFolder = function(folder) {
            var modalInstance = $modal.open({
                templateUrl: "app/Editor/Views/CreateItemTemplate.html",
                controller: EditFolderCtrl,
                resolve: {
                    folder: function() {
                        return folder;
                    }
                }
            });
        };

        var EditFolderCtrl = function($scope, $modalInstance, $rootScope, folder) {
            $scope.isFolder = true;
            $scope.newFolder = {};
            $scope.newFolder.folderName = folder.folderName;

            $scope.saveFolder = function() {
                if (valid()) {
                    FolderFactory.updateFolder($scope.newFolder, folder._id).success(function(data) {
                        var rootIndex = $rootScope.selectedProject.rootFolder.folders.indexOf(folder);
                        if (rootIndex !== -1) {
                            $rootScope.selectedProject.rootFolder.folders[rootIndex].folderName = $scope.newFolder.folderName;
                        } else {
                            $rootScope.subfolders[folder.parent][$rootScope.subfolders[folder.parent].indexOf(folder)].folderName = $scope.newFolder.folderName;
                        }
                        $modalInstance.close();
                    }).error(function(error) {
                        console.log(error);
                    });
                } else {
                    AlertFactory.showMessage("Folder name is not valid", "alert-danger", "createAlertBox");
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };

            var valid = function() {
                var valid = true;

                return valid;
            };
        };

        $scope.initAddFolder = function(parentId) {
            var modalInstance = $modal.open({
                templateUrl: "app/Editor/Views/CreateItemTemplate.html",
                controller: CreateFolderInstanceCtrl,
                resolve: {
                    parentId: function() {
                        if (parentId) {
                            return parentId;
                        } else {
                            return $scope.project.rootFolder._id;
                        }
                    },
                    project: function() {
                        return $scope.project;
                    }
                }
            });
        };

        var CreateFolderInstanceCtrl = function($scope, $modalInstance, $rootScope, parentId, project) {
            $scope.isFolder = true;
            $scope.newFolder = {};

            $scope.saveFolder = function() {
                $scope.newFolder.parent = parentId;
                if (valid()) {
                    FolderFactory.createFolder($scope.newFolder, project._id).success(function(data) {
                        if (parentId === $rootScope.selectedProject.rootFolder._id) {
                            $rootScope.selectedProject.rootFolder.folders.push(data);
                        } else {
                            $rootScope.subfolders[parentId].push(data);
                        }
                        $modalInstance.close();
                    }).error(function(error) {
                        console.log(error);
                    });
                } else {
                    AlertFactory.showMessage("Folder name is not valid", "alert-danger", "createAlertBox");
                }
            };

            $scope.cancel = function() {
                $modalInstance.dismiss("Cancel");
            };

            var valid = function() {
                var valid = true;
                return valid;
            };
        };
    }
]);

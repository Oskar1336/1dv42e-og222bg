

angular.module("OnlineEditor.Editor").controller("CodeCtrl", ["$scope", "$rootScope", "$sce", "$location", "AlertService", "FileFactory",
    function($scope, $rootScope, $sce, $location, AlertService, FileFactory) {
        "use strict";
        $scope.openFile = null;
        $scope.rows = [{
            text: "",
            rowLenght: 0
        }];
        $rootScope.$watch("fileContent", function() {
            $scope.rows = $rootScope.fileContent;
            $scope.currentPos = { row: 0, char: 0 };
        });
        $scope.currentPos = { row: 0, char: 0 };

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

        // Function for binding keydown event.
        var bindKeydown = function() {
            $(document).bind("keydown", function(event) {
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
                    // Ctrl+s Save current file
                    event.preventDefault();
                    if ($scope.openFile !== null) {
                        var stringArray = [];
                        
                        for (var i = 0; i < $scope.rows.length; i++) {
                            stringArray.push(replaceHtmlCodesToCustomXML($scope.rows[i].text));
                        }

                        FileFactory.saveFile(stringArray, $scope.openFile._id).success(function(data) {
                            openedFiles[data._id] = data;
                        }).error(function(error) {
                            console.log(error);
                        });
                    } else {
                        console.log("Show new file window with a chance to select were to save it");
                    }
                }
                // Tab
                if (event.which === 9) {
                    event.preventDefault();
                    tempString = replaceHtmlCodes($scope.rows[$scope.currentPos.row].text);
                    charArray = tempString.split("");
                    for (var t = 0; t < 2; t++) {
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
                        } else if($scope.currentPos.row > 0) {
                            $scope.currentPos.row--;
                            $scope.currentPos.char = $scope.rows[$scope.currentPos.row].rowLength+1;
                        }
                    });
                }
                // Right arrow
                if (event.which === 39) {
                    event.preventDefault();
                    $scope.$apply(function() {
                        if ($scope.currentPos.char < $scope.rows[$scope.currentPos.row].rowLength+1) {
                            $scope.currentPos.char++;
                        } else {
                            $scope.currentPos.row++;
                            $scope.currentPos.char = 0;
                        }
                    });
                }
                // Up arrow
                if (event.which === 38) {
                    event.preventDefault();
                    $scope.$apply(function() {
                        if ($scope.currentPos.row > 0) {
                            $scope.currentPos.row--;
                            if ($scope.currentPos.char > $scope.rows[$scope.currentPos.row].rowLength+1) {
                                $scope.currentPos.char = $scope.rows[$scope.currentPos.row].rowLength+1;
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
                            if ($scope.currentPos.char > $scope.rows[$scope.currentPos.row].rowLength+1) {
                                $scope.currentPos.char = $scope.rows[$scope.currentPos.row].rowLength+1;
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
        };
        bindKeydown();

        var joinStringArray = function(array) {
            var string = "";
            for (var i = 0; i < array.length; i++) {
                string += array[i];
            }
            return string;
        };

        var convertToHtmlCodes = function(string) {
            string = string.replace(/ /g, "&nbsp;");
            string = string.replace(/</g, "&lt;");
            string = string.replace(/>/g, "&gt;");
            return string;
        };

        var replaceHtmlCodes = function(string) {
            string = string.replace(/&nbsp;/g, " ");
            string = string.replace(/&lt;/g, "<");
            string = string.replace(/&gt;/g, ">");
            return string;
        };

        var replaceHtmlCodesToCustomXML = function(string) {
            string = string.replace(/&nbsp;&nbsp;/g, "<TAB>");
            string = string.replace(/&nbsp;/g, "<SPACE>");
            string = string.replace(/&lt;/g, "<");
            string = string.replace(/&gt;/g, ">");
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


    }
]);

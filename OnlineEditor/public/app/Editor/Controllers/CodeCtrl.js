

angular.module("OnlineEditor.Editor").controller("CodeCtrl", ["$scope", "$rootScope", "$sce", "$location", "AlertService", "FileFactory",
    function($scope, $rootScope, $sce, $location, AlertService, FileFactory) {
        "use strict";
        $scope.rows = [{
            text: "",
            rowLength: 0
        }];
        $rootScope.$watch("rows", function() {
            if (typeof $rootScope.rows !== "undefined" && $rootScope.rows !== null) {
                $scope.rows = $rootScope.rows;
                $scope.currentPos = { row: 0, char: 0 };
            }
        });
        $scope.currentPos = { row: 0, char: 0 };
        $rootScope.$watch("currentPos", function() {
            if (typeof $rootScope.currentPos !== "undefined" && $rootScope.currentPos !== null) {
                $scope.currentPos = $rootScope.currentPos;
            }
        });

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
                    // Ctrl+s Saving file.
                    event.preventDefault();
                    if ($rootScope.openFile !== null) {
                        var stringArray = [];
                        for (var i = 0; i < $scope.rows.length; i++) {
                            stringArray.push(replaceHtmlCodesToCustomXML($scope.rows[i].text));
                        }
                        FileFactory.saveFile(stringArray, $rootScope.openFile._id).success(function(data) {
                            $rootScope.openedFiles[data._id] = data;
                        }).error(function(error) {
                            console.log(error);
                        });
                    }
                }
                // Tab
                else if (event.which === 9) {
                    event.preventDefault();
                    if (event.shiftKey === true) {
                        tempString = replaceHtmlCodes($scope.rows[$scope.currentPos.row].text);
                        charArray = tempString.split("");
                        for (var t = 0; t < 4; t++) {
                            charArray.splice($scope.currentPos.char, 0, " ");
                        }
                        $scope.$apply(function() {
                            $scope.rows[$scope.currentPos.row].text = convertToHtmlCodes(joinStringArray(charArray));
                            $scope.rows[$scope.currentPos.row].rowLength -= 4;
                            $scope.currentPos.char -= 4;
                        });
                    } else {
                        tempString = replaceHtmlCodes($scope.rows[$scope.currentPos.row].text);
                        charArray = tempString.split("");
                        for (var t = 0; t < 4; t++) {
                            charArray.splice($scope.currentPos.char, 0, " ");
                        }
                        $scope.$apply(function() {
                            $scope.rows[$scope.currentPos.row].text = convertToHtmlCodes(joinStringArray(charArray));
                            $scope.rows[$scope.currentPos.row].rowLength += 4;
                            $scope.currentPos.char += 4;
                        });
                    }
                }
                // Enter
                else if (event.which === 13) {
                    event.preventDefault();
                    if ($scope.rows[$scope.currentPos.row].rowLength === $scope.currentPos.char) {
                        // New empty row
                        $scope.$apply(function() {
                            $scope.rows.splice($scope.currentPos.row+1, 0, {
                                text: "",
                                rowLength: 0
                            });
                            $scope.currentPos.row++;
                            $scope.currentPos.char = 0;
                        });
                    } else {
                        // New row with content after marker
                        var tempText = replaceHtmlCodes($scope.rows[$scope.currentPos.row].text);
                        var textArray = tempText.split("");
                        var textBefore = "";
                        var textAfter = "";
                        for (var i = 0; i < $scope.currentPos.char; i++) {
                            textBefore += textArray[i];
                        }
                        for (var i = $scope.currentPos.char; i < textArray.length; i++) {
                            textAfter += textArray[i];
                        }
                        $scope.$apply(function() {
                            $scope.rows[$scope.currentPos.row] = {
                                text: convertToHtmlCodes(textBefore),
                                rowLength: textBefore.length
                            };
                            $scope.rows.splice($scope.currentPos.row+1, 0, {
                                text: convertToHtmlCodes(textAfter),
                                rowLength: textAfter.length
                            });
                            $scope.currentPos.row++;
                            $scope.currentPos.char = 0;
                        });
                    }
                }
                // Backspace
                else if (event.which === 8) {
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
                    } else if ($scope.rows[$scope.currentPos.row].rowLength > 0) {
                        $scope.$apply(function() {
                            if ($scope.currentPos.row !== 0) {
                                var remainingText = $scope.rows[$scope.currentPos.row].text;
                                $scope.currentPos.row--;
                                $scope.currentPos.char = $scope.rows[$scope.currentPos.row].rowLength;
                                $scope.rows[$scope.currentPos.row].text += remainingText;
                                $scope.rows[$scope.currentPos.row].rowLength += replaceHtmlCodes(remainingText).length;
                                $scope.rows.splice($scope.currentPos.row+1, 1);
                            }
                        });
                    } else {
                        $scope.$apply(function() {
                            $scope.rows.splice($scope.currentPos.row, 1);
                            if ($scope.currentPos.row !== 0) {
                                $scope.currentPos.row--;
                                $scope.currentPos.char = $scope.rows[$scope.currentPos.row].rowLength;
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
                else if (event.which === 32) {
                    event.preventDefault();
                    pushCharToString(" ");
                }
                // Left arrow
                else if (event.which === 37) {
                    event.preventDefault();
                    $scope.$apply(function() {
                        if ($scope.currentPos.char > 0) {
                            $scope.currentPos.char--;
                        } else if($scope.currentPos.row > 0) {
                            $scope.currentPos.row--;
                            $scope.currentPos.char = $scope.rows[$scope.currentPos.row].rowLength;
                        }
                    });
                }
                // Right arrow
                else if (event.which === 39) {
                    event.preventDefault();
                    $scope.$apply(function() {
                        if ($scope.currentPos.char < $scope.rows[$scope.currentPos.row].rowLength) {
                            $scope.currentPos.char++;
                        } else if ($scope.currentPos.row < $scope.rows.length-1) {
                            $scope.currentPos.row++;
                            $scope.currentPos.char = 0;
                        }
                    });
                }
                // Up arrow
                else if (event.which === 38) {
                    event.preventDefault();
                    $scope.$apply(function() {
                        if ($scope.currentPos.row > 0) {
                            $scope.currentPos.row--;
                            if ($scope.currentPos.char > $scope.rows[$scope.currentPos.row].rowLength) {
                                $scope.currentPos.char = $scope.rows[$scope.currentPos.row].rowLength;
                            }
                        }
                    });
                }
                // Down arrow
                else if (event.which === 40) {
                    event.preventDefault();
                    $scope.$apply(function() {
                        if ($scope.currentPos.row < $scope.rows.length-1) {
                            $scope.currentPos.row++;
                            if ($scope.currentPos.char > $scope.rows[$scope.currentPos.row].rowLength) {
                                $scope.currentPos.char = $scope.rows[$scope.currentPos.row].rowLength;
                            }
                        }
                    });
                }
                // Delete
                else if (event.which === 46) {
                    event.preventDefault();
                    if ($scope.currentPos.char < $scope.rows[$scope.currentPos.row].rowLength) {
                        tempString = replaceHtmlCodes($scope.rows[$scope.currentPos.row].text);
                        charArray = tempString.split("");
                        charArray.splice($scope.currentPos.char, 1);
                        $scope.$apply(function() {
                            $scope.rows[$scope.currentPos.row].text = convertToHtmlCodes(joinStringArray(charArray));
                            $scope.rows[$scope.currentPos.row].rowLength--;
                        });
                    } else if ($scope.currentPos.row !== $scope.rows.length-1) {
                        var textBelow = $scope.rows[$scope.currentPos.row+1].text;
                        $scope.$apply(function() {
                            $scope.rows[$scope.currentPos.row].text += textBelow;
                            $scope.rows[$scope.currentPos.row].rowLength += replaceHtmlCodes(textBelow).length;
                            $scope.rows.splice($scope.currentPos.row+1, 1);
                        });
                    }
                }
                // Home
                else if (event.which === 36) {
                    event.preventDefault();
                    if (event.ctrlKey === true) {
                        $scope.$apply(function() {
                            $scope.currentPos.char = 0;
                            $scope.currentPos.row = 0;
                        });
                    } else {
                        $scope.$apply(function() {
                            $scope.currentPos.char = 0;
                        });
                    }
                }
                // End
                else if (event.which === 35) {
                    event.preventDefault();
                    if (event.ctrlKey === true) {
                        $scope.$apply(function() {
                            $scope.currentPos = {
                                row: $scope.rows.length,
                                char: 0
                            };
                        });
                    } else {
                        $scope.$apply(function() {
                            $scope.currentPos.char = $scope.rows[$scope.currentPos.row].rowLength;
                        });
                    }
                }
            });
        };
        bindKeydown();

        // Public scope functions.
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

        $scope.moveMarkerToPos = function(parentIndex, index) {
            $scope.currentPos = {
                row: parentIndex,
                char: index
            };
        };

        $scope.toTrustHtml = function(html) {
            return $sce.trustAsHtml(html);
        };

        // Private functions.
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
            string = string.replace(/&nbsp;&nbsp;&nbsp;&nbsp;/g, "<TAB>");
            string = string.replace(/&nbsp;/g, "<SPACE>");
            string = string.replace(/&lt;/g, "<");
            string = string.replace(/&gt;/g, ">");
            return string;
        };
    }
]);

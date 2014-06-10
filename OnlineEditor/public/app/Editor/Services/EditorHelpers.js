/*
 * File with help functions.
 */

angular.module("OnlineEditor.Editor").service("EditorHelpers", ["$rootScope", "FileFactory", function($rootScope, FileFactory) {
        "use strict";
        this.bindKeydown = function() {
            var that = this;
            $(document).bind("keydown", function(event) {
                var tempString = "";
                var charArray = [];

                if (event.which !== 116 && (event.which >= 48 && event.which <= 226) && event.shiftKey === false && event.ctrlKey === false && event.altKey === false) {
                    event.preventDefault();
                    if (event.which === 187) {
                        that.pushCharToString("+");
                    } else if (event.which === 188) {
                        that.pushCharToString(",");
                    } else if (event.which === 189) {
                        that.pushCharToString("-");
                    } else if (event.which === 190) {
                        that.pushCharToString(".");
                    } else if (event.which === 191) {
                        that.pushCharToString("'");
                    } else if (event.which === 226) {
                        that.pushCharToString("<");
                    } else {
                        that.pushCharToString(String.fromCharCode(event.which).toLowerCase());
                    }
                } else if (event.which !== 116 && (event.which >= 48 && event.which <= 226) && event.shiftKey === true && event.ctrlKey === false && event.altKey === false) {
                    event.preventDefault();
                    if (event.which === 49) {
                        that.pushCharToString("!");
                    } else if (event.which === 50) {
                        that.pushCharToString("\"");
                    } else if (event.which === 51) {
                        that.pushCharToString("#");
                    } else if (event.which === 52) {
                        that.pushCharToString("¤");
                    } else if (event.which === 53) {
                        that.pushCharToString("%");
                    } else if (event.which === 54) {
                        that.pushCharToString("&");
                    } else if (event.which === 55) {
                        that.pushCharToString("/");
                    } else if (event.which === 56) {
                        that.pushCharToString("(");
                    } else if (event.which === 57) {
                        that.pushCharToString(")");
                    } else if (event.which === 48) {
                        that.pushCharToString("=");
                    } else if (event.which === 187) {
                        that.pushCharToString("?");
                    } else if (event.which === 188) {
                        that.pushCharToString(";");
                    } else if (event.which === 189) {
                        that.pushCharToString("_");
                    } else if (event.which === 190) {
                        that.pushCharToString(":");
                    } else if (event.which === 191) {
                        that.pushCharToString("*");
                    } else if (event.which === 226) {
                        that.pushCharToString(">");
                    } else {
                        that.pushCharToString(String.fromCharCode(event.which));
                    }
                } else if (event.which !== 116 && (event.which >= 48 && event.which <= 226) && event.shiftKey === false && event.ctrlKey === true && event.altKey === true) {
                    event.preventDefault();
                    if (event.which === 55) {
                        that.pushCharToString("{");
                    } else if (event.which === 56) {
                        that.pushCharToString("[");
                    } else if (event.which === 57) {
                        that.pushCharToString("]");
                    } else if (event.which === 48) {
                        that.pushCharToString("}");
                    } else if (event.which === 187) {
                        that.pushCharToString("\\");
                    } else if (event.which === 226) {
                        that.pushCharToString("|");
                    }
                } else if (event.which === 83 && event.shiftKey === false && event.ctrlKey === true && event.altKey === false) {
                    // Ctrl+s Saving file.
                    event.preventDefault();
                    if ($rootScope.openFile !== null) {
                        var stringArray = [];
                        for (var i = 0; i < $rootScope.rows.length; i++) {
                            stringArray.push(that.replaceHtmlCodesToCustomXML($rootScope.rows[i].text));
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
                        tempString = that.replaceHtmlCodes($rootScope.rows[$rootScope.currentPos.row].text);
                        charArray = tempString.split("");
                        for (var t = 0; t < 4; t++) {
                            charArray.splice($rootScope.currentPos.char, 0, " ");
                        }
                        $rootScope.$apply(function() {
                            $rootScope.rows[$rootScope.currentPos.row].text = that.convertToHtmlCodes(that.joinStringArray(charArray));
                            $rootScope.rows[$rootScope.currentPos.row].rowLength -= 4;
                            $rootScope.currentPos.char -= 4;
                        });
                    } else {
                        tempString = that.replaceHtmlCodes($rootScope.rows[$rootScope.currentPos.row].text);
                        charArray = tempString.split("");
                        for (var t = 0; t < 4; t++) {
                            charArray.splice($rootScope.currentPos.char, 0, " ");
                        }
                        $rootScope.$apply(function() {
                            $rootScope.rows[$rootScope.currentPos.row].text = that.convertToHtmlCodes(that.joinStringArray(charArray));
                            $rootScope.rows[$rootScope.currentPos.row].rowLength += 4;
                            $rootScope.currentPos.char += 4;
                        });
                    }
                }
                // Enter
                else if (event.which === 13) {
                    event.preventDefault();
                    if ($rootScope.rows[$rootScope.currentPos.row].rowLength === $rootScope.currentPos.char) {
                        // New empty row
                        $rootScope.$apply(function() {
                            $rootScope.rows.splice($rootScope.currentPos.row+1, 0, {
                                text: "",
                                rowLength: 0
                            });
                            $rootScope.currentPos.row++;
                            $rootScope.currentPos.char = 0;
                        });
                    } else {
                        // New row with content after marker
                        var tempText = that.replaceHtmlCodes($rootScope.rows[$rootScope.currentPos.row].text);
                        var textArray = tempText.split("");
                        var textBefore = "";
                        var textAfter = "";
                        for (var i = 0; i < $rootScope.currentPos.char; i++) {
                            textBefore += textArray[i];
                        }
                        for (var i = $rootScope.currentPos.char; i < textArray.length; i++) {
                            textAfter += textArray[i];
                        }
                        $rootScope.$apply(function() {
                            $rootScope.rows[$rootScope.currentPos.row] = {
                                text: that.convertToHtmlCodes(textBefore),
                                rowLength: textBefore.length
                            };
                            $rootScope.rows.splice($rootScope.currentPos.row+1, 0, {
                                text: that.convertToHtmlCodes(textAfter),
                                rowLength: textAfter.length
                            });
                            $rootScope.currentPos.row++;
                            $rootScope.currentPos.char = 0;
                        });
                    }
                }
                // Backspace
                else if (event.which === 8) {
                    event.preventDefault();
                    if ($rootScope.currentPos.char > 0) {
                        tempString = that.replaceHtmlCodes($rootScope.rows[$rootScope.currentPos.row].text);
                        charArray = tempString.split("");
                        charArray.splice($rootScope.currentPos.char-1, 1);
                        $rootScope.$apply(function() {
                            $rootScope.rows[$rootScope.currentPos.row].text = that.convertToHtmlCodes(that.joinStringArray(charArray));
                            $rootScope.rows[$rootScope.currentPos.row].rowLength--;
                            $rootScope.currentPos.char--;
                        });
                    } else if ($rootScope.rows[$rootScope.currentPos.row].rowLength > 0) {
                        $rootScope.$apply(function() {
                            if ($rootScope.currentPos.row !== 0) {
                                var remainingText = $rootScope.rows[$rootScope.currentPos.row].text;
                                $rootScope.currentPos.row--;
                                $rootScope.currentPos.char = $rootScope.rows[$rootScope.currentPos.row].rowLength;
                                $rootScope.rows[$rootScope.currentPos.row].text += remainingText;
                                $rootScope.rows[$rootScope.currentPos.row].rowLength += that.replaceHtmlCodes(remainingText).length;
                                $rootScope.rows.splice($rootScope.currentPos.row+1, 1);
                            }
                        });
                    } else {
                        $rootScope.$apply(function() {
                            $rootScope.rows.splice($rootScope.currentPos.row, 1);
                            if ($rootScope.currentPos.row !== 0) {
                                $rootScope.currentPos.row--;
                                $rootScope.currentPos.char = $rootScope.rows[$rootScope.currentPos.row].rowLength;
                            }
                            if ($rootScope.rows.length === 0) {
                                $rootScope.rows.push({
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
                    that.pushCharToString(" ");
                }
                // Left arrow
                else if (event.which === 37) {
                    event.preventDefault();
                    $rootScope.$apply(function() {
                        if ($rootScope.currentPos.char > 0) {
                            $rootScope.currentPos.char--;
                        } else if($rootScope.currentPos.row > 0) {
                            $rootScope.currentPos.row--;
                            $rootScope.currentPos.char = $rootScope.rows[$rootScope.currentPos.row].rowLength;
                        }
                    });
                }
                // Right arrow
                else if (event.which === 39) {
                    event.preventDefault();
                    $rootScope.$apply(function() {
                        if ($rootScope.currentPos.char < $rootScope.rows[$rootScope.currentPos.row].rowLength) {
                            $rootScope.currentPos.char++;
                        } else if ($rootScope.currentPos.row < $rootScope.rows.length-1) {
                            $rootScope.currentPos.row++;
                            $rootScope.currentPos.char = 0;
                        }
                    });
                }
                // Up arrow
                else if (event.which === 38) {
                    event.preventDefault();
                    $rootScope.$apply(function() {
                        if ($rootScope.currentPos.row > 0) {
                            $rootScope.currentPos.row--;
                            if ($rootScope.currentPos.char > $rootScope.rows[$rootScope.currentPos.row].rowLength) {
                                $rootScope.currentPos.char = $rootScope.rows[$rootScope.currentPos.row].rowLength;
                            }
                        }
                    });
                }
                // Down arrow
                else if (event.which === 40) {
                    event.preventDefault();
                    $rootScope.$apply(function() {
                        if ($rootScope.currentPos.row < $rootScope.rows.length-1) {
                            $rootScope.currentPos.row++;
                            if ($rootScope.currentPos.char > $rootScope.rows[$rootScope.currentPos.row].rowLength) {
                                $rootScope.currentPos.char = $rootScope.rows[$rootScope.currentPos.row].rowLength;
                            }
                        }
                    });
                }
                // Delete
                else if (event.which === 46) {
                    event.preventDefault();
                    if ($rootScope.currentPos.char < $rootScope.rows[$rootScope.currentPos.row].rowLength) {
                        tempString = that.replaceHtmlCodes($rootScope.rows[$rootScope.currentPos.row].text);
                        charArray = tempString.split("");
                        charArray.splice($rootScope.currentPos.char, 1);
                        $rootScope.$apply(function() {
                            $rootScope.rows[$rootScope.currentPos.row].text = that.convertToHtmlCodes(that.joinStringArray(charArray));
                            $rootScope.rows[$rootScope.currentPos.row].rowLength--;
                        });
                    } else if ($rootScope.currentPos.row !== $rootScope.rows.length-1) {
                        var textBelow = $rootScope.rows[$rootScope.currentPos.row+1].text;
                        $rootScope.$apply(function() {
                            $rootScope.rows[$rootScope.currentPos.row].text += textBelow;
                            $rootScope.rows[$rootScope.currentPos.row].rowLength += that.replaceHtmlCodes(textBelow).length;
                            $rootScope.rows.splice($rootScope.currentPos.row+1, 1);
                        });
                    }
                }
                // Home
                else if (event.which === 36) {
                    event.preventDefault();
                    if (event.ctrlKey === true) {
                        $rootScope.$apply(function() {
                            $rootScope.currentPos.char = 0;
                            $rootScope.currentPos.row = 0;
                        });
                    } else {
                        $rootScope.$apply(function() {
                            $rootScope.currentPos.char = 0;
                        });
                    }
                }
                // End
                else if (event.which === 35) {
                    event.preventDefault();
                    if (event.ctrlKey === true) {
                        $rootScope.$apply(function() {
                            $rootScope.currentPos = {
                                row: $rootScope.rows.length,
                                char: 0
                            };
                        });
                    } else {
                        $rootScope.$apply(function() {
                            $rootScope.currentPos.char = $rootScope.rows[$rootScope.currentPos.row].rowLength;
                        });
                    }
                }
            });
        };

        this.joinStringArray = function(array) {
            var string = "";
            for (var i = 0; i < array.length; i++) {
                string += array[i];
            }
            return string;
        };

        this.replaceHtmlCodes = function(string) {
            string = string.replace(/&nbsp;/g, " ");
            string = string.replace(/&lt;/g, "<");
            string = string.replace(/&gt;/g, ">");
            return string;
        };

        this.convertToHtmlCodes = function(string) {
            string = string.replace(/ /g, "&nbsp;");
            string = string.replace(/</g, "&lt;");
            string = string.replace(/>/g, "&gt;");
            return string;
        };

        this.pushCharToString = function(char) {
            var that = this;
            var tempString = that.replaceHtmlCodes($rootScope.rows[$rootScope.currentPos.row].text);
            var charArray = tempString.split("");
            charArray.splice($rootScope.currentPos.char, 0, char);
            $rootScope.$apply(function() {
                $rootScope.rows[$rootScope.currentPos.row].text = that.convertToHtmlCodes(that.joinStringArray(charArray));
                $rootScope.rows[$rootScope.currentPos.row].rowLength++;
                $rootScope.currentPos.char++;
            });
        };

        this.replaceHtmlCodesToCustomXML = function(string) {
            string = string.replace(/&nbsp;&nbsp;&nbsp;&nbsp;/g, "<TAB>");
            string = string.replace(/&nbsp;/g, "<SPACE>");
            string = string.replace(/&lt;/g, "<");
            string = string.replace(/&gt;/g, ">");
            return string;
        };

        this.getFileExtension = function(filename) {
            return filename.split('.').pop();
        };

        this.getFileName = function(filename) {
            return filename.split('.')[0];
        };
    }
]);

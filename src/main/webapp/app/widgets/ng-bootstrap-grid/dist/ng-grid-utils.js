angular.module("ng-grid-utils", ['utils'])
    .factory("gridService", ["$timeout", '$window', '$http', 'JqueryuiDialog', function ($timeout, $window, $http, JqueryuiDialog) {
        /**
         * 保存列隐藏设置
         * @param {String} gridId 需要列隐藏的配置Grid
         * @param {Array.<String>} columns 要隐藏的列
         * @return {HttpPromise}
         */
        var saveSettings = function (gridId, saveColumns) {
            var url = getEstimatingURL("foundation/gridsetting");
            var params = {gridId: gridId, columns: saveColumns};
            return $http.post(url, JSON.stringify(params), {
                responseType: "json",
                headers: {
                    "Content-Type": 'application/json; charset=UTF-8'
                }
            });
        };

        /**
         * 加载隐藏列
         * @param gridId
         * @returns {HttpPromise}
         */
        var loadSettings = function (gridId) {
            var url = getEstimatingURL("foundation/checkgridsetting");
            var params = {gridId: gridId};
            return $http.post(url, JSON.stringify(params), {
                responseType: "json",
                headers: {
                    "Content-Type": 'application/json; charset=UTF-8'
                }
            });
        };

        /**
         * 保存数据的预处理
         * @param column
         * @param hideColumns
         * @returns {Array}
         */
        var getSaveColumns = function (column, hideColumns) {
            var saveColumns = new Array();
            // transfer hideColumns to the saveColumns & delete repeatData
            _.forEach(hideColumns, function (col) {
                var canPush = true;
                _.forEach(saveColumns, function (saveCol) {
                    if (saveCol === col.field) {
                        canPush = false;
                    }
                });
                if (canPush) {
                    saveColumns.push(col.field);
                }
            });

            /**
             *  saveColumns.length =0 & newColumn.checked = true means the first setting,you need insert the new column
             * others:1. saveColumns not contain the new column & the new column.checked= true means the new selectColumn,you need insert the new column
             *      2. saveColumns contain the new column & the new column.checked=false means the new column is unSelect,you need remove the new column
             */
            if (saveColumns.length == 0 && column.checked) {
                saveColumns.push(column.field);
            } else {
                var containFlag = false;
                var deleteColumn = null;
                _.forEach(saveColumns, function (col) {
                    if (col === column.field) {
                        containFlag = true;
                        deleteColumn = col;
                    }
                });

                if (column.checked && !containFlag) {
                    saveColumns.push(column.field);
                } else if (containFlag && !column.checked) {
                    saveColumns.remove(deleteColumn);
                }
            }
            return saveColumns;

        };

        /**
         *  hideDialog
         * @param hideData
         * @param dialogOptions
         * @param parentDialogInstance
         * @returns {*}
         */
        var showHideColumnDialog = function (scope, hideData, leftWidth, topHeight, gridId, dialogOptions, parentDialogInstance) {
            var changeFlag = false;
            var widthSet = 130;
            if (hideData) {
                widthSet = hideData[0].length * 130;
            }
            return JqueryuiDialog.open({
                templateUrl: 'shared/components/JqueryuiDialog/hideColumnDialog.html',
                controller: ['$scope', '$dialogInstance', '$rootScope', function ($scope, $dialogInstance, $rootScope) {
                    $scope.datas = hideData;
                    //checkbox select event
                    $scope.switchSetting = function (col) {
                        col.gridId = gridId;
                        scope.transferColumn = col;
                        changeFlag = true;
                    };
                    //close window
                    $scope.submit = function () {
                        $dialogInstance.close(changeFlag);
                    };

                    $scope.closeByBtn = function () {
                        $dialogInstance.close(changeFlag);
                    };
                }],
                dialogOptions: angular.extend({
                    onTheTop: true,
                    title: '隐藏列设置',
                    width: widthSet,
                    //position: {my: 'center', at: 'center'}, /**"horizontal vertical"*/
                    position: {my: 'left+' + (leftWidth - widthSet) + ' top+' + topHeight, at: 'left top'},
                    modal: true,
                    resizable: false,
                    closeBtnSelector: '.close-btn'
                }, dialogOptions),
                resolve: {
                    data: angular.extend({}, changeFlag)
                }
            }).result;
        };

        var calcGridSize = function (gridHolderElement, gridBackgroundRenderFlag, fixedHeight, gridHeight, optionsData, supportHidden) {
            //即使grid不可见，也可以重绘
            var gridDiv = gridHolderElement.parent().children('div');
            if (!gridBackgroundRenderFlag && gridDiv.is(":hidden")) {
                return;
            }

            var headerTbl = gridDiv.find('.table-head');
            var footerTbl = gridDiv.find('.table-foot');
            var bodyTbl = gridDiv.find('.table-body');
            var bodyDiv = bodyTbl.parent();
            var headerCols = headerTbl.find("th");
            var bodyCols = bodyTbl.find("th");
            var columnHideButton = gridDiv.find(".columnHideButton");

            var availableGridHeight = 0;
            if (fixedHeight > 0) {
                availableGridHeight = fixedHeight;
            } else {
                //自动计算Body的高度
                availableGridHeight = $(window).height() - ($(document.body).height() - gridDiv.outerHeight());
                //console.log("gridDiv.outerHeight():"+gridDiv.outerHeight());
                //console.log(" $(window).height():"+ $(window).height()+" $(document.body).height():"+$(document.body).height()+" $(document).height():"+$(document).height() );
                if (availableGridHeight <= 0) {
                    availableGridHeight = 100;
                }
            }

            $('th>*', headerTbl).hide(); //先隐藏所有的列头内容，重绘好以后再放出。

            //Grid Body 高度
            //console.log("headerTbl.outerHeight():"+headerTbl.outerHeight());


            $timeout(function () {
                var bodyDivHeight = 0;
                if (footerTbl) {
                    bodyDivHeight = availableGridHeight - headerTbl.outerHeight() - footerTbl.outerHeight() - 2;
                } else {
                    bodyDivHeight = availableGridHeight - headerTbl.outerHeight() - 2;
                }
                //console.log("bodyDivHeight:"+bodyDivHeight);

                //解决Grid 固定高度的问题
                if (gridHeight && gridHeight > 0) {
                    bodyDiv.height(gridHeight);
                } else {
                    bodyDiv.height(bodyDivHeight);
                }

                headerTbl.css("visibility", "visible");
                var headerTblHeight = 0 - headerTbl.outerHeight();
                //console.log("headerTblHeight:" + headerTblHeight);
                bodyTbl.css("margin-top", headerTblHeight);
                if (supportHidden) {
                    if ((optionsData && optionsData.length > 0)) {
                        headerTbl.css("width", "auto");
                    } else {
                        // when no data, set the new style
                        headerTbl.css("width", bodyTbl[0].clientWidth + "px");
                        //bodyTbl.css("overflow-x", "hidden");//IE11下导致grid的最后一行的border-bottom不生效，效果如bug17028
                    }

                    var gridBodyWidth = bodyTbl[0].clientWidth;
                    for (var colIdx = 0; colIdx < bodyCols.length; colIdx++) {
                        if (optionsData && optionsData.length > 0) {
                            var width = $(bodyCols[colIdx]).width();
                            if(Utils.isIEExplorer()) {
                                //IE对宽度小数有要求
                                var width = $(bodyCols[colIdx]).width();
                                if(colIdx!=bodyCols.length-1) {
                                    $(bodyCols[colIdx]).width(width);
                                }

                                if(colIdx==0){
                                    $(headerCols[colIdx]).width(width-1);
                                }else{
                                    $(headerCols[colIdx]).width(width);
                                }
                            }else{
                                $(headerCols[colIdx]).width(width);
                            }
                        } else {
                            //when no data, auto calculate column's width
                            //修改bug15730，当前headerCol可能设置了padding，设置元素的width必须包含padding和border的尺寸
                            $(headerCols[colIdx]).css("width", (gridBodyWidth / bodyCols.length) + "px");
                        }
                    }
                    //计算滚动条宽度
                    columnHideButton.css('right', '3px');
                }
                else {
                    for (var colIdx = 0; colIdx < bodyCols.length; colIdx++) {
                        var width = $(bodyCols[colIdx]).width()
                        if(Utils.isIEExplorer()) {
                            //IE对宽度小数有要求
                            var width = $(bodyCols[colIdx]).width();
                            if(colIdx == 0){
                                $(bodyCols[colIdx]).width(width);
                                $(headerCols[colIdx]).width(width-1);
                            }
                            if (colIdx != bodyCols.length - 1) {
                                $(bodyCols[colIdx]).width(width);
                                $(headerCols[colIdx]).width(width);
                            } else {
                                //计算滚动条宽度
                                $(headerCols[colIdx]).width(width + (bodyDiv[0].offsetWidth - bodyDiv[0].clientWidth) + "px");
                            }
                        }else{
                            if (colIdx != bodyCols.length - 1) {
                                $(headerCols[colIdx]).width(width);
                            } else {
                                //计算滚动条宽度
                                $(headerCols[colIdx]).width(width + (bodyDiv[0].offsetWidth - bodyDiv[0].clientWidth) + "px");
                            }
                        }
                    }
                    columnHideButton.css('right', '3px');
                }
                $('th>*', headerTbl).show(); // 放出列头的内容
            }, 0);
        }
        return {
            calcGridSize: calcGridSize,
            saveSettings: saveSettings,
            loadSettings: loadSettings,
            getSaveColumns: getSaveColumns,
            showHideColumnDialog: showHideColumnDialog
        }
    }])
    .directive('compile', [
        '$compile',
        function ($compile) {
            return {
                /*require: '^form',*/
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.cellTemplateScope = scope.$eval(attrs.cellTemplateScope);
                    // Watch for changes to expression.
                    scope.$watch(attrs.compile, function (new_val) {
                        var new_element = angular.element(new_val);
                        element.append(new_element);
                        $compile(new_element)(scope);
                    });
                }
            };
        }
    ])
    .filter('decimalFilter', ['$filter', function ($filter) {
        return function (input) {
            return $filter('number')(input, 2);
        }
    }]);
;
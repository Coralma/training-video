angular.module('ng-bootstrap-grid', ['ng-grid-utils'])
    .directive('bsGrid', ['$timeout', '$window', '$templateCache', 'gridService', function ($timeout, $window, $templateCache, gridService) {
        var TEMPLATE_AUTO_HEIGHT = 'template/paginationGrid/paginationGridAutoHeight.tpl.html';
        var TEMPLATE_FIXED_HEIGHT = 'template/paginationGrid/paginationGridFixedHeight.tpl.html';

        var GRID_CATEGORY_PART_FOOT = "<tfoot class='bs-foot' ng-repeat='item in options.data | filter: {operationType:\"06\"} ' compile='options.deductionLaborTemplate'></tfoot>";

        var GRID_PAGINATION_PART_HEAD =
            "       <thead>\n" +
            "           <tr>\n" +
            "               <th ng-if='options.enableRowSelection' class='grid-checkbox-cell'>" +
            "                   <input type='checkbox' ng-click='selectAll(isSelectAll)' ng-model='isSelectAll' ng-checked='options.selectAllFlag' class='checkBoxSelectAll'>" +
            "               </th>" +
            "               <th ng-repeat='col in columns' ng-if='col.headerColSpan>0' colspan = '{{col.headerColSpan}}' ng-style='col.headStyle' ng-click='sortData(col, columns)'>" +
            "                   <div ng-if='col.headTemplate' compile='col.headTemplate' cell-template-scope='col.headTemplateScope'></div>" +
            "                   <div ng-if='!col.headTemplate' style='display:inline;'>{{col.headTemplate || col.displayName || col.field}}</div>" +
            "                   <div ng-if='col.sort == \"asc\"' style='display:inline;'><i class='glyphicon' ng-class='\"glyphicon glyphicon-triangle-top\"'></i></div>" +
            "                   <div ng-if='col.sort == \"desc\"' style='display:inline;'><i class='glyphicon' ng-class='\"glyphicon glyphicon-triangle-bottom\"'></i></div>" +
            "               </th>\n" +
            "           </tr>\n" +
            "       </thead>\n";

        var GRID_PAGINATION_PART_BODY =
            "       <tbody>\n" +
            "           <tr ng-repeat='item in options.data | filter:{operationType:\"!06\"} ' ng-dblclick='doubleClick(item);doubleSelectSingleRow(item,options.data);' ng-click='selectSingleRow(item,options.data)' ng-class='item.rowHighlight ? \"row-highlight\" : \"\"'>\n" +
            "               <td ng-if='options.enableRowSelection' class='grid-checkbox-cell'><input type='checkbox' ng-model='item.selection' class='childChk' ng-click='selectRow(row)' ng-disabled='item.$disSelectable'></td>" +
            "               <td ng-repeat='col in columns' ng-style='col.cellStyle'>\n" +
            "                   <div ng-if='col.cellTemplate' compile='col.cellTemplate' cell-template-scope='col.cellTemplateScope'></div>\n" +
            "                   <div ng-if='!col.cellTemplate' title='{{ item[col.field] }}'>{{ col.filter ? $filter(col.filter)(item[col.field]) : item[col.field] }}</div>\n" +
            "               </td>\n" +
            "           </tr>\n" +
            "           <tr ng-if='options.data == null || options.data.length == 0' >" +
            "               <td colspan='{{columnNumber}}' class='no-data'>{{options.noDataMessage}}</td>" +
            "           </tr>" +
            "       </tbody>\n";

        var GRID_PAGINATION_PART_FOOT =
            "       <tfoot class='bs-foot'>\n" +
            "           <tr>" +
            "               <td colspan='{{columnNumber}}'>" +
            "                   <div paged-grid-bar></div>" +
            "               </td>" +
            "           </tr>" +
            "       </tfoot>\n"

        var GRID_PAGINATION_STRUCTURE_FIXED_HEIGHT =
            "<div class='table-responsive table-bordered bs-grid' style='overflow-x:hidden;'>\n" +
            "                   <span ng-if='supportSetting'  id='hideDialogSetId' class='columnHideButton columnHide'>\n" +
            "                       <span ng-click='showHideWindow($event)' class='gridSetIco' title='隐藏列设置' ccc-hover-class='{\'enter\':\'gridSetHoverIco\',\'leave\':\'gridSetIco\'}'></span>\n" +
            "                   </span>\n" +
            "   <table class='table table-head table-bordered table-hover table-striped' style='visibility: hidden;margin-bottom:0px; width:100%;border:none;'>\n" +
            GRID_PAGINATION_PART_HEAD +
            "   </table>\n" +
            "   <div ng-if='!supportSetting' style='overflow-y:auto;'>\n" +
            "       <table class='table table-body table-bordered table-hover table-striped' style='margin-bottom:0px;border:none;'>\n" +
            GRID_PAGINATION_PART_HEAD +
            GRID_PAGINATION_PART_BODY +
            GRID_CATEGORY_PART_FOOT +
            "       </table>\n" +
            "   </div>\n" +

            "   <div ng-if='supportSetting' style='overflow-y:scroll; overflow-x:hidden;'>\n" +
            "       <table class='table table-body table-bordered table-hover table-striped' style='margin-bottom:0px;border:none;width:99.9%;'>\n" +
            GRID_PAGINATION_PART_HEAD +
            GRID_PAGINATION_PART_BODY +
            GRID_CATEGORY_PART_FOOT +
            "       </table>\n" +
            "   </div>\n" +
            "   <table ng-if='options.useExternalPagination' class='table table-foot table-bordered table-hover table-striped' style='margin-bottom:0px;'>\n" + GRID_PAGINATION_PART_FOOT + "</table>\n" +
            "</div>\n";

        $templateCache.put(TEMPLATE_AUTO_HEIGHT,
            "<div class='table-responsive bs-grid grid-table-height'>\n" +
            "   <table class='table table-bordered table-hover table-striped '>\n" +
            "       <thead>\n" +
            "           <tr>\n" +
            "               <th ng-if='options.enableRowSelection' class='grid-checkbox-cell'>" +
            "                   <input type='checkbox' ng-click='selectAll(isSelectAll)' ng-model='isSelectAll' ng-checked='options.selectAllFlag'>" +
            "               </th>" +
            "               <th ng-repeat='col in columns' ng-if='col.headerColSpan>0' colspan = '{{col.headerColSpan}}' ng-style='col.headStyle' ng-if='col.visible' ng-class='col.enableSorting ? \"sortable-head\" : \"\"' ng-click='sortData(col, columns)'>" +
            "                   <div ng-if='col.headTemplate' compile='col.headTemplate' cell-template-scope='col.headTemplateScope'></div>" +
            "                   <div ng-if='!col.headTemplate' style='display:inline;'>{{col.headTemplate || col.displayName || col.field}}</div>" +
            "                   <div ng-if='col.sort == \"asc\"' style='display:inline;'><i class='glyphicon' ng-class='\"glyphicon glyphicon-triangle-bottom\"'></i></div>" +
            "                   <div ng-if='col.sort == \"desc\"' style='display:inline;'><i class='glyphicon' ng-class='\"glyphicon glyphicon-triangle-top\"'></i></div>" +
            "               </th>\n" +
            "           </tr>\n" +
            "       </thead>\n" +
            "       <tbody>\n" +
            "           <tr ng-repeat='item in options.data' ng-dblclick='doubleClick(item)' ng-class='item.rowHighlight ? \"row-highlight\" : \"\"'>\n" +
            "               <td ng-if='options.enableRowSelection' class='grid-checkbox-cell'><input type='checkbox' ng-model='item.selection' class='childChk' ng-click='selectRow(row)'></td>" +
            "               <td ng-repeat='col in columns' ng-class='col.cellClass' ng-style='col.cellStyle' ng-if='col.visible'>\n" +
            "                   <div ng-if='col.cellTemplate' compile='col.cellTemplate' cell-template-scope='col.cellTemplateScope'></div>\n" +
            "                   <div ng-if='!col.cellTemplate' title='{{ ::item[col.field] }}'>{{ ::(col.filter ? $filter(col.filter)(item[col.field]) : item[col.field]) }}</div>\n" +
            "               </td>\n" +
            "           </tr>\n" +
            "           <tr ng-if='options.data == null || options.data.length == 0'>" +
            "               <td colspan='{{columnNumber}}' class='no-data'>{{options.noDataMessage}}</td>" +
            "           </tr>" +
            "           <tr ng-if='options.useExternalPagination'>" +
            "               <td colspan='{{columnNumber}}'>" +
            "                   <div paged-grid-bar></div>" +
            "               </td>" +
            "           </tr>" +
            "       </tbody>\n" +
            "   </table>\n" +
            "</div>\n"
        );

        $templateCache.put(TEMPLATE_FIXED_HEIGHT, GRID_PAGINATION_STRUCTURE_FIXED_HEIGHT);

        return {
            restrict: 'E',
            replace: true,
            scope: {
                options: '=',
                tabHeight:'=',
                onSelect: '=',
                onDbClickRow: '=',
                onPaginationChange: '=',
                onSortChanged: '='
            },
            link: function (scope, element, attrs) {
                scope.appScope = scope.$parent;
                scope.dataBackup = angular.copy(scope.options.data);
                scope.options.useExternalPagination = scope.options.useExternalPagination || false;
                scope.options.noDataMessage = scope.options.noDataMessage || '没有找到匹配的结果。';
                scope.options.fixedHeightFlag = scope.options.fixedHeightFlag || false;
                scope.options.fixedHeight = scope.options.fixedHeight;
                //设置mergeWorkOrder 表格高度
                if(scope.tabHeight){
                    $timeout(function () {
                        $('.grid-table-height').height(scope.tabHeight);
                        $('.grid-table-height').css("overflow-y","auto");
                    }, 500);
                }else{
                    $(".grid-table-height").removeClass("grid-table-height");
                }
                scope.gridBackgroundRenderFlag = false; //即使grid不可见，也可以重绘

                //get gridId
                var gridId = attrs["cccHideColumn"];
                if (gridId) {
                    scope.supportSetting = true;
                } else {
                    scope.supportSetting = false;
                }

                /**
                 * 适应IE11，ng-style属性只认对象类型，字符串转换成对象
                 */
                _.each(scope.options.columnDefs, function (style) {
                    var styleObj = {};
                    if (_.isString(style.headStyle)) {
                        _.each(style.headStyle.split(';'), function (d) {
                            var value = d.split(':');
                            if (_.trim(value[0])) {
                                styleObj[_.trim(value[0])] = _.trim(value[1]);
                            }
                        });
                        style.headStyle = styleObj;
                    }

                    var cellStyleObj = {};
                    if (_.isString(style.cellStyle)) {
                        _.each(style.cellStyle.split(';'), function (d) {
                            var value = d.split(':');
                            if (_.trim(value[0])) {
                                cellStyleObj[_.trim(value[0])] = _.trim(value[1]);
                            }
                        });
                        style.cellStyle = cellStyleObj;
                    }
                });

                //filter columns contains mustHide = true
                _.remove(scope.options.columnDefs, {'mustHide': true});
                var selfColumns = [];
                selfColumns = angular.copy(scope.options.columnDefs);

                scope.columns = scope.options.columnDefs;


                //row & column
                var hideDatas = new Array();
                var hideColumns = new Array();
                // get columnData can be hidden

                /**
                 * 计算hideDatas
                 * checkbox style
                 *  [1] [5] [..]
                 *  [2] [6]
                 *  [3] [7]
                 *  [4] [8]
                 *
                 * @param columnsHiddenByUser - 哪些列需要被指定隐藏
                 */
                var getAllColumns = function (columnsHiddenByUser) {
                    //define hideWindow's checkbox style
                    var MAX_ROW_NUM = 4;

                    // max row
                    for (var i = 0; i < MAX_ROW_NUM; i++) {
                        hideDatas.push([]);
                    }
                    // base on header's data to set checkBox & column'canHide = false can't need filter
                    var idx = 0;
                    _.forEach(scope.columns, function (col) {
                        if (col.canHide != false) {
                            var rowIdx = idx % MAX_ROW_NUM;
                            hideDatas[rowIdx].push({
                                title: col.displayName,
                                field: col.field,
                                checked: _.include(columnsHiddenByUser, col.field)
                            });
                            idx++;
                        }
                    });
                };

                // get function column.change by hideWindow's event & localSetting to js
                scope.$watch("transferColumn", function (col) {
                    if (col && col.gridId === gridId) {
                        scope.savingLocalSetting(col);
                    }
                });

                //save new hidden columm to parent Window
                var saveColumns = [];
                scope.savingLocalSetting = function (column) {
                    if (column) {
                        // save & reload
                        saveColumns = gridService.getSaveColumns(column, hideColumns);
                        //gridService.saveSettings(gridId, saveColumns);
                        scope.reloadColumn(saveColumns, true);
                    }
                    if (gridId) {
                        scope.transferColumn = [];
                    }
                };

                scope.initColumns = function (columns) {
                    var headerColSpan = 1;
                    _.forEach(columns, function (col) {
                        //处理ColSpan, ColSpan的列不支持排序
                        if (headerColSpan > 1) {
                            //被之前的列融合
                            headerColSpan--;
                            col.headerColSpan = -1;
                            col.enableSorting = false;
                        } else {
                            //没有被之前的列融合
                            if (col.headerColSpan == null) {
                                col.headerColSpan = 1;
                            }
                            if (col.headerColSpan > 1) {
                                headerColSpan = col.headerColSpan;
                                col.enableSorting = false;
                            }
                        }

                        //处理sorting
                        if (angular.isUndefined(col.enableSorting)) {
                            col.enableSorting = true;
                        }
                    });
                };

                scope.selectAll = function (isSelectAll) {
                    _.forEach(scope.options.data, function (row) {
                        if (!row.$disSelectable) {
                            row.selection = isSelectAll;
                        }
                    });
                    scope.options.selectAllFlag = isSelectAll;
                };
                scope.selectRow = function (row) {
                    if (scope.onSelect) {
                        scope.onSelect(row);
                    }
                    updateSelectAllFlag();
                };

                // 显示设置窗口
                scope.showHideWindow = function ($event) {
                    var topHeight = 0;
                    var leftWidth = 0;
                    topHeight = $event.clientY;
                    leftWidth = $event.clientX;
                    var gridHolderElement = element.parent().children('div');
                    var gridDiv = gridHolderElement.parent().children('div');
                    var headerTbl = gridDiv.find('.table-head');
                    var bodyTbl = gridDiv.find('.table-body');
                    var bodyDiv = bodyTbl.parent();
                    topHeight = topHeight + (headerTbl[0].offsetHeight / 2);
                    leftWidth = leftWidth - ((bodyDiv[0].offsetWidth - bodyDiv[0].clientWidth) / 2);
                    gridService.showHideColumnDialog(scope, hideDatas, leftWidth, topHeight, gridId).then(function (result) {
                        //when close window, save data to DB
                        if (result) {
                            gridService.saveSettings(gridId, saveColumns);
                        }
                    });
                };

                scope.selectSingleRow = function (row, rows) {
                    if (scope.onSelect && !scope.options.enableRowSelection) {
                        cleanRows(rows);
                        row.rowHighlight = true;
                        scope.onSelect(row);
                    }
                };
                scope.doubleSelectSingleRow = function (row, rows) {
                    if (scope.onDbClickRow) {
                        cleanRows(rows);
                        scope.onDbClickRow(row);
                    }
                };
                scope.unSelectedSingleRow = function () {
                    cleanRows(scope.options.data);
                };
                var cleanRows = function (rows) {
                    _.forEach(rows, function (row) {
                        row.rowHighlight = false;
                    });
                };

                var updateSelectAllFlag = function () {
                    //checkbox的全选和全不选的问题
                    if (scope.options.data == null || scope.options.data.length == 0) {
                        scope.options.selectAllFlag = false;
                        return;
                    }
                    var uncheckedRow = _.find(scope.options.data, function (row) {
                        return row.selection == false || row.selection == null;
                    });
                    scope.options.selectAllFlag = (uncheckedRow == null);
                }

                scope.sortData = function (col, columns) {
                    if (!col.enableSorting) {
                        return;
                    }
                    var sortedData = {};
                    cleanOtherSort(col, columns);
                    col.sort = checkColSort(col.sort);
                    if (scope.options.useExternalPagination) {
                        if (scope.onSortChanged) {
                            var sortField = col.sort == null ? null : col.field;
                            scope.onSortChanged(scope.options.currentPage, scope.options.paginationPageSize, sortField, col.sort);
                        }
                    } else {
                        if (col.sort == null) {
                            sortedData = scope.dataBackup;
                        } else if (col.sort == 'asc') {
                            sortedData = _.sortBy(scope.options.data, col.field);
                        } else if (col.sort == 'desc') {
                            sortedData = _.sortBy(scope.options.data, col.field).reverse();
                        }
                        angular.copy(sortedData, scope.options.data);
                    }
                };

                var checkColSort = function (sort) {
                    if (sort == null) {
                        return 'desc';
                    } else if (sort == 'desc') {
                        return 'asc';
                    } else if (sort == 'asc') {
                        return null;
                    }
                };

                var cleanOtherSort = function (col, columns) {
                    _.forEach(columns, function (otherCol) {
                        if (col.field != otherCol.field) {
                            otherCol.sort = null;
                        }
                    });
                };

                scope.getSelectedRows = function () {
                    var selectedRows = [];
                    _.forEach(scope.options.data, function (item) {
                        if (item.selection) {
                            selectedRows.push(item);
                        }
                    });
                    return selectedRows;
                };

                scope.doubleClick = function (item) {
                    if (scope.options.onDoubleClick) {
                        scope.options.onDoubleClick(item);
                    }
                };

                scope.clickSingleRow = function (item) {
                    if (scope.options.onDoubleClick) {
                        scope.options.onDoubleClick(item);
                    }
                };

                scope.calcGridSize = function (gridHeight) {
                    //即使grid不可见，也可以重绘
                    if (!scope.gridBackgroundRenderFlag && element.parent().is(":hidden")) {
                        return;
                    }

                    $timeout(function () {
                        var gridHolderElement = element.parent().children('div');
                        if (gridHeight) {
                            scope.options.fixedHeight = gridHeight;
                            gridService.calcGridSize(gridHolderElement, scope.gridBackgroundRenderFlag, gridHeight, null, scope.options.data, scope.supportSetting);
                        } else {
                            gridService.calcGridSize(gridHolderElement, scope.gridBackgroundRenderFlag, scope.options.fixedHeight, null, scope.options.data, scope.supportSetting);
                        }
                    }, 0);
                };

                scope.getTemplate = function () {
                    return scope.template = scope.options.fixedHeightFlag ? TEMPLATE_FIXED_HEIGHT : TEMPLATE_AUTO_HEIGHT;
                };

                //reload Column
                scope.reloadColumn = function (newHideColumns, reloadGridDataFlag) {
                    //reInit
                    scope.columns = angular.copy(selfColumns);
                    //reInit
                    hideColumns.length = 0;

                    //get new hideColumns & newValue to each column.visible
                    _.forEach(scope.columns, function (col) {
                        var visibleFlag = true;
                        _.forEach(newHideColumns, function (newCol) {
                            if (col.field === newCol) {
                                visibleFlag = false;
                            }
                        });
                        // 是用户自定义列显示的范围、不是false时，未定义时：显示此列。
                        if (visibleFlag && !(col.visible == false)) {
                            col.visible = true;
                        } else {
                            col.visible = false;
                            hideColumns.push(col);
                        }
                    });
                    scope.options.onDoubleClick = scope.options.onDoubleClick || null;
                    scope.options.selectAllFlag = false;
                    //delete columns where column.visible=false
                    _.remove(scope.columns, {'visible': false});
                    scope.maxColumnNum = scope.columns.length - 1;
                    if (scope.options.enableRowSelection) {
                        scope.columnNumber = scope.options.columnDefs.length + 1; //FIXME it remove the hidden column and selection function.
                    } else {
                        scope.columnNumber = scope.options.columnDefs.length;
                    }

                    scope.initColumns(scope.columns);

                    if (reloadGridDataFlag) {
                        scope.calcGridSize();
                    }
                };

                // init explore api
                if (scope.options.onRegisterApi) {
                    scope.options.onRegisterApi({
                        //将grid先隐藏，然后render好以后，显示，可以减少页面列头抖动
                        setVisible: function (visible, gridBackgroundRenderFlag) {
                            if (visible) {
                                element.parent().children('div').css('visibility', 'visible');
                            } else {
                                element.parent().children('div').css('visibility', 'hidden');
                            }
                            scope.gridBackgroundRenderFlag = gridBackgroundRenderFlag;
                        },
                        reloadColumn: function (hideColumnFields, reloadGridDataFlag) {
                            scope.reloadColumn(hideColumnFields, reloadGridDataFlag);
                        },
                        getSelectedRows: function () {
                            return scope.getSelectedRows();
                        },
                        cleanSelectedSingleRow: function () {
                            scope.unSelectedSingleRow();
                        },
                        setGridData: function (gridData, totalrecord) {
                            scope.options.data = gridData;
                            scope.dataBackup = angular.copy(scope.options.data);
                            scope.options.totalItems = totalrecord;
                            if (scope.options.fixedHeightFlag) {
                                if (scope.options.fixedHeight) {
                                    scope.calcGridSize(scope.options.fixedHeight);
                                } else {
                                    scope.calcGridSize();
                                }
                            }
                            updateSelectAllFlag();
                        },
                        calcGridSize: function (gridHeight) {
                            //当有增删记录的时候重新计算checkbox
                            updateSelectAllFlag();

                            //windowHeight为空，则用window高度计算
                            scope.calcGridSize(gridHeight);
                        },
                        selectAll: function (isSelectAll) {
                            scope.selectAll(isSelectAll);
                        }
                    });
                }


                if (scope.options.fixedHeightFlag) {
                    //如果是FixedGrid,需要计算GridSize，并监听resize事件
                    scope.calcGridSize();

                    //window.
                    $(window).resize(function (e) {
                        if (e.target != window) {
                            //避免jQueryUI dialog的resize
                            return;
                        }

                        if (!scope.calcGridSize) {
                            return;
                        }

                        if (scope.options.fixedHeight) {
                            scope.calcGridSize(scope.options.fixedHeight);
                        } else {
                            scope.calcGridSize();
                        }
                    });
                }

                if (scope.supportSetting) {
                    // queryLoader by gridId then loader hideData
                    var loader = gridService.loadSettings(gridId);
                    loader.success(function (columnsHiddenByUser) {
                        //init columns for hideWindow
                        getAllColumns(columnsHiddenByUser);
                        //reload
                        scope.reloadColumn(columnsHiddenByUser, true);
                    });
                } else {
                    //init columns for hideWindow
                    getAllColumns([]);
                    //reload
                    scope.reloadColumn([], true);
                }


            },
            template: "<div ng-include='getTemplate()'></div>"
        }
    }])
    .directive('pagedGridBar', function () {
        return {
            restrict: 'A',
            link: function link(scope, el, attrs) {
                scope.options.currentPage = 1;
                scope.options.currentGroup = 0;

                scope.$watch('options.totalItems', function (data) {
                    pageChange();
                }, true);

                scope.$watch('options.paginationPageSize', function (data) {
                    scope.options.currentPage = 1;
                    scope.options.currentGroup = 0;
                    scope.paged(scope.options.currentPage);
                    pageChange();
                }, true);

                var pageChange = function () {
                    scope.options.paginationPageSizes = scope.options.paginationPageSizes || [10, 25, 50];
                    scope.options.paginationPageSize = scope.options.paginationPageSize || 10;
                    scope.options.totalItems = scope.options.totalItems || 0;
                    var maxSize = scope.options.totalItems / scope.options.paginationPageSize;
                    if (parseInt(maxSize) == maxSize) {
                        scope.maxNum = parseInt(maxSize);
                    } else {
                        scope.maxNum = parseInt(maxSize) + 1;
                    }
                    /*console.log('scope.maxNum is ' + scope.maxNum)*/
                    var numArray = [], itemArray = [], groupId = 0, itemId = 1, loopId = 1;
                    while (itemId <= scope.maxNum) {
                        itemArray.push(itemId++);
                        loopId++;
                        if (itemId > scope.maxNum) {
                            numArray.push(itemArray);
                        } else {
                            if (loopId == 11) {
                                groupId++;
                                loopId = 1;
                                numArray.push(itemArray);
                                itemArray = [];
                            }
                        }
                    }
                    scope.maxGroup = groupId;
                    scope.pageNums = numArray;
                    scope.itemNumberStart = function () {
                        if (scope.options.totalItems == 0) {
                            return 0;
                        }
                        return (scope.options.currentPage - 1) * scope.options.paginationPageSize + 1;
                    };
                    scope.itemNumberEnd = function () {
                        var endNum = (scope.options.currentPage - 1) * scope.options.paginationPageSize + scope.options.paginationPageSize;
                        if (endNum > scope.options.totalItems) {
                            return scope.options.totalItems;
                        } else {
                            return endNum;
                        }
                    };
                    scope.paged = function (pageNum) {
                        scope.options.currentPage = pageNum;
                        if (!angular.isUndefined(scope.onPaginationChange)) {
                            scope.onPaginationChange(scope.options.currentPage, scope.options.paginationPageSize);
                        }
                        scope.options.selectAllFlag = false;
                    };
                    var getGroup = function (page) {
                        var returnGroup = 0, group = 0;
                        _.forEach(scope.pageNums, function (groups) {
                            if (_.includes(groups, page)) {
                                returnGroup = group;
                            }
                            group++;
                        });
                        return returnGroup;
                    };
                    scope.previous = function () {
                        scope.options.currentPage--;
                        scope.options.currentGroup = getGroup(scope.options.currentPage);
                        scope.paged(scope.options.currentPage);
                    };
                    scope.next = function () {
                        scope.options.currentPage++;
                        scope.options.currentGroup = getGroup(scope.options.currentPage);
                        scope.paged(scope.options.currentPage);
                    };
                    scope.first = function () {
                        scope.options.currentGroup = 0;
                        scope.paged(1);
                    };
                    scope.last = function () {
                        /*scope.options.currentPage = scope.maxNum;*/
                        scope.options.currentGroup = scope.maxGroup;
                        scope.paged(scope.maxNum);
                    };
                    scope.nextGroup = function () {
                        scope.options.currentGroup++;
                        scope.paged(scope.options.currentGroup * 10 + 1);
                    };
                    scope.previousGroup = function () {
                        scope.paged(scope.options.currentGroup * 10);
                        scope.options.currentGroup--;
                    };
                };
            },
            template: '<div class="grid-page-bar">' +
            '   <a href="javascript:void(0)" class="glyphicon glyphicon-step-backward paged-grid-ctrl-link paged-grid-link" ng-click="first()" ng-class="options.currentPage==1?\'not-active\':\'\'"></a>' +
            '   <a href="javascript:void(0)" class="glyphicon glyphicon-triangle-left paged-grid-ctrl-link2 paged-grid-link" ng-click="previous()" ng-class="options.currentPage==1?\'not-active\':\'\'"></a>' +
            '   <a href="javascript:void(0)" class="paged-grid-num-link paged-grid-link" ng-if="options.currentGroup > 0" ng-click="previousGroup()">...</a>' +
            '   <a href="javascript:void(0)" class="paged-grid-num-link paged-grid-link" ng-repeat="pageNum in pageNums[options.currentGroup]" ng-click="paged(pageNum)" ng-class="pageNum == options.currentPage ? \'paged-grid-link-active\' : \'\'">{{pageNum}}</a>' +
            '   <a href="javascript:void(0)" class="paged-grid-num-link paged-grid-link" ng-if="options.currentGroup < maxGroup" ng-click="nextGroup()">...</a>' +
            '   <a href="javascript:void(0)" class="glyphicon glyphicon-triangle-right paged-grid-ctrl-link3 paged-grid-link" ng-click="next()" ng-class="(options.currentPage == maxNum || maxNum == 0)?\'not-active\':\'\'"></a>' +
            '   <a href="javascript:void(0)" class="glyphicon glyphicon-step-forward paged-grid-ctrl-link paged-grid-link" ng-click="last()" ng-class="(options.currentPage==maxNum || maxNum == 0)?\'not-active\':\'\'"></a>' +
            '   <span class="data-count-desc">当前 {{itemNumberStart()}} - {{itemNumberEnd()}} 条，总共 {{options.totalItems}} 条</span>' +
            '    <div class="pull-right paged-display-list">' +
            '   <span>每页显示</span>' +
            '        <select ng-model="options.paginationPageSize" ng-options="di for di in options.paginationPageSizes"></select>' +
            '    </div>' +
            '</div>'
        };
    });
angular.module('ng-bootstrap-category-grid', ['ng-grid-utils'])
    .directive('categoryGrid', ['$timeout', '$window', '$templateCache', 'gridService', '$q', function ($timeout, $window, $templateCache, gridService, $q) {
        var LIMIT_NUMBER = 20;
        var TEMPLATE_FIXED_HEIGHT = 'template/categoryGrid/categoryGridFixedHeight.tpl.html';

        var GRID_CATEGORY_PART_FOOT = "<tfoot class='bs-foot' ng-repeat='item in ((rows | filter:enableCategory ? {category:\"工时扣减\"} : {category:\"no-category\"})[0].items | filter:{partCategoryId:\"-2\"})' compile='options.deductionLaborTemplate'></tfoot>";

        var GRID_CATEGORY_PART_HEAD =
            "       <thead>" +
            "           <tr>" +
            "               <th ng-if='options.enableRowSelection' class='grid-checkbox-cell'>" +
            "                   <input type='checkbox' ng-click='selectAll(isSelectAll)' ng-model='isSelectAll' ng-checked='selectAllFlag' ng-disabled='options.disSelectable'>" +
            "               </th>" +
            "               <th ng-repeat='col in columns track by col.field' ng-style='col.headStyle' ng-if='col.visible'>" +
            "                   <div ng-if='col.headTemplate' compile='col.headTemplate' cell-template-scope='col.headTemplateScope'></div>" +
            "                   <div ng-if='!col.headTemplate'>{{ ::col.displayName }}</div>" +
            "               </th>" +
            "           </tr>" +
            "       </thead>";

        var GRID_CATEGORY_PART_BODY =
            "       <tbody ng-repeat='row in rows | filter:enableCategory ? {category:\"!工时扣减\"} : {category:\"no-category\"} track by row.category'>" +
            "           <tr ng-dblclick='row.initStatus=!row.initStatus' ng-if='enableCategory' class='category-tr'>" +
            "               <td colspan='{{ ::columnNumber }}'>" +
            "                   <i class='glyphicon panel-icon' ng-class='{\"glyphicon-chevron-down\": row.initStatus, \"glyphicon-chevron-right\": !row.initStatus}' ng-click='row.initStatus=!row.initStatus'></i><span class='category-title'  >{{ ::row.category }}</span>" +
            "               </td>" +
            "           </tr>" +
            "           <tr ng-repeat='item in row.items | filter:{partCategoryId:\"!-2\"} track by $id(item)' ng-class='(item.rowHighlight||item==mouseClickedRow) ? \"row-highlight\" : \"\"' ng-show='row.initStatus' context-menu='onRightClick(item)' data-target='rowMenu' ng-click='mouseClickRow(item)'>" +
            "               <td ng-if='options.enableRowSelection' class='grid-checkbox-cell'>" +
            "                   <input type='checkbox' ng-model='item.selection' ng-click='selectRow(row)' ng-disabled='options.disSelectable'>" +
            "               </td>" +
            "               <td ng-repeat='col in columns track by col.field' ng-style='col.cellStyle' style='word-break:break-all;' ng-if='col.visible'>" +
            "                   <div ng-if='col.cellTemplate' compile='col.cellTemplate' cell-template-scope='col.cellTemplateScope'></div>" +
            "                   <div ng-if='!col.cellTemplate'>{{ item[col.field] }}</div>" +
            "               </td>" +
            "           </tr>" +
            "       </tbody>";

        var GRID_CATEGORY_STRUCTURE_FIXED_HEIGHT =
            "<div class='table-responsive table-bordered bs-grid' style='overflow-x:hidden' context-menu='onIgnoreRightClick()' data-target='ignoreRightClickEle'>" +
            "   <table class='table table-head table-bordered table-hover' style='visibility: hidden;table-layout:fixed;margin-bottom:0px; width:100%;border:none;'>" +
            GRID_CATEGORY_PART_HEAD +
            "   </table>\n" +
            "   <div style='overflow-y:scroll;'>\n" +
            "   <table class='table table-body table-bordered table-hover' ng-class='enableCategory ? \"category-table-striped\" : \"table-striped\"' style='table-layout:fixed;margin-bottom:0px;'>" +
            GRID_CATEGORY_PART_HEAD +
            GRID_CATEGORY_PART_BODY +
            GRID_CATEGORY_PART_FOOT +
            "   </table>" +
            "   <div id='ignoreRightClickEle' style='display:none'/table>" +
            "</div>";


        $templateCache.put(TEMPLATE_FIXED_HEIGHT, GRID_CATEGORY_STRUCTURE_FIXED_HEIGHT);

        return {
            restrict: 'E',
            replace: true,
            scope: {
                options: '=',
                onSelect: '=',
                onMouseClickRow: '=',
                rowRightClick: '='
            },
            link: function (scope, element, attrs) {
                scope.enableCategory = true;
                scope.columns = scope.options.columnDefs;
                /*scope.data = scope.options.data;*/
                scope.selectAllFlag = false;

                scope.appScope = scope.$parent;

                scope.categoryData = function (data, isLazyLoad) {
                    scope.selectAllFlag = false;
                    if (scope.options.data.length > 0) {
                        var uncheckedRow = _.find(scope.options.data, function (row) {
                            return row.selection == false || row.selection == null;
                        });
                        scope.selectAllFlag = (uncheckedRow == null);
                    }

                    if (!angular.isUndefined(scope.options.enableCategory)) {
                        scope.enableCategory = scope.options.enableCategory;
                    } else {
                        scope.enableCategory = true;
                    }
                    var categoryRows = [], item = data[0], categorys = [], len = data.length, i = 0, deductionRow = [];
                    var categoryField = getCategoryField(scope.options.columnDefs);
                    initColumn();
                    data = sortData(data);

                    if (scope.enableCategory) {
                        while (i < len) {
                            item = data[i++];
                            var value = item[categoryField];
                            categorys.push(value);
                        }
                        var uniqCategorys = _.uniq(categorys);
                        var ucLen = uniqCategorys.length, j = 0, uniqCategoryItem = uniqCategorys[0];
                        while (j < ucLen) {
                            uniqCategoryItem = uniqCategorys[j++];
                            var categoryRow = {};
                            categoryRow.category = uniqCategoryItem;
                            categoryRow.selection = false;
                            categoryRow.initStatus = true;
                            categoryRow.partCategoryId = true;
                            categoryRow.items = _.filter(data, function (item) {
                                return item[categoryField] == uniqCategoryItem;
                            });
                            categoryRows.push(categoryRow);
                        }
                    } else {
                        var categoryRow = {};
                        categoryRow.category = 'no-category';
                        categoryRow.selection = false;
                        categoryRow.initStatus = true;
                        categoryRow.items = data;
                        categoryRows.push(categoryRow);
                    }
                    if (isLazyLoad) {
                        return lazyLoadRows(categoryRows);
                    } else {
                        scope.rows = categoryRows;
                        return scope.calcGridSize();
                    }
                };

                var lazyLoadRows = function (categoryRows) {
                    var deferred = $q.defer();
                    var index = 0, realRows = [], lazyRows = [];
                    if (categoryRows.length == 1) {
                        if (categoryRows[0].items.length > LIMIT_NUMBER) {
                            realRows = _.take(categoryRows[0].items, LIMIT_NUMBER);
                            lazyRows = _.drop(categoryRows[0].items, LIMIT_NUMBER);
                            categoryRows[0].items = realRows;
                        }
                        scope.rows = categoryRows;
                        //FixedGrid,需要计算GridSize
                        scope.calcGridSize().then(function () {
                            if (lazyRows.length > 0) {
                                $timeout(function () {
                                    //console.log('after timeout');
                                    _.forEach(lazyRows, function (lazyRow, n) {
                                        scope.rows[0].items.push(lazyRow);
                                    });
                                    scope.calcGridSize().then(function () {
                                        deferred.resolve(true);
                                    });
                                });
                            } else {
                                deferred.resolve(true);
                            }
                        });
                    } else {
                        _.forEach(categoryRows, function (categoryRow, n) {
                            _.forEach(categoryRow.items, function (item, m) {
                                index++;
                            });
                            if (index > LIMIT_NUMBER && realRows.length > 0) {
                                lazyRows.push(categoryRow);
                            } else {
                                realRows.push(categoryRow);
                            }
                        });
                        scope.rows = realRows;
                        //FixedGrid,需要计算GridSize
                        scope.calcGridSize().then(function () {
                            if (lazyRows.length > 0) {
                                $timeout(function () {
                                    //console.log('after timeout');
                                    _.forEach(lazyRows, function (lazyRow, n) {
                                        var found = _.find(scope.rows, function (row) {
                                            return row.category == lazyRow.category;
                                        });
                                        if (!found) {
                                            scope.rows.push(lazyRow);
                                        }
                                    });
                                    scope.calcGridSize().then(function () {
                                        deferred.resolve(true);
                                    });
                                });
                            } else {
                                deferred.resolve(true);
                            }
                        });
                    }
                    return deferred.promise;
                }

                initColumn = function () {
                    var index = 0;
                    // set the visible column
                    _.forEach(scope.columns, function (col) {
                        if (angular.isUndefined(col.visible)) {
                            col.visible = true;
                            index++;
                        } else if (col.visible) {
                            index++;
                        }
                    });
                    if (scope.options.enableRowSelection) {
                        scope.columnNumber = index + 1;
                    } else {
                        scope.columnNumber = index;
                    }
                };
                sortData = function (data) {
                    var sortList = _.filter(scope.columns, function (col) {
                        return col['enableSorting'] == true;
                    });
                    _.forEach(sortList, function (sortDef) {
                        data = _.sortByOrder(data, [sortDef.field], ['asc'])
                    })
                    return data;
                }

                getCategoryField = function (cols) {
                    var cf = _.result(_.find(cols, function (chr) {
                        return chr.category == true;
                    }), 'field');
                    return cf;
                };

                scope.selectAll = function (isSelectAll) {
                    var rows = scope.rows;
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var items = row.items;
                        for (var j = 0; j < items.length; j++) {
                            var item = items[j];
                            item.selection = isSelectAll;
                        }
                    }
                    scope.selectAllFlag = isSelectAll;
                };
                /**
                 * 选中每一行的checkbox
                 */
                scope.selectRow = function (row) {
                    if (scope.onSelect) {
                        scope.onSelect(row);
                    }
                    //checkbox select all and un-check operation.
                    var uncheckedRow = _.find(scope.options.data, function (row) {
                        return row.selection == false || row.selection == null;
                    });
                    scope.selectAllFlag = (uncheckedRow == null);
                };
                scope.getSelectedRows = function () {
                    var selectedRows = [];
                    _.forEach(scope.rows, function (row) {
                        _.forEach(row.items, function (item) {
                            if (item.selection) {
                                selectedRows.push(item);
                            }
                        })
                    });
                    return selectedRows;
                };
                /**
                 * 鼠标选中一行
                 */
                scope.mouseClickRow = function (row) {
                    scope.mouseClickedRow = row;
                    if (scope.onMouseClickRow) {
                        scope.onMouseClickRow(row);
                    }
                };

                // init explore api
                if (scope.options.onRegisterApi) {
                    scope.options.onRegisterApi({
                        expandRow: function (categoryRowIdx) {
                            if (categoryRowIdx < 0 || categoryRowIdx >= scope.rows.length) {
                                return;
                            }
                            scope.rows[categoryRowIdx].initStatus = true;
                        },
                        getSelectedRows: function () {
                            return scope.getSelectedRows();
                        },
                        onlyRefreshRowItems: function () {
                            //性能调优专用，
                            //前提：Category没有变化，损失项目没发生增减变化。目前适用于保存后重新更新页面的场景
                            var latestItemUnitMap = [];
                            var latestItemIdMap = [];
                            _.each(scope.options.data, function (item) {
                                latestItemUnitMap[item.estimateUnitId] = item;
                                latestItemIdMap[item.itemId] = item;
                            });

                            var categories = scope.rows;
                            _.each(categories, function (category) {
                                var items = category.items;
                                _.each(items, function (item) {
                                    if (item.itemId) {
                                        var latestItem = latestItemIdMap[item.itemId];
                                        angular.copy(latestItem, item);
                                    } else if (item.estimateUnitId) {
                                        var latestItem = latestItemUnitMap[item.estimateUnitId];
                                        angular.copy(latestItem, item);
                                    }
                                });
                            });
                        },
                        refresh: function (viewNum) {
                            //有性能问题，谨慎调用
                            var deferred = $q.defer();
                            $q.when(scope.categoryData(scope.options.data, false)).then(function () {
                                //界面可能还没render好
                                if (viewNum) {
                                    $timeout(function () {
                                        var $viewRow = element.next().find('tr[data-target="rowMenu"]');
                                        // 如果有纵向滚动条，滚动条需要将新添加的row显示在显示区域
                                        if ($viewRow.length > 0) {
                                            $viewRow[viewNum - 1].scrollIntoView();
                                        }
                                        // 设置当前row为选中状态,并触发选中事件
                                        var row = scope.options.data[viewNum - 1];
                                        scope.mouseClickedRow = row;
                                        if (scope.onSelect) {
                                            scope.onSelect(row);
                                        }
                                        deferred.resolve(true);
                                    });
                                } else {
                                    deferred.resolve(true);
                                }
                            });
                            return deferred.promise;
                        },
                        changeCategoryType: function (type) {
                            scope.enableCategory = type;
                        },
                        calcGridSize: function (gridHeight) {
                            //windowHeight为空，则用window高度计算
                            scope.calcGridSize(gridHeight);
                        },
                        clearClickedRow: function () {
                            scope.mouseClickedRow = null;
                        }
                    });
                }
                scope.onIgnoreRightClick = function () {

                }
                scope.onRightClick = function (item) {
                    if (scope.rowRightClick) {
                        scope.rowRightClick(item);
                    }
                }
                scope.calcGridSize = function (gridHeight) {
                    var deferred = $q.defer();

                    if (!element.parent().is(":visible")) {
                        deferred.resolve();
                        return deferred.promise;
                    }
                    //console.log("try to calcGridSize");

                    var gridHolderElement = element.parent().children('div');
                    if (gridHeight) {
                        scope.options.fixedHeight = gridHeight;
                        gridService.calcGridSize(gridHolderElement, false, gridHeight);
                    } else {
                        gridService.calcGridSize(gridHolderElement, false, scope.options.fixedHeight);
                    }
                    deferred.resolve();

                    //after resize, do something
                    return deferred.promise;
                };

                scope.getTemplate = function () {
                    return TEMPLATE_FIXED_HEIGHT;
                }

                // init category
                scope.categoryData(scope.options.data, true);

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

            },
            template: "<div ng-include='getTemplate()'></div>"
        }
    }]).filter('filterDeductionLaborItem', function () {
    return function (value) {
        return
    }
});
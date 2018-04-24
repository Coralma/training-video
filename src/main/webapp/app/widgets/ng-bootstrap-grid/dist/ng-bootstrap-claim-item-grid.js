angular.module('ng-bootstrap-claim-item-grid', [])
    .directive('claimItemGrid', ['$timeout', '$window', '$templateCache', '$q', function ($timeout, $window, $templateCache, $q) {
        var TEMPLATE_FIXED_HEIGHT = 'shared/components/ng-bootstrap-grid/dist/claim-item-grid.tpl.html';
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
                scope.init = function () {
                    scope.enableCategory = true;
                    scope.selectAllFlag = false;
                    scope.appScope = scope.$parent;
                    // init category
                    scope.categoryData(scope.options.data, true);

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
                                //只刷新Grid中的数据行的属性，前提：Category没有变化，损失项目没发生增减变化。目前适用于保存后重新更新页面的场景
                                if (scope.enableCategory) {
                                    _.each(scope.rows, function (category) {
                                        category.items = _.filter(scope.options.data, function (item) {
                                            return item.partCategoryName == category.category;
                                        });

                                    });

                                    _.remove(scope.rows, function(category){
                                        return category.items.length == 0;
                                    })
                                } else {
                                    _.each(scope.rows, function (category) {
                                        if (category == 'no-category') {
                                            category.items = _.filter(scope.options.data, function (item) {
                                                return true;
                                            });
                                        }
                                    });
                                }
                            },
                            refresh: function (viewNum) {
                                //刷新grid，并定位到当前行。由于要重新计算category，所以性能较差
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
                                scope.calcGridHeight();
                            },
                            clearClickedRow: function () {
                                scope.mouseClickedRow = null;
                            }
                        });
                    }
                };


                scope.categoryData = function (data, isLazyLoad) {
                    scope.selectAllFlag = false;
                    if (!angular.isUndefined(scope.options.enableCategory)) {
                        scope.enableCategory = scope.options.enableCategory;
                    } else {
                        scope.enableCategory = true;
                    }

                    var categoryRows = [], item = data[0], categories = [], len = data.length, i = 0, deductionRow = [];
                    data = _.sortByOrder(data, 'displayOrder', ['asc']);

                    if (scope.enableCategory) {
                        while (i < len) {
                            item = data[i++];
                            categories.push(item.partCategoryName);
                        }
                        var uniqCategories = _.uniq(categories);
                        var ucLen = uniqCategories.length, j = 0, uniqCategoryItem = uniqCategories[0];
                        while (j < ucLen) {
                            uniqCategoryItem = uniqCategories[j++];
                            var categoryRow = {};
                            categoryRow.category = uniqCategoryItem;
                            categoryRow.selection = false;
                            categoryRow.initStatus = true;
                            categoryRow.partCategoryId = true;
                            categoryRow.items = _.filter(data, function (item) {
                                return item.partCategoryName == uniqCategoryItem;
                            });
                            categoryRows.push(categoryRow);
                        }
                    } else {
                        var categoryRow = {};
                        categoryRow.category = 'no-category';
                        categoryRow.selection = false;
                        categoryRow.initStatus = true;
                        categoryRow.items = _.filter(data, function (item) {
                            return true;
                        });
                        categoryRows.push(categoryRow);
                    }
                    scope.rows = categoryRows;
                    return scope.calcGridHeight();
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

                scope.onIgnoreRightClick = function () {
                };

                scope.onRightClick = function (item) {
                    if (scope.rowRightClick) {
                        scope.rowRightClick(item);
                    }
                };

                scope.calcGridHeight = function () {
                    var deferred = $q.defer();

                    if (!element.parent().is(":visible")) {
                        deferred.resolve();
                        return deferred.promise;
                    }

                    var gridHolderElement = element.parent().children('div');
                    var gridDiv = gridHolderElement.parent().children('div');
                    if (gridDiv.is(":hidden")) {
                        return;
                    }

                    var headerTbl = gridDiv.find('.table-head');
                    var headerCols = headerTbl.find("th");
                    var footerTbl = gridDiv.find('.table-foot');
                    var bodyTbl = gridDiv.find('.table-body');
                    var bodyDiv = bodyTbl.parent();
                    var bodyCols = bodyTbl.find("th");

                    //自动计算Body的高度
                    var availableGridHeight = $(window).height() - ($(document.body).height() - gridDiv.outerHeight());
                    if (availableGridHeight <= 0) {
                        availableGridHeight = 100;
                    }
                    $timeout(function () {
                        var bodyDivHeight = 0;
                        if (footerTbl) {
                            bodyDivHeight = availableGridHeight - headerTbl.outerHeight() - footerTbl.outerHeight() - 2;
                        } else {
                            bodyDivHeight = availableGridHeight - headerTbl.outerHeight() - 2;
                        }
                        bodyTbl.parent().height(bodyDivHeight);

                        if(bodyCols.length>0){
                            $(headerCols[bodyCols.length-1]).width( $(bodyCols[bodyCols.length-1]).width() + (bodyDiv[0].offsetWidth - bodyDiv[0].clientWidth) + "px");
                        }

                        deferred.resolve();
                    });
                    //after resize, do something
                    return deferred.promise;
                };

                scope.getTemplate = function () {
                    return TEMPLATE_FIXED_HEIGHT;
                };

                scope.init();
            },
            template: "<div ng-include='getTemplate()'></div>"
        }
    }])
    .directive('gridFocus', function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                scope.$watch(attrs.gridFocus, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            if (element[0].nodeName === 'INPUT') {
                                element[0].focus();
                            } else {
                                var innerInput = element.find("input");
                                if (innerInput.length > 0) {
                                    innerInput.focus();
                                    innerInput.select();
                                }
                            }
                        });
                    }
                });
            }
        }
    });
angular.module('ng-bootstrap-expand-grid', ['ng-grid-utils'])
    .directive('expandGrid', ['$timeout', '$window', '$templateCache', 'gridService', function ($timeout, $window, $templateCache, gridService) {
        var TEMPLATE_FIXED_HEIGHT = 'template/EXPANDGrid/EXPANDGridFixedHeight.tpl.html';
        var TEMPLATE_AUTO_HEIGHT = 'template/EXPANDGrid/EXPANDGridAutoHeight.tpl.html';

        var INDEX = 1;
        var GRID_EXPAND_PART_HEAD =
            "       <thead>\n" +
            "           <tr>\n" +
            "               <th ng-if='options.enableRowSelection' class='grid-checkbox-cell'>" +
            "                   <input type='checkbox' ng-click='selectAll(isSelectAll)' ng-model='isSelectAll' ng-checked='selectAllFlag'>" +
            "               </th>" +
            "               <th ng-repeat='col in columns track by col.field' style={{::col.headStyle}} >" +
            "                   <div ng-if='col.headTemplate' compile='col.headTemplate' cell-template-scope='col.headTemplateScope'></div>" +
            "                   <div ng-if='!col.headTemplate' >{{ ::(col.headTemplate || col.displayName || col.field) }}</div>" +
            "               </th>\n" +
            "           </tr>\n" +
            "       </thead>\n";

        var GRID_EXPAND_PART_BODY =
            "       <tbody>\n" +
            "           <tr ng-repeat-start='row in rows track by $id(row)' ng-dblclick='row.item.expand=!row.item.expand;expandClick(row)'>\n" +
            "               <td ng-if='options.enableRowSelection' class='grid-checkbox-cell'><input type='checkbox' ng-model='row.item.selection' ng-click='selectRow(row)' ng-disabled='row.item.readonly'></td>" +
            "               <td ng-repeat='col in columns track by col.field' style={{::col.cellStyle}} style='word-break:break-all;'>\n" +
            "                   <div ng-if='col.cellTemplate' style='white-space:nowrap; overflow:hidden; text-overflow:ellipsis;padding-bottom:5px;'  compile='col.cellTemplate' cell-template-scope='col.cellTemplateScope'> <span ng-if='options.enableExpand && $index == maxColumnNum' class='pull-right' style='display:inline;float:left;'><i class='glyphicon' ng-click='row.item.expand=!row.item.expand;expandClick(row)' ng-class='{\"glyphicon-chevron-down\": row.item.expand, \"glyphicon-chevron-right\": !row.item.expand}' style='cursor:pointer;'></i></span></div>\n " +
            "                   <div ng-if='!col.cellTemplate' style='white-space:nowrap; overflow:hidden; text-overflow:ellipsis;' title='{{ ::row.item[col.field] }}'>{{ ::row.item[col.field] }} <span ng-if='options.enableExpand && $index == maxColumnNum' class='pull-right' style='display:inline;float:left;'><i class='glyphicon' ng-click='row.item.expand=!row.item.expand;expandClick(row)' ng-class='{\"glyphicon-chevron-down\": row.item.expand, \"glyphicon-chevron-right\": !row.item.expand}' style='cursor:pointer;'></i></span></div>\n" +
            "                   " +
            "               </td>\n" +
            "           </tr>\n" +
            "           <tr ng-repeat-end ng-show='row.item.expand' ng-if='options.enableExpand' class='expand-form-tr'>" +
            "               <td colspan='{{ ::columnNumber }}'>" +
            "                   <expand-form form-id='{{::row.item.$epIndex}}'>" +
            "                       <div ng-include=\"row.expandTemplate\"></div>" +
            "                   </expand-form>" +
            "               </td>\n" +
            "           </tr>\n" +
            "           <tr ng-if='options.data == null || options.data.length == 0' >" +
            "               <td colspan='{{columnNumber}}' class='no-data'>{{options.noDataMessage}}</td>" +
            "           </tr>" +
            "       </tbody>\n";

        var GRID_EXPAND_STRUCTURE_FIXED_HEIGHT =
            "<div class='table-responsive table-bordered ep-grid'>" +
            "   <table class='table table-head table-bordered table-hover expand-table-striped' style='visibility: hidden;margin-bottom:0px; width:100%;border:none;'>\n" +
            GRID_EXPAND_PART_HEAD +
            "   </table>\n" +
            "   <div style='overflow-y:auto;'>\n" +
            "   <table class='table table-body table-bordered table-hover expand-table-striped' style='table-layout:fixed;margin-bottom:0px;'>" +
            GRID_EXPAND_PART_HEAD +
            GRID_EXPAND_PART_BODY +
            "   </table>" +
            "</div>";

        var GRID_EXPAND_STRUCTURE_AUTO_HEIGHT =
            "<div class='table-responsive table-bordered ep-grid'>" +
            "   <table class='table table-body table-bordered table-hover expand-table-striped' style='table-layout:fixed;margin-bottom:0px;'>" +
            GRID_EXPAND_PART_HEAD +
            GRID_EXPAND_PART_BODY +
            "   </table>" +
            "</div>";


        $templateCache.put(TEMPLATE_FIXED_HEIGHT, GRID_EXPAND_STRUCTURE_FIXED_HEIGHT);
        $templateCache.put(TEMPLATE_AUTO_HEIGHT, GRID_EXPAND_STRUCTURE_AUTO_HEIGHT);

        return {
            restrict: 'E',
            replace: true,
            priority: 10,
            scope: {
                options: '=',
                onSelect: '=',
                onExpand: '='
            },
            link: function (scope, element, attrs) {
                scope.appScope = scope.$parent;
                scope.columns = scope.options.columnDefs;
                scope.maxColumnNum = scope.columns.length - 1;
                /*scope.data = scope.options.data;*/
                scope.selectAllFlag = false;
                scope.options.fixedHeightFlag = scope.options.fixedHeightFlag || false;
                scope.options.noDataMessage = scope.options.noDataMessage || '没有找到匹配的结果。';

                if (angular.isUndefined(scope.options.enableExpand)) {
                    scope.options.enableExpand = true;
                }
                scope.initData = function () {
                    var rows = [];
                    /*scope.rows = scope.options.data;*/
                    var data = scope.options.data;
                    _.forEach(data, function (d, key) {
                        d.expand = d.expand?true:false;
                        d.$epIndex = INDEX++;
                        var row = {item: d, expandTemplate: scope.options.expandableRowTemplate};
                        rows.push(row);
                        if(d.expand){
                            scope.expandClick(row);
                        }
                    });
                    scope.rows = rows;

                    if(scope.options.enableRowSelection){
                        scope.columnNumber = scope.options.columnDefs.length + 1; //FIXME it remove the hidden column and selection function.
                    }else{
                        scope.columnNumber = scope.options.columnDefs.length;
                    }

                };
                scope.initData();

                scope.selectAll = function (isSelectAll) {
                    /*console.log(isSelectAll);*/
                    _.forEach(scope.rows, function (row) {
                        if (row.item.readonly) {
                            row.item.selection = false;
                        } else {
                            row.item.selection = isSelectAll;
                        }
                    });
                    scope.selectAllFlag = isSelectAll;
                };
                scope.selectRow = function (row) {
                    /*console.log('select a row.');*/
                    if (scope.onSelect) {
                        scope.onSelect(row);
                    }

                    updateSelectAllFlag();
                };

                var updateSelectAllFlag = function () {
                    //checkbox的全选和全不选的问题
                    if (scope.options.data == null || scope.options.data.length == 0) {
                        scope.selectAllFlag = false;
                        return;
                    }
                    var uncheckedRow = _.find(scope.options.data, function (row) {
                        return row.selection == false || row.selection == null;
                    });
                    scope.selectAllFlag = (uncheckedRow == null);
                }

                scope.expandClick = function (clickedRow) {
                    if (scope.options.enableExpand) {
                        if (scope.options.enableSingleExpand) {
                            _.forEach(scope.rows, function (row) {
                                if (row != clickedRow) {
                                    row.item.expand = false;
                                    /*row.item.readonly = true;*/
                                }
                            });
                        }
                        if (scope.onExpand) {
                            scope.onExpand(clickedRow);
                        }
                        scope.calcGridSize();
                    }
                }
                scope.getSelectedRows = function () {
                    var selectedRows = [];
                    _.forEach(scope.rows, function (row) {
                        if (row.item.selection) {
                            selectedRows.push(row);
                        }
                    });
                    return selectedRows;
                }
                scope.getUrlTemplate = function () {
                    return scope.options.expandableRowTemplate;
                };

                if (scope.options.onRegisterApi) {
                    scope.options.onRegisterApi({
                        refresh: function () {
                            scope.initData();

                            scope.calcGridSize();
                        },
                        addNewItem: function (data) {
                            /*scope.initData();
                             var newRow = _.filter(scope.rows, {'item' : data});
                             newRow.expand= true;
                             scope.expandClick(newRow[0]);
                             scope.initData();*/
                            data.expand = true;
                            data.$epIndex = INDEX++;
                            var newRow = {item: data, expandTemplate: scope.options.expandableRowTemplate};
                            scope.rows.push(newRow);
                            scope.expandClick(newRow);

                            //当有增删记录的时候重新计算checkbox
                            updateSelectAllFlag();
                        },
                        getSelectedRows: function () {
                            return scope.getSelectedRows();
                        },
                        expandRow: function (item) {
                            var selectedRow;
                            _.forEach(scope.rows, function (row) {
                                if (row.item == item) {
                                    selectedRow = row
                                }
                            });
                            scope.expandClick(selectedRow);
                        },
                        deleteSelectedRows: function () {
                            // do not use this API, it has some issue in validation.js
                            var selectedRows = scope.getSelectedRows();
                            _.remove(scope.rows, function (data) {
                                var checkResult = _.includes(selectedRows, data);
                                if (checkResult) {
                                    _.remove(scope.options.data, data.item);
                                }

                                //当有增删记录的时候重新计算checkbox
                                updateSelectAllFlag();
                                return checkResult;
                            });
                        },
                        calcGridSize: function (gridHeight) {
                            //windowHeight为空，则用window高度计算
                            scope.calcGridSize(gridHeight);
                        }
                    });
                }
                scope.calcGridSize = function (gridHeight) {
                    if (!scope.options.fixedHeightFlag) {
                        return;
                    }

                    if (element.parent().is(":hidden")) {
                        return;
                    }

                    $timeout(function () {
                        var gridHolderElement = element.parent().children('div');
                        if (gridHeight) {
                            scope.options.fixedHeight = gridHeight;
                            gridService.calcGridSize(gridHolderElement, false, gridHeight);
                        } else {
                            gridService.calcGridSize(gridHolderElement, false, scope.options.fixedHeight);
                        }
                    }, 0);
                };

                scope.getTemplate = function () {
                    return scope.template = scope.options.fixedHeightFlag ? TEMPLATE_FIXED_HEIGHT : TEMPLATE_AUTO_HEIGHT;
                };

                //FixedGrid,需要计算GridSize，并监听resize事件
                scope.calcGridSize();

                $(window).resize(function (e) {
                    if (e.target != window) {
                        //避免jQueryUI dialog的resize
                        return;
                    }

                    if (!scope.options.fixedHeightFlag || !scope.calcGridSize) {
                        return;
                    }

                    if (scope.options.fixedHeight) {
                        scope.calcGridSize(scope.options.fixedHeight);
                    } else {
                        scope.calcGridSize();
                    }
                });

                scope.initData();
            },
            template: "<div ng-include='getTemplate()'></div>"
        }
    }]);
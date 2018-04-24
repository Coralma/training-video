angular.module('list.controller', [])
    .controller('ListCtrl', ['$scope','Restangular','$sce','$state','$window', function ($scope, Restangular, $sce, $state, $window) {
        $scope.showCategory = true;
        $scope.showDialogFlag = false;
        $scope.adminPassword = '';
        $scope.selectedVideoTitle='';
        $scope.selectedVideo='';

        $scope.devVideoList = [];
        $scope.testVideoList = [];
        $scope.bizVideoList = [];


        $scope.devCategory = 1;
        $scope.testCategory = 1;
        $scope.bizCategory = 1;

        $scope.showSelectedCategory = function(category) {
            $scope.showCategory = true;
            if(category == 1) {
                $scope.devCategory = 1;
                $scope.testCategory = 0;
                $scope.bizCategory = 0;
            } else if(category == 2) {
                $scope.devCategory = 0;
                $scope.testCategory = 1;
                $scope.bizCategory = 0;
            } else if(category == 3) {
                $scope.devCategory = 0;
                $scope.testCategory = 0;
                $scope.bizCategory = 1;
            } else {
                $scope.devCategory = 1;
                $scope.testCategory = 1;
                $scope.bizCategory = 1;
            }
        };
        $scope.videoUrl = function(url){
            return $sce.trustAsResourceUrl(url);
        };

        $scope.showVideo = function(video) {
            $scope.showCategory = false;
            $scope.selectedVideoTitle=video.name;
            $scope.selectedVideo=video.url;
        };

        $scope.backToCategory = function() {
            $scope.showCategory = true;
            $scope.selectedVideoTitle='';
            $scope.selectedVideo='';
        };

        $scope.showValidateDialog = function() {
            if($window.localStorage['pwd'] == '1') {
                $state.go('manage');
            } else {
                $scope.showDialogFlag = true;
            }
        };
        $scope.validate = function(adminPassword) {
            Restangular.one('video/validate?adminPassword='+adminPassword).get().then(function (data) {
                if(data == '1') {
                    $window.localStorage['pwd'] = data;
                    $state.go('manage');
                } else {
                    $scope.errorMsg="超级用户密码错误";
                }
            });
        };
        $scope.cancel= function() {
            $scope.showDialogFlag = false;
        };

        $scope.getAll = function() {
            Restangular.one('video/getAll').get().then(function (data) {
                $scope.devVideoList = _.filter(data, ['category', "1"]);
                $scope.testVideoList = _.filter(data, ['category', "2"]);
                $scope.bizVideoList = _.filter(data, ['category', "3"]);
            });
        };
        $scope.getAll();
    }]);
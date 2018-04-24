angular.module('manage.controller', [])
    .controller('ManageCtrl', ['$scope','Restangular', '$state','$sce','$window',function ($scope, Restangular,$state,$sce,$window) {
        console.log('localStorage data: '+ $window.localStorage['pwd'] );
        if($window.localStorage['pwd'] != '1') {
            $state.go('list');
        }
        $scope.showDialogFlag = false;
        $scope.showCategory = true;
        $scope.errorMsg='';
        $scope.devVideoList = [];
        $scope.testVideoList = [];
        $scope.bizVideoList = [];

        $scope.categoryList = {
            "开发视频分类":"1",
            "测试视频分类":"2",
            "业务视频分类":"3"
        };
        $scope.selectedVideoModel = {};

        $scope.edit = function(videoModel) {
            if(angular.isUndefined(videoModel)) {
                $scope.selectedVideoModel = {name: '', url: '', category:"1"}
            } else {
                $scope.selectedVideoModel =videoModel;
            }
            $scope.showDialogFlag = true;
        };

        $scope.submit = function() {
            if($scope.selectedVideoModel.name.length==0) {
                $scope.errorMsg='请输入视频名称';
                return;
            }
            if($scope.selectedVideoModel.url.length==0) {
                $scope.errorMsg='请输入视频URL地址';
                return;
            }
            $scope.errorMsg='';
            Restangular.all('video/save').post($scope.selectedVideoModel, {}, {'Content-Type': 'application/json' }).then(function (data) {
                $scope.getAll();
            });
            $scope.showDialogFlag = false;
        };

        $scope.delete= function(videoModel) {
            Restangular.all('video/delete').post(videoModel, {}, {'Content-Type': 'application/json' }).then(function (data) {
                $scope.getAll();
            });
        };

        $scope.cancel = function() {
            $scope.showDialogFlag = false;
            $scope.errorMsg='';
        };

        $scope.back = function() {
            $state.go('list');
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

        $scope.getAll = function() {
            Restangular.one('video/getAll').get().then(function (data) {
                $scope.devVideoList = _.filter(data, ['category', "1"]);
                $scope.testVideoList = _.filter(data, ['category', "2"]);
                $scope.bizVideoList = _.filter(data, ['category', "3"]);
            });
        };
        $scope.getAll();
    }]
);

angular.module('oaApp', ['restangular','ui.router','list.controller','manage.controller','ng-bootstrap-grid','formatDate'])
    .config(function ($stateProvider, $urlRouterProvider,RestangularProvider,$httpProvider) {
        RestangularProvider.setBaseUrl('/training-video');
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

        $stateProvider
            .state('list', {
                url: '/list',
                controller: 'ListCtrl',
                templateUrl: 'app/list/list.html'
            })
            .state('manage', {
                url: '/manage',
                controller: 'ManageCtrl',
                templateUrl: 'app/manage/manage.html'
            });
        $urlRouterProvider.otherwise('/list');
    });
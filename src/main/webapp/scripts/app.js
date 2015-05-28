'use strict';

/**
 * @ngdoc overview
 * @name bulkloaderApp
 * @description
 * # bulkloaderApp
 *
 * Main module of the application.
 */
var bulkloaderApp = angular
    .module('bulkloaderApp', [
        'ngAnimate',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ui.tree',
        'ui.tree-filter',
        'ui.select',
        'ui.grid',
        'ui.grid.pagination',
        'ui.grid.autoResize',
        'ngMaterial',
        'ui.bootstrap',
        'notifications',
        'config',
        'CloudElementsUtils'
    ]);
bulkloaderApp.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'picker.html',
            controller: 'PickerController'
        })
        .when('/credentials', {
            templateUrl: 'credentials.html',
            controller: 'CredentialsController'
        })
        .when('/datalist', {
            templateUrl: 'datalist.html',
            controller: 'DatalistController'
        })
        .when('/mapper', {
            templateUrl: 'mapper.html',
            controller: 'MapperController'
        })
        .when('/schedule', {
          templateUrl: 'schedule.html',
          controller: 'ScheduleController'
        })
        .when('/jobhistory', {
            templateUrl: 'jobhistory.html',
            controller: 'JobHistoryController'
        });
});
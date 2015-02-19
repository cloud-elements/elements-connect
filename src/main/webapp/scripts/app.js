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
        'notifications',
        'CloudElementsUtils'
    ]);

bulkloaderApp.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'scripts/picker/picker.html',
            controller: 'PickerController'
        })
        .when('/datalist', {
            templateUrl: 'scripts/datalist/datalist.html',
            controller: 'DatalistController'
        });
});

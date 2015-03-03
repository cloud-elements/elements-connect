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
        'ui.select',
        'ngMaterial',
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

// CONTROLLERS ============================================
// This is for transitions

// picker page controller
bulkloaderApp.controller('PickerController', function($scope) {
    $scope.pageClass = 'page-picker';
});

// datalist page controller
bulkloaderApp.controller('DatalistController', function($scope) {
    $scope.pageClass = 'page-datalist';
});
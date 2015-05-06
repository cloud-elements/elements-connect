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
        'ui.bootstrap',
        'notifications',
        'config',
//        'cgBusy',
        'CloudElementsUtils'
    ]);

//bulkloaderApp.value('cgBusyDefaults',{
//    message:'Loading...',
//    backdrop: false,
//    templateUrl: 'my_custom_template.html'
////    ,delay: 300,
////    minDuration: 700,
////    wrapperClass: 'my-class my-class2'
//});


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
        });
});

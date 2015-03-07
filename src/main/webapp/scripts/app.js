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
        'ui.bootstrap',
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
            templateUrl: 'scripts/picker/picker.html',
            controller: 'PickerController'
        })
        .when('/datalist', {
            templateUrl: 'scripts/datalist/datalist.html',
            controller: 'DatalistController'
        });
});

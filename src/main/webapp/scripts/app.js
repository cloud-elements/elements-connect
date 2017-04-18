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
        'ui.ace',
        'ui.tree',
        'ui.tree-filter',
        'ui.select',
        'ui.grid',
        'ui.grid.pagination',
        'ui.grid.autoResize',
        'ui.grid.selection',
        'ngFileUpload',
        'slick',
        'ngMaterial',
        'ui.bootstrap',
        'notifications',
        'config',
        'CloudElementsUtils',
        'Application'
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
        })
        .when('/history', {
            templateUrl: 'caaashistory.html',
            controller: 'CAaaSHistoryController'
        })
        .when('/jobs', {
            templateUrl: 'jobs.html',
            controller: 'JobsController'
        })
        .when('/hubspotelementloader', {
            templateUrl: 'landingpages/hubspotlanding.html',
            controller: 'LandingController'
        })
        .when('/elementloader', {
            templateUrl: 'landingpages/elementloader.html',
            controller: 'LandingController'
        })
        .when('/signup', {
            templateUrl: 'credentials.html',
            controller: 'CredentialsController'
        })
        .when('/formulas', {
            templateUrl: 'formula.html',
            controller: 'FormulaController'
        });
});
/**
 * Help controller for selecting the fields.
 *
 *
 * @author Paris
 */

var HelpController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _instances: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init:function($scope, CloudElementsUtils, Picker, Notifications, MaskLoader, Help, $window, $location, $filter, $route, $modal, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._help = Help;
        me.$modal = $modal;
        me.$mdDialog = $mdDialog;
        me.$window = $window;
        me._maskLoader = MaskLoader;
        me.$location = $location;
        me._super($scope);
    },

    defineScope:function() {
        var me = this;
        me.$scope.cancel = me.cancel.bind(me);


        me.$scope.helpList = [
            {imageURL: 'BulkloaderClickThrough-1.png'},
            {imageURL: 'BulkloaderClickThrough-2.png'},
            {imageURL: 'BulkloaderClickThrough-3.png'},
            {imageURL: 'BulkloaderClickThrough-4.png'},
            {imageURL: 'BulkloaderClickThrough-5.png'},
            {imageURL: 'BulkloaderClickThrough-6.png'},
            {imageURL: 'BulkloaderClickThrough-7.png'},
            {imageURL: 'BulkloaderClickThrough-8.png'},
            {imageURL: 'BulkloaderClickThrough-9.png'},
            {imageURL: 'BulkloaderClickThrough-10.png'},
            {imageURL: 'BulkloaderClickThrough-11.png'},
            {imageURL: 'BulkloaderClickThrough-12.png'},
            {imageURL: 'BulkloaderClickThrough-13.png'},
            {imageURL: 'BulkloaderClickThrough-14.png'}
        ]
    },

    cancel: function() {
        var me = this;

        me._help.closeHelp();
    }

});

HelpController.$inject = ['$scope','CloudElementsUtils','Picker', 'Notifications', 'MaskLoader', 'Help', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('HelpController', HelpController);




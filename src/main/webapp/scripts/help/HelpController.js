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
    _application: null,
    _instances: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init:function($scope, CloudElementsUtils, Picker, Application, Notifications, MaskLoader, Help, $window, $location, $filter, $route, $modal, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._application = Application;
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

        if (me._application.getView() == 'mapper') {
            me.$scope.helpList = [
                {imageURL: 'help-images/BulkloaderClickThrough-1.png', text:'Select a service, the source of your data..'},
                {imageURL: 'help-images/BulkloaderClickThrough-2.png', text:'Enter your credentials for that service.'},
                {imageURL: 'help-images/BulkloaderClickThrough-3.png', text:'Select HubSpot to connect your account.'},
                {imageURL: 'help-images/BulkloaderClickThrough-4.png', text:'Enter your HubSpot Portal ID.'},
                {imageURL: 'help-images/BulkloaderClickThrough-5.png', text:'Login to your HubSpot account.'},
                {imageURL: 'help-images/BulkloaderClickThrough-6.png', text:'Authorize the application.'},
                {imageURL: 'help-images/BulkloaderClickThrough-7.png', text:'Select an object to map from the source application.'},
                {imageURL: 'help-images/BulkloaderClickThrough-8.png', text:'Select an object to map form target application.'},
                {imageURL: 'help-images/BulkloaderClickThrough-9.png', text:'Drag and drop the fields you wish to map from the source to the target.'},
                {imageURL: 'help-images/BulkloaderClickThrough-10.png', text:'The "X" will delete a field if necessary.'},
                {imageURL: 'help-images/BulkloaderClickThrough-11.png', text:'Click "Save and Schedule Job".'},
                {imageURL: 'help-images/BulkloaderClickThrough-12.png', text:'Select the calendar to choose a date.  Data will be pulled from your system starting from this date to the present time.'},
                {imageURL: 'help-images/BulkloaderClickThrough-13.png', text:'Click "Schedule Job".'},
                {imageURL: 'help-images/BulkloaderClickThrough-14.png', text:'Click "OK".  An email will notify you when the job has completed.'}
            ]
        } else {
            me.$scope.helpList = [
                {imageURL: 'wise-help-images/BulkloaderClickThrough-01.png', text:'Select a service, the source of your data.'},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-02.png', text:'Enter your credentials for that service.'},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-03.png', text:'Select an object to map from the source application.'},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-04.png', text:'The button at the top will select all fields for the object.'},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-05.png', text:'Or select the fields you wish to map.'},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-06.png', text:'Click "Save and Schedule Job".'},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-07.png', text:'Select the calendar to choose a date.  Data will be pulled from your system starting from this date to the present time.'},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-08.png', text:'Click "Schedule Job".'},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-09.png', text:'Click "OK".  An email will notify you when the job has completed.'}
            ]
        }

    },

    cancel: function() {
        var me = this;

        me._help.closeHelp();
    }

});

HelpController.$inject = ['$scope','CloudElementsUtils','Picker', 'Application', 'Notifications', 'MaskLoader', 'Help', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('HelpController', HelpController);




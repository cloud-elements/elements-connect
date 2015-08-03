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
                {imageURL: 'help-images/BulkloaderClickThrough-1.png', steps:[{text:'1. Select a service, the source of your data.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-2.png', steps:[{text:'2. Enter Zoho Username'}, {text:'3. Enter Zoho Password.'}, {text:'4. Click "Create".'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-3.png', steps:[{text:'5. Select HubSpot to connect your account.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-4.png', steps:[{text:'6. Enter your HubSpot Portal ID.'}, {text:'7. Click "Create".'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-5.png', steps:[{text:'8. Login to your HubSpot Account.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-6.png', steps:[{text:'9. Authorize the application.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-7.png', steps:[{text:'10. Select an object to map from the source application.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-8.png', steps:[{text:'11. Drag and drop the fields you wish to map from the source to the target.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-9.png', steps:[{text:'12. The "X" will delete a field if necessary.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-10.png', steps:[{text:'13. Click "Save and Schedule Job".'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-11.png', steps:[{text:'14. Select the calendar to choose a date.  Data will be pulled from your system starting from this date to the present time.'}, {text: '15. Select Date'}, {text:'16. Click "Transfer Now"'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-12.png', steps:[{text:'17. Click "OK".  An email will notify you when the job has completed.'}]}
            ]
        } else {
            me.$scope.helpList = [
                {imageURL: 'wise-help-images/BulkloaderClickThrough-01.png', steps:[{text:'Select a service, the source of your data.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-02.png', steps:[{text:'Enter your credentials for that service.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-03.png', steps:[{text:'Select an object to map from the source application.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-04.png', steps:[{text:'The button at the top will select all fields for the object.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-05.png', steps:[{text:'Or select the fields you wish to map.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-06.png', steps:[{text:'Click "Save and Schedule Job".'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-07.png', steps:[{text:'Select the calendar to choose a date.  Data will be pulled from your system starting from this date to the present time.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-08.png', steps:[{text:'Click "Schedule Job".'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-09.png', steps:[{text:'Click "OK".  An email will notify you when the job has completed.'}]}
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




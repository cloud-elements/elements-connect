/**
 * AppKey controller for selecting the fields.
 *
 *
 * @author Paris
 */

var AppKeyController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _datalist: null,
    _appKey: null,
    _instances: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init:function($scope, CloudElementsUtils, Picker, Datalist, AppKey, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._datalist = Datalist;
        me._appKey = AppKey;
        me.$modal = $modal;
        me.$mdDialog = $mdDialog;
        me.$window = $window;
        me._maskLoader = MaskLoader;
        me.$location = $location;
        me._super($scope);
    },

    defineScope:function() {
        var me = this;

        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.save = me.save.bind(this);
        me.$scope.apiKey;

    },

    defineListeners:function(){
        var me = this;

//        me._notifications.addEventListener(bulkloader.events.SHOW_SCHEDULER, me._seedSchedule.bind(me));
    },

    cancel: function() {
        var me = this;
        me._appKey.closeAppKey();
    },

    save: function() {
        var me = this;
        me._picker.setAppKey(me.$scope.apiKey);
        me._notifications.notify(bulkloader.events.APPKEY_ENTERED, "Done");
        me._appKey.closeAppKey();
    }
});

AppKeyController.$inject = ['$scope','CloudElementsUtils','Picker', 'Datalist', 'AppKey', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('AppKeyController', AppKeyController);
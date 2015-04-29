/**
 * CreateInstanceController controller for selecting the fields.
 *
 *
 * @author Paris
 */

var CreateInstanceController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _datalist: null,
    _createinstance: null,
    _instances: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init:function($scope, CloudElementsUtils, Picker, Datalist, CreateInstance, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._datalist = Datalist;
        me._createinstance = CreateInstance;
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
        me.$scope.element = me._createinstance.elementConfig.configs;
        me.$scope.elementName = me._createinstance.elementConfig.name;

    },

    defineListeners:function(){
        var me = this;

//        me._notifications.addEventListener(bulkloader.events.SHOW_SCHEDULER, me._seedSchedule.bind(me));
    },

    cancel: function() {
        var me = this;

        me._createinstance.closeCreateInstance();
    },

    save: function() {
        var me = this;
    },

    clear: function () {
        var me = this;
        me.$scope.queryStartDate = null;
    },

    open: function($event) {
        var me = this;
        $event.preventDefault();
        $event.stopPropagation();

        me.$scope.opened = true;
    }

});

CreateInstanceController.$inject = ['$scope','CloudElementsUtils','Picker', 'Datalist', 'CreateInstance', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('CreateInstanceController', CreateInstanceController);




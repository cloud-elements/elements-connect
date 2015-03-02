/**
 * Datalist controller for selecting the fields.
 *
 *
 * @author Ramana
 */

var DatalistController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _datalist: null,
    _instances: null,

    init:function($scope, CloudElementsUtils, Picker, Datalist, Notifications, $window, $location, $filter, $route){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._datalist = Datalist;
        me.$window = $window;
        me.$location = $location;
        me._super($scope);
    },

    defineScope:function() {
        var me = this;

        me.$scope.instanceObjects = [];
        me.$scope.selectedObject = {};
        me.$scope.objectMetaData = [];

        //Mapping of UI actions to methods to be invoked
        me.$scope.refreshObjectMetaData = me.refreshObjectMetaData.bind(this);

        // Handling Booleans to display and hide UI
        me.$scope.showTree = false;


        me._loadInstanceObjects();
    },

    defineListeners:function(){
        var me = this;
        me._super();

        //Needed this for back and forth between datalist and Picker, if the datalist is reinitializes every time, this is not required
        me._notifications.addEventListener(bulkloader.events.VIEW_CHANGE_DATALIST, me._loadInstanceObjects.bind(me));

    },

    refreshObjectMetaData: function() {
        var me = this;

        me._datalist.loadObjectMetaData(me._picker.selectedElementInstance, me.$scope.selectedObject)
            .then(me._handleOnMetadataLoad.bind(me, me.$scope.selectedObject));
    },

    _handleOnMetadataLoad: function(objectname,data) {
        var me = this;
        me.$scope.objectMetaData = data.fields;
        me.$scope.selectedObject = objectname;
        me.$scope.showTree = true;
    },

    _loadInstanceObjects: function() {
        var me = this;
        //Load the objects for the element
        me._datalist.loadInstanceObjects(me._picker.selectedElementInstance)
            .then(me._handleOnInstanceObjectsLoad.bind(me));
    },

    _handleOnInstanceObjectsLoad: function(data) {
        var me = this;
        me.$scope.instanceObjects = data;
    }

});

DatalistController.$inject = ['$scope','CloudElementsUtils','Picker', 'Datalist', 'Notifications', '$window', '$location', '$filter', '$route'];


angular.module('bulkloaderApp')
    .controller('DatalistController', DatalistController);
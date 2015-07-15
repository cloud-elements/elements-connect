/**
 * Datalist controller for selecting the fields.
 *
 *
 * @author Ramana
 */

var DatalistController = BaseController.extend({

    _application: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _datalist: null,
    _instances: null,
    _schedule: null,
    _maskLoader: null,

    init: function($scope, Application, CloudElementsUtils, Picker, Datalist, Notifications, Schedule, MaskLoader, $window, $location, $filter, $route, $mdDialog) {
        var me = this;

        me._application = Application;
        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._datalist = Datalist;
        me._schedule = Schedule;
        me.$window = $window;
        me.$location = $location;
        me.$mdDialog = $mdDialog;
        me._maskLoader = MaskLoader;
        me._super($scope);
    },

    defineScope: function() {
        var me = this;

        // This is for transitions
        me.$scope.pageClass = 'page-datalist';

        me.$scope.instanceObjects = [];
        me.$scope.selectedObject = {};
        me.$scope.objectMetaData = [];
        me.$scope.cbObject = {};
        me.$scope.cbInstance = {};

        //Mapping of UI actions to methods to be invoked
        me.$scope.refreshObjectMetaData = me.refreshObjectMetaData.bind(this);

        // Handling Booleans to display and hide UI
        me.$scope.showTree = false;

        //Handling Action Methods
        me.$scope.save = me.save.bind(this);
        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.showTreeToggle = me.showTreeToggle.bind(this);
        me.$scope.toggle = this.toggle.bind(this);

        me.$scope.checkAllInstance = me.checkAllInstance.bind(this);
        me.$scope.checkAllObjects = me.checkAllObjects.bind(this);
        me.$scope.processtep = 'datalist';

        me.$scope.unCheckObject = me.unCheckObject.bind(this);
        me._seedDatalist();
    },

    defineListeners: function() {
        var me = this;
        me._super();
        //Needed this for back and forth between datalist and Picker, if the datalist is reinitializes every time, this is not required
        me._notifications.addEventListener(bulkloader.events.VIEW_CHANGE_DATALIST, me._seedDatalist.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.TRANSFORMATION_SAVED, me._onTransformationSave.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.ERROR, me._onDatalistError.bind(me), me.$scope.$id);

    },

    destroy: function() {
        var me = this;

        me._notifications.removeEventListener(bulkloader.events.VIEW_CHANGE_DATALIST, me._seedDatalist.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.TRANSFORMATION_SAVED, me._onTransformationSave.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.ERROR, me._onDatalistError.bind(me), me.$scope.$id);
    },

    refreshObjectMetaData: function() {
        var me = this;

        me._maskLoader.show(me.$scope, "Loading Object ...");
        var instanceMeta = me._datalist.all[me._picker.selectedElementInstance.element.key].metadata;
        if(me._cloudElementsUtils.isEmpty(instanceMeta)
            || me._cloudElementsUtils.isEmpty(instanceMeta[me.$scope.selectedObject.select.name])) {

            me._datalist.loadObjectMetaData(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name)
                .then(me._handleOnMetadataLoad.bind(me, me.$scope.selectedObject));
        } else {
            me._handleOnMetadataLoad(me.$scope.selectedObject, instanceMeta[me.$scope.selectedObject.select.name]);
        }
    },

    showTreeToggle: function(mapperdata) {
        var me = this;

        if(!me._cloudElementsUtils.isEmpty(mapperdata)
            && ((!me._cloudElementsUtils.isEmpty(mapperdata.fields)
                && mapperdata.fields.length > 0) || !me._datalist._isLiteral(mapperdata.type)))
            return true;
        else
            return false;
    },

    toggle: function(uitree) {
        uitree.toggle();
    },

    _handleOnMetadataLoad: function(obj, data) {
        var me = this;
        me.$scope.objectMetaData = me._cloudElementsUtils.orderObjects(data.fields, 'vendorPath');
//        me.$scope.selectedObject.select = objectname;
        me.$scope.cbObject.checked = obj.select.transformed;
        me.$scope.showTree = true;
        me._maskLoader.hide();
    },

    _seedDatalist: function() {
        var me = this;

        me.$scope.sourceElement = me._picker.getElementConfig(me._picker.selectedElementInstance.element.key, 'source');
        me.$scope.sourceLogo = me.$scope.sourceElement.image;
        me.$scope.sourceName = me.$scope.sourceElement.name;

        if(me._cloudElementsUtils.isEmpty(me._picker.selectedElementInstance)) {
            me.$location.path('/');
            return;
        }

        me._maskLoader.show(me.$scope, 'Loading Objects...');
        //Load the objects for the element
        me._datalist.loadInstanceObjects(me._picker.selectedElementInstance)
            .then(me._handleOnInstanceObjectsLoad.bind(me));

    },

    _handleOnInstanceObjectsLoad: function(data) {
        var me = this;

        me.$scope.instanceObjects = data;
        if(!me._cloudElementsUtils.isEmpty(me.$scope.instanceObjects) && me.$scope.instanceObjects.length > 0) {
            me.$scope.selectedObject.select = me.$scope.instanceObjects[0];
            me.refreshObjectMetaData(me.$scope.selectedObject.select.name);
        } else {
            me._maskLoader.hide();
        }
    },

    cancel: function() {
        var me = this;
        me.$location.path('/');
    },

    save: function() {
        var me = this;
        me._maskLoader.show(me.$scope, 'Saving...');
        var saveStatus = me._datalist.saveDefinitionAndTransformation(me._picker.selectedElementInstance, me.$scope.instanceObjects);

    },

//    _onTransformationSave: function() {
//        //Show the scheduler
//        var me = this;
//        me._maskLoader.hide();
//        //me._notifications.notify(bulkloader.events.SHOW_SCHEDULER);
//        me._schedule.openSchedule();
//    },

    _onTransformationSave: function() {
        var me = this;

        me._maskLoader.hide();
        me.$location.path('/schedule');
    },

    _onDatalistError: function(event, error) {
        var me = this;

        me._maskLoader.hide();
        var confirm = me.$mdDialog.alert()
            .title('Error')
            .content(error)
            .ok('OK');

        me.$mdDialog.show(confirm);
    },

    checkAllInstance: function(cbState, cbObject) {
        var me = this;
        for(var i = 0; i < me.$scope.objectMetaData.length; i++) {
            me.$scope.objectMetaData[i].transform = cbState;
            if(me.$scope.objectMetaData[i].type == "object" || me.$scope.objectMetaData[i].type == "array") {
                var obj = me.$scope.objectMetaData[i].fields;
                for(var metadata in obj) {
                    var metoo = obj[metadata];
                    metoo.transform = cbState;
                }
            }
        }
    },

    unCheckObject: function(cbState, metadata, obj) {
        var me = this;
        var o = obj.length;
        var ownerData;

        while(o--) {
            var n = metadata.actualVendorPath.indexOf(".");
            if(metadata.actualVendorPath.slice(0, n) == obj[o].vendorPath || metadata.actualVendorPath == obj[o].vendorPath) {
                ownerData = obj[o];
                break;
            }
        }

        if(metadata.type == "object" || metadata.type == "array") {
            for(var i = 0; i < metadata.fields.length; i++) {
                metadata.fields[i].transform = cbState;
                if(ownerData.type == "object" && cbState == false) {
                    ownerData.transform = cbState;
                }
            }
        } else {
            metadata.transform = cbState;
            if(cbState == false) {
                ownerData.transform = cbState;
                me.$scope.cbObject.checked = cbState;
            }
        }
    },

    checkAllObjects: function(cbState, cbObject) {
        var me = this;
        for(var i = 0; i < me.$scope.instanceObjects.length; i++) {
            me.$scope.instanceObjects[i].transformed = cbState;
        }
    }
});

DatalistController.$inject = ['$scope', 'Application', 'CloudElementsUtils', 'Picker', 'Datalist', 'Notifications', 'Schedule', 'MaskLoader', '$window', '$location', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('DatalistController', DatalistController);

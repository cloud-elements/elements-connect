/**
 * Datalist controller for selecting the fields.
 *
 *
 * @author Ramana
 */

var MapperController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _datalist: null,
    _mapper: null,
    _instances: null,
    _schedule: null,
    _maskLoader: null,

    init:function($scope, CloudElementsUtils, Picker, Datalist, Mapper, Notifications, Schedule, MaskLoader, $window, $location, $filter, $route){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._datalist = Datalist;
        me._mapper = Mapper;
        me._schedule = Schedule;
        me.$window = $window;
        me.$location = $location;
        me._maskLoader = MaskLoader;
        me._super($scope);
    },

    defineScope:function() {
        var me = this;

        // This is for transitions
        me.$scope.pageClass = 'page-datalist';

        me.$scope.targetObjects = [];
        me.$scope.instanceObjects = [];
        me.$scope.selectedObject = {};
        me.$scope.selectedTargetObject = {};
        me.$scope.objectMetaData = [];
        me.$scope.mapperdata = [];
        me.$scope.cbObject = {};
        me.$scope.cbInstance = {};

        //Mapping of UI actions to methods to be invoked
        me.$scope.refreshObjectMetaData = me.refreshObjectMetaData.bind(this);
        me.$scope.refreshTargetObject = me.refreshTargetObject.bind(this);
        me.$scope.removeMapPath = me.removeMapPath.bind(this);

        // Handling Booleans to display and hide UI
        me.$scope.showTree = false;
        me.$scope.showTargetTree = false;

        //Handling Action Methods
        me.$scope.save = me.save.bind(this);
        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.showTreeToggle = me.showTreeToggle.bind(this);
        me.$scope.toggle = this.toggle.bind(this);

        me.$scope.checkAllInstance = me.checkAllInstance.bind(this);
        me.$scope.checkAllObjects = me.checkAllObjects.bind(this);

        me.$scope.unCheckObject = me.unCheckObject.bind(this);

        this.$scope.mapperTreeOptions = {
            dropped: this.onMetadataTreeDropped.bind(this),
//            dragMove: this.onMetadataDragMove.bind(this)
            accept: this.onMetadataAccept.bind(this)
        };

        me._seedMapper();
    },

    defineListeners:function(){
        var me = this;
        me._super();

        //Needed this for back and forth between datalist and Picker, if the datalist is reinitializes every time, this is not required
        //me._notifications.addEventListener(bulkloader.events.VIEW_CHANGE_DATALIST, me._seedMapper.bind(me));

        me._notifications.addEventListener(bulkloader.events.TRANSFORMATION_SAVED, me._onTransformationSave.bind(me));
        me._notifications.addEventListener(bulkloader.events.DATALIST_ERROR, me._onDatalistError.bind(me));

    },

    onMetadataAccept: function(sourceNodeScope, destNodesScope, destIndex) {
        var me = this;

        if(destNodesScope.$parent.$element[0].id == "tree1-root"
            || destNodesScope.$parent.$element[0].id == "tree1-root-node") {
            return false;
        }

        return true;
    },

    onMetadataTreeDropped: function(event) {

        var me = this;

        if(event.dest.nodesScope.$parent.$element[0].id == "tree1-root"
            || event.dest.nodesScope.$parent.$element[0].id == "tree1-root-node") {
            return false;
        }

        // Cleaning up any object literal mapping classes on drop
        $('.angular-ui-tree-placeholder-mapping-hover').removeClass('angular-ui-tree-placeholder-mapping-hover');
        $('.showMapper').removeClass('literal-mapping');
        event.dest.nodesScope.$parent.$element.addClass('mapped');
        //Checking to see if the parent type is a literal if so just merge the vendor path to the parent and remove the
        //newly added node from source
        //If the Parent is an object or null, then its a new mapping field so enable it for editable

        var modelVal = event.source.nodeScope.$modelValue;
        var parentModelVal = event.dest.nodesScope.$parent.$modelValue;

        if(me._cloudElementsUtils.isEmpty(parentModelVal)) {
            return false;
        }
        else {
            parentModelVal.path = modelVal.actualVendorPath;
            parentModelVal.targetVendorType= modelVal.type;

            if(me._mapper._isLiteral(parentModelVal.type)) {
                parentModelVal.fields=[];
            }

            if(me.$scope.selectedObject.select.transformed == false) {
                me.$scope.selectedObject.select.transformed = true;
            }
        }
    },

    showTreeToggle: function(mapperdata) {
        var me = this;

        if(!me._cloudElementsUtils.isEmpty(mapperdata)
            && !me._mapper._isLiteral(mapperdata.type)) {
            return true;
        }
        else {
            return false;
        }

    },

    toggle: function(uitree) {
        uitree.toggle();
    },

    refreshObjectMetaData: function() {
        var me = this;

        me._maskLoader.show(me.$scope, "Loading Object ...");
        var instanceMeta = me._mapper.all[me._picker.selectedElementInstance.element.key].metadata;
        if(me._cloudElementsUtils.isEmpty(instanceMeta)
            || me._cloudElementsUtils.isEmpty(instanceMeta[me.$scope.selectedObject.select.name])) {

            me._mapper.loadObjectMetaData(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name)
                .then(me._handleOnMetadataLoad.bind(me, me.$scope.selectedObject));
        } else {
            me._handleOnMetadataLoad(me.$scope.selectedObject, instanceMeta[me.$scope.selectedObject.select.name]);
        }
    },

    _handleOnMetadataLoad: function(obj,data) {
        var me = this;
        me.$scope.objectMetaData = me._cloudElementsUtils.orderObjects(data.fields, 'path');
        me.$scope.showTree = true;

        me.$scope.mapperdata = null;
        me.$scope.selectedTargetObject = null;
        me.$scope.showTargetTree = false;

        //Now Check to see if there is a mapping already exists for the object
        //if so just set the target mapper
        //Very dirty fix, not sure how the angular promise is handled as it returns null,
        // handling this in try catch until the angular promise for null is figured out
        try{
            me._mapper.loadObjectMapping(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name,
                me._picker.targetElementInstance, me.$scope.objectMetaData)
                .then(me._handleOnTargetMetamappingLoad.bind(me, me.$scope.selectedObject));
        } catch (e) {
            me._maskLoader.hide();
        }
    },


    refreshTargetObject: function() {
        var me = this;

        me._maskLoader.show(me.$scope, "Loading mapping...");

        var targetMetaMapping = me._mapper.all[me._picker.selectedElementInstance.element.key].metamapping;
        if(me._cloudElementsUtils.isEmpty(targetMetaMapping)
            || me._cloudElementsUtils.isEmpty(targetMetaMapping[me.$scope.selectedTargetObject])) {

            //If the Objects are static and not needed to be loaded from API
            if((!me._cloudElementsUtils.isEmpty(me._picker._target)
                && !me._cloudElementsUtils.isEmpty(me._picker._target.objects))) {

                var metaMapping = me._mapper._createEmptyMapping(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name,
                        me._picker.targetElementInstance, me.$scope.selectedTargetObject,
                        me._mapper.all[me._picker.targetElementInstance.element.key].metadata[me.$scope.selectedTargetObject]);

                me._handleOnTargetMetamappingLoad(me.$scope.selectedTargetObject, metaMapping);
            } else {
                //Calling the API to load the target objectmetadata and mapping
                me._mapper.loadTargetObjectMetaMapping(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name, me._picker.targetElementInstance, me.$scope.selectedTargetObject)
                    .then(me._handleOnTargetMetamappingLoad.bind(me, me.$scope.selectedTargetObject));
            }
        } else {
            me._handleOnTargetMetamappingLoad(me.$scope.selectedTargetObject, targetMetaMapping[me.$scope.selectedTargetObject]);
        }

    },

    _handleOnTargetMetamappingLoad: function(obj, data) {
        var me = this;

        if(!me._cloudElementsUtils.isEmpty(data)) {
            me.$scope.mapperdata =  me._cloudElementsUtils.orderObjects(data.fields, 'vendorPath');
            me.$scope.showTargetTree = true;

            if(me._cloudElementsUtils.isEmpty(me.$scope.selectedTargetObject)) {
                me.$scope.selectedTargetObject = data.name;
            }
        }

        me._maskLoader.hide();
    },

    _seedMapper: function() {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me._picker.selectedElementInstance)
            || me._cloudElementsUtils.isEmpty(me._picker.targetElementInstance)) {

            me.$location.path('/');
            return;
        }

        me.$scope.sourceElement = me._picker.getElementConfig(me._picker.selectedElementInstance.element.key, 'source');
        me.$scope.sourceLogo = me.$scope.sourceElement.image;
        me.$scope.targetLogo = me._picker._target.image;

        me._maskLoader.show(me.$scope, 'Loading Objects...');

        //Load the objects for the element
        me._mapper.loadInstanceObjects(me._picker.selectedElementInstance, me._picker.targetElementInstance)
            .then(me._handleOnInstanceObjectsLoad.bind(me));

    },

    _handleOnInstanceObjectsLoad: function(data) {
        var me = this;

        me.$scope.instanceObjects = data;
        me.$scope.targetObjects = me._mapper.all[me._picker.targetElementInstance.element.key].objects;
        me.$scope.selectedObject.select = me.$scope.instanceObjects[0];
        me.refreshObjectMetaData(me.$scope.selectedObject.select.name);
    },

    cancel: function() {
        var me = this;
        me.$location.path('/');
    },

    save: function() {
        var me = this;
        me._maskLoader.show(me.$scope, 'Saving...');
        var saveStatus = me._mapper.saveDefinitionAndTransformation(me._picker.selectedElementInstance, me._picker.targetElementInstance, me.$scope.instanceObjects);

    },

    _onTransformationSave: function() {
        //Show the scheduler
        var me = this;
        me._maskLoader.hide();
        //me._notifications.notify(bulkloader.events.SHOW_SCHEDULER);
        me._schedule.openSchedule();
    },

    _onDatalistError: function() {
        var me = this;
    },

    checkAllInstance: function(cbState, cbObject) {
        var me = this;
        for (var i = 0; i < me.$scope.objectMetaData.length; i++) {
            me.$scope.objectMetaData[i].transform = cbState;
            if(me.$scope.objectMetaData[i].type == "object" || me.$scope.objectMetaData[i].type == "array"){
                var obj = me.$scope.objectMetaData[i].fields;
                for(var metadata in obj){
                    var metoo = obj[metadata];
                    metoo.transform = cbState;
                }
            }
        }
    },

    unCheckObject: function(cbState, metadata, obj){
        var me = this;
        var o = obj.length;
        var ownerData;

        while(o--) {
            var n = metadata.actualVendorPath.indexOf(".");
            if(metadata.actualVendorPath.slice(0,n) == obj[o].vendorPath || metadata.actualVendorPath == obj[o].vendorPath) {
                ownerData = obj[o];
                break;
            }
        }

        if(metadata.type == "object" || metadata.type == "array") {
            for (var i = 0; i < metadata.fields.length; i++) {
                metadata.fields[i].transform = cbState;
                if(ownerData.type == "object" && cbState == false){
                    ownerData.transform = cbState;
                }
            }
        }else{
            metadata.transform = cbState;
            if(cbState == false){
                ownerData.transform = cbState;
                me.$scope.cbObject.checked = cbState;
            }
        }
    },

    checkAllObjects: function(cbState, cbObject) {
        var me = this;
        for (var i = 0; i < me.$scope.instanceObjects.length; i++) {
            me.$scope.instanceObjects[i].transformed = cbState;
        }
    },

    removeMapPath: function(treenode) {
        var me = this;

        var obj = treenode.$nodeScope.$modelValue;

        if(me._cloudElementsUtils.isEmpty(obj.vendorPath)) {
            return;
        }

        this._populateBackToMetaData(obj.vendorPath, obj.targetVendorType, obj.vendorPath, me.$scope.objectMetaData);
        obj.vendorPath = null;
        obj.targetVendorType = null;
    },

    _findAndGetInnerMetadata: function(objField, metadatafields) {
        for(var i=0; i< metadatafields.length; i++) {
            var field = metadatafields[i];

            if(field.vendorPath == objField) {
                return field;
            }
        }
    },

    _populateBackToMetaData: function(targetVendorPath, targetVendorType, actualTargetVendorPath, metadatafields) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(targetVendorType)) {
            targetVendorType = 'string';
        }

        if(me._cloudElementsUtils.isEmpty(targetVendorPath)) {
            return;
        }

        if(targetVendorPath.indexOf('.') != -1) {
            //Find the inner object inside metadata and add it to it
            var fieldParts = targetVendorPath.split('.').slice(1).join('.');
            var objField = targetVendorPath.split('.')[0];

            var innerMetadata = me._findAndGetInnerMetadata(objField, metadatafields);
            if(this._cloudElementsUtils.isEmpty(innerMetadata)) {
                var t = 'object';

                if(objField.indexOf('[*]') != -1) {
                    t = 'array';
                }

                innerMetadata = {
                    fields : [],
                    vendorPath: objField,
                    actualVendorPath: objField,
                    type: t
                };

                metadatafields.push(innerMetadata);
            }

            me._populateBackToMetaData(fieldParts, targetVendorType,  actualTargetVendorPath, innerMetadata.fields);
        }
        else{

            var oldObj = {
                vendorPath: targetVendorPath,
                type: targetVendorType,
                actualVendorPath: actualTargetVendorPath
            };

            metadatafields.push(oldObj);
        }
    }
});

MapperController.$inject = ['$scope','CloudElementsUtils','Picker', 'Datalist', 'Mapper', 'Notifications', 'Schedule', 'MaskLoader', '$window', '$location', '$filter', '$route'];


angular.module('bulkloaderApp')
    .controller('MapperController', MapperController);

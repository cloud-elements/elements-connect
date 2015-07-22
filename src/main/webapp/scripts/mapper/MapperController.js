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

    init: function($scope, CloudElementsUtils, Picker, Datalist, Mapper, Notifications, Schedule, MaskLoader, $window, $location, $filter, $route, $mdDialog) {
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
        me.$mdDialog = $mdDialog;
        me.$filter = $filter;
        me._super($scope);
    },

    defineScope: function() {
        var me = this;

        me.checkContinue();

        // This is for transitions
        me.$scope.pageClass = 'page-datalist';

        me.$scope.targetObjects = [];
        me.$scope.instanceObjects = [];
        me.$scope.selectedObject = {};
        me.$scope.selectedTargetObject = {};
        me.$scope.objectMetaData = [];
        me.$scope.mapperdata = [];
        me.$scope.mapper = {};
        me.$scope.cbObject = {};
        me.$scope.cbInstance = {};
        me.$scope.mapperwhere = [];

        //Mapping of UI actions to methods to be invoked
        me.$scope.refreshObjectMetaData = me.refreshObjectMetaData.bind(this);
        me.$scope.refreshTargetObject = me.refreshTargetObject.bind(this);
        me.$scope.removeMapPath = me.removeMapPath.bind(this);

        // Handling Booleans to display and hide UI
        me.$scope.showTree = false;
        me.$scope.showTargetTree = false;
        me.$scope.bidirectionalMapping = false;

        //Handling Action Methods
        me.$scope.save = me.save.bind(this);
        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.showTreeToggle = me.showTreeToggle.bind(this);
        me.$scope.toggle = this.toggle.bind(this);
        me.$scope.treeFilter = me.$filter('uiTreeFilter');
        me.$scope.checkAllInstance = me.checkAllInstance.bind(this);
        me.$scope.checkAllObjects = me.checkAllObjects.bind(this);

        me.$scope.unCheckObject = me.unCheckObject.bind(this);
        me.$scope.showTargetObjectSelection = false;
        me.$scope.processtep = 'mapper';

        this.$scope.mapperTreeOptions = {
            dropped: this.onMetadataTreeDropped.bind(this),
//            dragMove: this.onMetadataDragMove.bind(this)
            accept: this.onMetadataAccept.bind(this)
        };

        me._seedMapper();
    },

    defineListeners: function() {
        var me = this;
        me._super();

        //Needed this for back and forth between datalist and Picker, if the datalist is reinitializes every time, this is not required
        //me._notifications.addEventListener(bulkloader.events.VIEW_CHANGE_DATALIST, me._seedMapper.bind(me));

        me._notifications.addEventListener(bulkloader.events.TRANSFORMATION_SAVED, me._onTransformationSave.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.ERROR, me._onMapperError.bind(me), me.$scope.$id);

    },

    destroy: function() {
        var me = this;
        me._notifications.removeEventListener(bulkloader.events.TRANSFORMATION_SAVED, me._onTransformationSave.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.ERROR, me._onMapperError.bind(me), me.$scope.$id);
    },

    //This function checks if we need to continue in scheduling
    checkContinue: function() {
        var me = this;
        //Redirect to home page if null
        if(me._cloudElementsUtils.isEmpty(me._picker.selectedElementInstance)) {
            me.$location.path('/');
        }
    },

    onMetadataAccept: function(sourceNodeScope, destNodesScope, destIndex) {
        var me = this;

        if(destNodesScope.$parent.$element[0].id == "tree1-root"
            || destNodesScope.$parent.$element[0].id == "tree1-root-node") {
            return false;
        }

        var targetModelValue = destNodesScope.$parent.$modelValue;
        var srcModelValue = sourceNodeScope.$parent.$modelValue;
        if(me._cloudElementsUtils.isEmpty(targetModelValue)
            || targetModelValue == undefined
            || targetModelValue.type == 'object'
            || targetModelValue.type == 'array'
            || srcModelValue.type == 'object'
            || srcModelValue.type == 'array') {
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
        //Checking to see if the parent type is a literal if so just merge the vendor path to the parent and remove the
        //newly added node from source
        //If the Parent is an object or null, then its a new mapping field so enable it for editable

        var modelVal = event.source.nodeScope.$modelValue;
        var parentModelVal = event.dest.nodesScope.$parent.$modelValue;

        if(me._cloudElementsUtils.isEmpty(parentModelVal)
            || parentModelVal.type == 'object'
            || parentModelVal.type == 'array') {
            return false;
        }
        else {
            if(parentModelVal.path != null) {
                this._populateBackToMetaData(parentModelVal.path, parentModelVal.targetVendorType, parentModelVal.path, me.$scope.objectMetaData);
            }
            parentModelVal.path = modelVal.actualVendorPath;
            parentModelVal.targetVendorType = modelVal.type;

            if(me._mapper._isLiteral(parentModelVal.type)) {
                parentModelVal.fields = [];
            }
            if(me.$scope.selectedObject.select.transformed == false) {
                me.$scope.selectedObject.select.transformed = true;
            }
            event.dest.nodesScope.$parent.$element.addClass('mapped');
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

    refreshObjectMetaData: function(checkWhereFields, checkRequired) {
        var me = this;

        //First check if existing Where condition mandatory ones are filled, if not warn user
        if((me._cloudElementsUtils.isEmpty(checkWhereFields) || checkWhereFields == true)
            && !me._cloudElementsUtils.isEmpty(me.$scope.mapperwhere)) {
            for(var i = 0; i < me.$scope.mapperwhere.length; i++) {
                var mw = me.$scope.mapperwhere[i];
                if(me._cloudElementsUtils.isEmpty(mw.value) && mw.required == true) {

                    var confirm = me.$mdDialog.confirm()
                        .title('Missing required fields')
                        .content("Missing required value " + mw.name + " for object " + me.$scope.selectedSourceObject.name + ". Do you still want to continue ?")
                        .ok('Yes')
                        .cancel('No');

                    me.$mdDialog.show(confirm).then(function() {
                        //continue
                        me.refreshObjectMetaData(false, true);
                    }, function() {
                        //Don't do anything
                        me.$scope.selectedObject.select = me.$scope.selectedSourceObject;
                    });
                    return false;
                }
            }
        }

        //Check to see if there are any missed required mappings and warn the user before switching
        if(me._cloudElementsUtils.isEmpty(checkRequired) || checkRequired == true) {
            //Check for missing required mappings and warning
            var missingRequired = me._validateForRequiredMappings(this.$scope.mapperdata);
            if(!me._cloudElementsUtils.isEmpty(missingRequired)) {
                var confirm = me.$mdDialog.confirm()
                    .title('Missing required mapping')
                    .content("Missing required mapping " + missingRequired + " for object " + me.$scope.selectedTargetObject.name + ". Do you still want to continue ?")
                    .ok('Yes')
                    .cancel('No');

                me.$mdDialog.show(confirm).then(function() {
                    //continue
                    me.refreshObjectMetaData(false, false);
                }, function() {
                    //Don't do anything
                    me.$scope.selectedObject.select = me.$scope.selectedSourceObject;
                });

                return;
            }
        }

        me._maskLoader.show(me.$scope, "Loading Object fields...");
        me.$scope.showTargetObjectSelection = false;
        me.$scope.selectedSourceObject = me.$scope.selectedObject.select;
//        Get the Where condition objects for the source element
        if(!me._cloudElementsUtils.isEmpty(me._mapper.all[me._picker.selectedElementInstance.element.key])
            && !me._cloudElementsUtils.isEmpty(me._mapper.all[me._picker.selectedElementInstance.element.key].objectsWhere)) {
            me.$scope.mapperwhere = me._mapper.all[me._picker.selectedElementInstance.element.key].objectsWhere[me.$scope.selectedObject.select.name];
        } else {
            me.$scope.mapperwhere = null;
        }

        var metadata = null;
        if(!me._cloudElementsUtils.isEmpty(me._mapper.all[me._picker.selectedElementInstance.element.key].metadataflat)) {
            metadata = me._mapper.all[me._picker.selectedElementInstance.element.key].metadataflat[me.$scope.selectedObject.select.name];
        }

        if(me._cloudElementsUtils.isEmpty(metadata)) {
            me._mapper.loadObjectMetaData(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name, me._picker.targetElementInstance)
                .then(me._handleOnMetadataLoad.bind(me, me.$scope.selectedObject));
        } else {
            var data = me._mapper.loadObjectMetaDataFromCache(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name, me._picker.targetElementInstance);
            me._handleOnMetadataLoad(me.$scope.selectedObject, data);
        }
    },

    _handleOnMetadataLoad: function(obj, data) {
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
        try {
            me._mapper.loadObjectMapping(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name,
                me._picker.targetElementInstance, me.$scope.objectMetaData)
                .then(me._handleOnTargetMetamappingLoad.bind(me, me.$scope.selectedObject));
        } catch(e) {
            me.$scope.showTargetObjectSelection = true;
            me._maskLoader.hide();
        }
    },

    refreshTargetObject: function() {
        var me = this;

        //First Check if there is me.$scope.mapperdata, if so reload the information from source
        //TODO Think of the model of implementing this
//        if(!me._cloudElementsUtils.isEmpty(me.$scope.mapperdata)) {
//            var metadata = null;
//            if(!me._cloudElementsUtils.isEmpty(me._mapper.all[me._picker.selectedElementInstance.element.key].metadataflat)) {
//                metadata = me._mapper.all[me._picker.selectedElementInstance.element.key].metadataflat[me.$scope.selectedObject.select.name];
//            }
//
//            if(!me._cloudElementsUtils.isEmpty(metadata)) {
//                var data = me._mapper.loadObjectMetaDataFromCache(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name, me._picker.targetElementInstance);
//                me.$scope.objectMetaData = me._cloudElementsUtils.orderObjects(data.fields, 'path');
//                me.$scope.showTree = true;
//            }
//        }

        me._maskLoader.show(me.$scope, "Loading mapping...");

        //Get the targetmapping
        var targetMetaMapping = me._mapper.getTargetMetaMapping(me._picker.targetElementInstance, me.$scope.selectedObject.select.name, me.$scope.selectedTargetObject);
        if(me._cloudElementsUtils.isEmpty(targetMetaMapping)) {
            //Calling the API to load the target objectmetadata and mapping
            var trn = new Object();
            trn.vendorName = me.$scope.selectedTargetObject;
            me._mapper.loadTargetObjectMetaMapping(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name, me._picker.targetElementInstance, trn)
                .then(me._handleOnTargetMetamappingLoad.bind(me, me.$scope.selectedTargetObject));
        } else {
            me._handleOnTargetMetamappingLoad(me.$scope.selectedTargetObject, targetMetaMapping);
        }
    },

    _handleOnTargetMetamappingLoad: function(obj, data) {
        var me = this;

        if(!me._cloudElementsUtils.isEmpty(data)) {
            var sortby = 'vendorPath';
            if(me._mapper.hasDisplayName(me._picker.targetElementInstance, data.vendorName) == true) {
                sortby = 'vendorDisplayName';
            }
            me.$scope.mapper = data;
            me.$scope.mapperdata = me._cloudElementsUtils.orderObjects(data.fields, sortby);
            me.$scope.showTargetTree = true;

            if(me._cloudElementsUtils.isEmpty(me.$scope.selectedTargetObject)) {
                me.$scope.selectedTargetObject = data.vendorName;
            }
            me.$scope.showTargetObjectSelection = false;
        } else {
            me.$scope.showTargetObjectSelection = true;
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

        me.$scope.bidirectionalMapping = false; //TODO Find if their is bidirectional mapping exists..thats looking at the source transformations
        me.$scope.sourceElement = me._picker.getElementConfig(me._picker.selectedElementInstance.element.key, 'source');
        me.$scope.sourceLogo = me.$scope.sourceElement.image;
        me.$scope.targetLogo = me._picker._target.image;
        me.$scope.sourceName = me.$scope.sourceElement.name;
        me.$scope.targetName = me._picker._target.name;

        me._maskLoader.show(me.$scope, 'Loading Objects...');

        //Load the objects for the element
        me._mapper.loadInstanceObjects(me._picker.selectedElementInstance, me._picker.targetElementInstance)
            .then(me._handleOnInstanceObjectsLoad.bind(me));

    },

    _handleOnInstanceObjectsLoad: function(data) {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(data)) {
            return;
        }

        me.$scope.instanceObjects = data;
        me.$scope.targetObjects = me._mapper.all[me._picker.targetElementInstance.element.key].objects;
        me.$scope.selectedObject.select = me.$scope.instanceObjects[0];
        me.refreshObjectMetaData(me.$scope.selectedObject.select.name);
    },

    cancel: function() {
        var me = this;
        me.$location.path('/');
    },

    save: function(checkWhereFields) {
        var me = this;

        //First check if existing Where condition mandatory ones are filled, if not warn user
        if((me._cloudElementsUtils.isEmpty(checkWhereFields) || checkWhereFields == true)
            && !me._cloudElementsUtils.isEmpty(me.$scope.mapperwhere)) {
            for(var i = 0; i < me.$scope.mapperwhere.length; i++) {
                var mw = me.$scope.mapperwhere[i];
                if(me._cloudElementsUtils.isEmpty(mw.value) && mw.required == true) {

                    var confirm = me.$mdDialog.confirm()
                        .title('Missing required fields')
                        .content("Missing required value " + mw.name + " for object " + me.$scope.selectedSourceObject.name + ". Do you still want to continue ?")
                        .ok('Yes')
                        .cancel('No');

                    me.$mdDialog.show(confirm).then(function() {
                        //continue
                        me.save(false);
                    }, function() {
                        //Don't do anything
                    });
                    return false;
                }
            }
        }

        //Check for missing required mappings and warning
        var missingRequired = me._validateForRequiredMappings(this.$scope.mapperdata);
        if(!me._cloudElementsUtils.isEmpty(missingRequired)) {
            var confirm = me.$mdDialog.confirm()
                .title('Missing required mapping')
                .content("Missing required mapping " + missingRequired + " for object " + me.$scope.selectedTargetObject.name + ". Do you still want to continue ?")
                .ok('Yes')
                .cancel('No');

            me.$mdDialog.show(confirm).then(function() {
                //continue
                me._continueToSave();
            }, function() {
                //Don't do anything
            });
        } else {
            me._continueToSave();
        }
    },

    _validateForRequiredMappings: function(mapperdata) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(mapperdata)
            || me._cloudElementsUtils.isEmpty(mapperdata.fields)
            || mapperdata.fields.length == 0) {
            return null;
        }

        var missingRequired = null;
        for(var i = 0; i < mapperdata.fields.length; i++) {
            var md = mapperdata.fields[i];

            if(me._cloudElementsUtils.isEmpty(md.fields)
                || md.fields.length == 0) {

                if(md.vendorRequired == true &&
                    me._cloudElementsUtils.isEmpty(md.path)) {
                    missingRequired = (md.vendorDisplayName) == null ? md.vendorPath : md.vendorDisplayName;
                }

            } else {
                missingRequired = me._validateForRequiredMappings(md);
            }

            if(!this._cloudElementsUtils.isEmpty(missingRequired)) {
                break;
            }
        }

        return missingRequired;
    },

    _continueToSave: function() {
        var me = this;

        me._maskLoader.show(me.$scope, 'Saving...');
        var saveStatus = me._mapper.saveDefinitionAndTransformation(me._picker.selectedElementInstance,
                                                                    me._picker.targetElementInstance,
                                                                    me.$scope.instanceObjects);
    },

    _onTransformationSave: function() {
        var me = this;

        me._maskLoader.hide();
        me.$location.path('/schedule');
    },

    _onMapperError: function(event, error) {
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
    },

    removeMapPath: function(treenode) {
        var me = this;

        var obj = treenode.$nodeScope.$modelValue;

        if(me._cloudElementsUtils.isEmpty(obj.path)) {
            return;
        }
        treenode.$nodeScope.$element.removeClass('mapped');

        this._populateBackToMetaData(obj.path, obj.targetVendorType, obj.path, me.$scope.objectMetaData);
        obj.path = null;
        obj.targetVendorType = null;
    },

    _findAndGetInnerMetadata: function(objField, metadatafields) {
        for(var i = 0; i < metadatafields.length; i++) {
            var field = metadatafields[i];

            if(field.path == objField) {
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
                    fields: [],
                    path: objField,
                    actualVendorPath: objField,
                    type: t
                };

                metadatafields.push(innerMetadata);
            }

            me._populateBackToMetaData(fieldParts, targetVendorType, actualTargetVendorPath, innerMetadata.fields);
        }
        else {

            var oldObj = {
                path: targetVendorPath,
                type: targetVendorType,
                actualVendorPath: actualTargetVendorPath
            };

            metadatafields.push(oldObj);
            me.$scope.objectMetaData = me._cloudElementsUtils.orderObjects(me.$scope.objectMetaData, 'path');
        }
    }
});

MapperController.$inject = ['$scope', 'CloudElementsUtils', 'Picker', 'Datalist', 'Mapper', 'Notifications', 'Schedule', 'MaskLoader', '$window', '$location', '$filter', '$route', '$mdDialog', '$mdUtil', '$mdSidenav'];

angular.module('bulkloaderApp')
    .controller('MapperController', MapperController)
    .filter('trust', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    })
    .config(function(uiTreeFilterSettingsProvider) {
        uiTreeFilterSettingsProvider.addresses = ['path', 'vendorPath'];
        uiTreeFilterSettingsProvider.descendantCollection = 'fields'
    });

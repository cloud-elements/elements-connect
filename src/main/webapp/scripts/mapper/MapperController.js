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
    _application: null,
    _instances: null,
    _schedule: null,
    _maskLoader: null,
    _aceEditor: null,

    init: function ($scope, CloudElementsUtils, Picker, Datalist, Mapper, Notifications, Schedule, MaskLoader, Application, $window, $location, $filter, $route, $mdDialog) {
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
        me._application = Application;
        me.$mdDialog = $mdDialog;
        me.$filter = $filter;
        me._super($scope);
        me._mapper.all[me._picker.selectedElementInstance.element.key].files =
            me._mapper.all[me._picker.selectedElementInstance.element.key].files || {};

        if(me._application.isCustomConfig()) {
            if (me._application.isCustomConfig() === 'both') {

                me.$scope.addCustomfieldsTarget = true;
                me.$scope.addCustomFieldsSource = true;

            }
            else if (me._application.isCustomConfig() === me.$scope.sourceName) {
                me.$scope.addCustomfieldsSource = true;
                me.$scope.addCustomfieldsTarget = false;

            }
            else if (me._application.isCustomConfig() === me.$scope.targetName) {
                me.$scope.addCustomfieldsTarget = true;
                me.$scope.addCustomfieldsSource = false;

            }
        }
        else{

            me.$scope.addCustomfieldsTarget =false;
            me.$scope.addCustomfieldsSource =false;
        }
        if (me._application.getTargetenumFields()) {
            for (var i = 0; i < me._application.getTargetenumFields().length; i++) {
                for (keys in me._application.getTargetenumFields()[i]) {
                    if (keys === me.$scope.targetName) {
                        me.$scope.enum = [];
                        me.$scope.enum.push(me._application.getTargetenumFields()[i][keys]);
                    }
                    else {
                        me.$scope.enum = [];
                    }
                }
            }
        }
        else {
            me.$scope.enum = [];
        }
        if (me._application.getSourceenumFields()) {
            for (var i = 0; i < me._application.getSourceenumFields().length; i++) {
                for (keys in me._application.getSourceenumFields()[i]) {
                    if (keys === me.$scope.sourceName) {
                        me.$scope.Sourceenum = [];
                        me.$scope.Sourceenum.push(me._application.getSourceenumFields()[i][keys]);
                        me.$scope.objectMetaData.push(me._application.getSourceenumFields()[i][keys]);


                    }
                    else {
                        me.$scope.Sourceenum = [];
                    }
                }
            }
        }
        else {
            me.$scope.Sourceenum = [];
        }
        if (me._application.getdisplaySourceObject()) {
            for (var i = 0; i < me._application.getdisplaySourceObject().length; i++) {
                for (keys in me._application.getdisplaySourceObject()[i]) {
                    if (keys === me.$scope.sourceElement.elementKey) {
                        me.$scope.instanceObjects = me._application.getdisplaySourceObject()[i][keys];
                    }
                }
            }
        }
        else {
            me.$scope.instanceObjects = [];

        }
    },
    handleFileUploadSelect: function (file, errors) {
        var me = this;
        if (file === null) {
            return;
        }
        var objectName = me.$scope.selectedObject.select.name;
        me._mapper.all[me._picker.selectedElementInstance.element.key].files[objectName] = file;
        me.$scope.files[objectName] = file;
        me._mapper._setFileUpload(true);
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
            var fileContent = event.target.result;
            var headers = fileContent.split(/\r\n|\n/)[0].split(',');
            var fieldDataFromHeaders = me.convertHeadersToFieldData(headers);
            var selectedElementInstance = me._picker.selectedElementInstance;
            var targetElementInstance = me._picker.targetElementInstance;
            var fieldDataFiltered = me._mapper._stripSelectedInstanceMetadata(selectedElementInstance, targetElementInstance, me.$scope.selectedObject.select.name, fieldDataFromHeaders);
            me._handleOnMetadataLoad(me.$scope.selectedObject, fieldDataFiltered);
        };
        fileReader.readAsText(file);
    },

    convertHeadersToFieldData: function (headers) {
        var fields = [];
        headers.forEach(function (header) {
            var headerFieldObject = {};
            header = header.replace(/"/g, '');
            headerFieldObject.actualVendorPath = header;
            headerFieldObject.path = header;
            headerFieldObject.type = "string";
            headerFieldObject.vendorPath = header;
            fields.push(headerFieldObject);
        });
        return {fields: fields};
    },

    defineScope: function () {
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
        me.$scope.mapperMetaDataById = null;
        me.$scope.fileUpload = false;
        me.$scope.files = {};

        //Mapping of UI actions to methods to be invoked
        me.$scope.refreshObjectMetaData = me.refreshObjectMetaData.bind(this);
        me.$scope.refreshTargetObject = me.refreshTargetObject.bind(this);
        me.$scope.removeMapPath = me.removeMapPath.bind(this);
        me.$scope.loadMetaData = me.loadMetaData.bind(this);
        me.$scope.aceLoaded = me._aceLoaded.bind(this);
        me.$scope.jsCustomization = me._jsCustomization.bind(this);
        me.$scope.addCustomfields = me._addCustomFields.bind(this);
        me.$scope.addCustomfieldSource = me._addCustomfieldSource.bind(this);
        me.$scope.error= me._error.bind(this);
        me.$scope.closeJS = me._closeJS.bind(this);
        me.$scope.handleFileUploadSelect = me.handleFileUploadSelect.bind(this);

        // Handling Booleans to display and hide UI
        me.$scope.showTree = false;
        me.$scope.showJSEditor = false;
        me.$scope.showTargetTree = false;
        me.$scope.bidirectionalMapping = false;
        me.$scope.showObjectSelection = false;

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

        me.$scope.collapsedAce = true;
        me.$scope.branding = me._application.getBranding();

        me._seedMapper();
    },

    defineListeners: function () {
        var me = this;
        me._super();

        //Needed this for back and forth between datalist and Picker, if the datalist is reinitializes every time, this is not required
        // me._notifications.addEventListener(bulkloader.events.VIEW_CHANGE_DATALIST, me._seedMapper.bind(me));
        me._notifications.addEventListener(bulkloader.events.TRANSFORMATION_SAVED, me._onTransformationSave.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.ERROR, me._onMapperError.bind(me), me.$scope.$id);

    },
    destroy: function () {
        var me = this;
        me._notifications.removeEventListener(bulkloader.events.TRANSFORMATION_SAVED, me._onTransformationSave.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.ERROR, me._onMapperError.bind(me), me.$scope.$id);
    },

    //This function checks if we need to continue in scheduling
    checkContinue: function () {
        var me = this;
        //Redirect to home page if null
        if (me._cloudElementsUtils.isEmpty(me._picker.selectedElementInstance)) {
            me.$location.path('/');
        }
    },

    onMetadataAccept: function (sourceNodeScope, destNodesScope, destIndex) {
        var me = this;
        if (destNodesScope.$parent.$element[0].id == "tree1-root"
            || destNodesScope.$parent.$element[0].id == "tree1-root-node") {

            return false;
        }
        var targetModelValue = destNodesScope.$parent.$modelValue;

        var srcModelValue = sourceNodeScope.$parent.$modelValue;
        if (me._cloudElementsUtils.isEmpty(targetModelValue)
            || targetModelValue == undefined
            || targetModelValue.type == 'object'
            || targetModelValue.type == 'array'
            || srcModelValue.type == 'object'
            || srcModelValue.type == 'array') {
            return false;
        }

        return true;
    },
    onMetadataTreeDropped: function (event) {

        var me = this;

        if (event.dest.nodesScope.$parent.$element[0].id == "tree1-root"
            || event.dest.nodesScope.$parent.$element[0].id == "tree1-root-node") {

            if (me._application.isAllowdrop() == true) {
                if (event.source.nodeScope.$modelValue.vendorDisplayName) {
                    var fields = {
                        "vendorPath": event.source.nodeScope.$modelValue.vendorDisplayName,
                        "type": "string",
                        "path": event.source.nodeScope.$modelValue.vendorDisplayName,
                        "fields": [],
                        "actualVendorPath":event.source.nodeScope.$modelValue.vendorDisplayName
                    }
                }
                else {
                    var fields = {
                        "vendorPath": event.source.nodeScope.$modelValue.path,
                        "type": "string",
                        "path": event.source.nodeScope.$modelValue.path,
                        "fields": [],
                        "actualVendorPath":event.source.nodeScope.$modelValue.path
                    }

                }
                me.$scope.mapperdata.push(fields);
                me.$scope.mapper.fields.push(fields);
                var target= {};
                target[me.$scope.targetName]=fields;
                me._application.getTargetenumFields().push(target)

                me.$scope.enum.push(fields);


                // need to get rid of some things
                for (var i = 0; i < me.$scope.objectMetaData.length; i++) {
                    for (keys in me.$scope.objectMetaData[i]) {
                        if ((me.$scope.objectMetaData[i][keys] === event.source.nodeScope.$modelValue.vendorDisplayName) || (me.$scope.objectMetaData[i][keys] === event.source.nodeScope.$modelValue.path)) {
                            me.$scope.objectMetaData.splice(i, 1);

                        }
                    }
                }


            }
            else {
                return false;
            }
        }


        // Cleaning up any object literal mapping classes on drop
        $('.angular-ui-tree-placeholder-mapping-hover').removeClass('angular-ui-tree-placeholder-mapping-hover');
        $('.showMapper').removeClass('literal-mapping');
        //Checking to see if the parent type is a literal if so just merge the vendor path to the parent and remove the
        //newly added node from source
        //If the Parent is an object or null, then its a new mapping field so enable it for editable
        var modelVal = event.source.nodeScope.$modelValue;
        var parentModelVal = event.dest.nodesScope.$parent.$modelValue;
        if (me._cloudElementsUtils.isEmpty(parentModelVal)
            || parentModelVal.type == 'object'
            || parentModelVal.type == 'array') {
            return false;
        }
        else {
            if (parentModelVal.path != null) {
                this._populateBackToMetaData(parentModelVal.path, parentModelVal.targetVendorType, parentModelVal.path, me.$scope.objectMetaData, parentModelVal.targetMask);
            }
            parentModelVal.sourceVendorDisplayName= modelVal.vendorDisplayName;
            parentModelVal.path = modelVal.actualVendorPath;
            parentModelVal.targetVendorType = modelVal.type;
            parentModelVal.targetMask = modelVal.mask;

            if (me._mapper._isLiteral(parentModelVal.type)) {
                parentModelVal.fields = [];
            }

            if (me._mapper._isDateFormat(parentModelVal.type)) {
                parentModelVal["configuration"] = [
                    {
                        "type": "transformDate",
                        "properties": {
                            "vendorPattern": parentModelVal.mask,
                            "pattern": modelVal.mask
                        }
                    }
                ];
            }

            if (me.$scope.selectedObject.select.transformed == false) {
                me.$scope.selectedObject.select.transformed = true;
            }
            event.dest.nodesScope.$parent.$element.addClass('mapped');
        }
    },

    showTreeToggle: function (mapperdata) {
        var me = this;

        if (!me._cloudElementsUtils.isEmpty(mapperdata)
            && !me._mapper._isLiteral(mapperdata.type)) {
            return true;
        }
        else {
            return false;
        }

    },

    toggle: function (uitree) {
        uitree.toggle();
    },

    loadMetaData: function () {
        var me = this;
        var objectDetails = me._picker.getElementObjectDetails(me._picker.selectedElementInstance.element.key, 'source', me.$scope.selectedObject.select.name);
        if (me._cloudElementsUtils.isEmpty(objectDetails.metaDataById)) {
            return;
        }

        if (me._cloudElementsUtils.isEmpty(objectDetails.metaDataById.value)) {
            var confirm = me.$mdDialog.alert()
                .title('Warning')
                .content('Missing required ' + objectDetails.metaDataById.name + ' to get metadata')
                .ok('OK');
            me.$mdDialog.show(confirm);
            return;
        }
        me._maskLoader.show(me.$scope, "Loading Object fields...");
        me.$scope.showTargetObjectSelection = false;
        me.$scope.selectedSourceObject = me.$scope.selectedObject.select;
        if (!me._cloudElementsUtils.isEmpty(me._mapper.all[me._picker.selectedElementInstance.element.key])
            && !me._cloudElementsUtils.isEmpty(me._mapper.all[me._picker.selectedElementInstance.element.key].objectsWhere)) {
            me.$scope.mapperwhere = me._mapper.all[me._picker.selectedElementInstance.element.key].objectsWhere[me.$scope.selectedObject.select.name];
        } else {
            me.$scope.mapperwhere = null;
        }

        //Substitue the Object by id for the where condition if the key matches
        if (!me._cloudElementsUtils.isEmpty(me.$scope.mapperwhere) && !me._cloudElementsUtils.isEmpty(objectDetails.metaDataById)
            && !me._cloudElementsUtils.isEmpty(objectDetails.metaDataById.value)) {
            for (var i = 0; i < me.$scope.mapperwhere.length; i++) {
                var mw = me.$scope.mapperwhere[i];
                if (me._cloudElementsUtils.isEmpty(mw.value) && mw.key == objectDetails.metaDataById.key) {
                    mw.value = objectDetails.metaDataById.value;
                    break;
                }
            }
        }

        me._mapper.loadObjectMetaData(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name, me._picker.targetElementInstance, objectDetails.metaDataById.value)
            .then(me._handleOnMetadataLoad.bind(me, me.$scope.selectedObject));
    },

    refreshObjectMetaData: function (checkWhereFields, checkRequired) {
        var me = this;

        var objectName = me.$scope.selectedObject.select.name;
        if (me._mapper.all[me._picker.selectedElementInstance.element.key].files[objectName]) {
            var objectDetails = me._picker.getElementObjectDetails(me._picker.selectedElementInstance.element.key, me.$scope.selectedObject.select.name, me.$scope.selectedObject.select.name);
            me.$scope.fileUpload = objectDetails.fileUpload;
            me._maskLoader.show(me.$scope, "Loading Object fields...");
            me.handleFileUploadSelect(me._mapper.all[me._picker.selectedElementInstance.element.key].files[objectName]);
            me._maskLoader.hide();
            return;
        }

        //First check if existing Where condition mandatory ones are filled, if not warn user
        if ((me._cloudElementsUtils.isEmpty(checkWhereFields) || checkWhereFields == true)
            && !me._cloudElementsUtils.isEmpty(me.$scope.mapperwhere)) {
            for (var i = 0; i < me.$scope.mapperwhere.length; i++) {
                var mw = me.$scope.mapperwhere[i];
                if (me._cloudElementsUtils.isEmpty(mw.value) && mw.required == true) {

                    var confirm = me.$mdDialog.confirm()
                        .title('Missing required fields')
                        .content("Missing required value " + mw.name + " for object " + me.$scope.selectedSourceObject.name + ". Do you still want to continue ?")
                        .ok('Yes')
                        .cancel('No');

                    me.$mdDialog.show(confirm).then(function () {
                        //continue
                        me.refreshObjectMetaData(false, true);
                    }, function () {
                        //Don't do anything
                        me.$scope.selectedObject.select = me.$scope.selectedSourceObject;
                    });
                    return false;
                }
            }
        }

        //Check to see if there are any missed required mappings and warn the user before switching
        if (me._cloudElementsUtils.isEmpty(checkRequired) || checkRequired == true) {
            //Check for missing required mappings and warning
            var missingRequired = me._validateForRequiredMappings(this.$scope.mapperdata);
            if (!me._cloudElementsUtils.isEmpty(missingRequired)) {
                var confirm = me.$mdDialog.confirm()
                    .title('Missing required mapping')
                    .content("Missing required mapping " + missingRequired + " for object " + me.$scope.selectedTargetObject.name + ". Do you still want to continue ?")
                    .ok('Yes')
                    .cancel('No');

                me.$mdDialog.show(confirm).then(function () {
                    //continue
                    me.refreshObjectMetaData(false, false);
                }, function () {
                    //Don't do anything
                    me.$scope.selectedObject.select = me.$scope.selectedSourceObject;
                });

                return;
            }
        }

        me._setJSTransformationValue();

        //Get Object details
        var objectDetails = me._picker.getElementObjectDetails(me._picker.selectedElementInstance.element.key, 'source', me.$scope.selectedObject.select.name);
        if (!me._cloudElementsUtils.isEmpty(objectDetails) && !me._cloudElementsUtils.isEmpty(objectDetails.metaDataById)) {
            me.$scope.mapperMetaDataById = objectDetails.metaDataById;
            me.$scope.mapperwhere = null;
            me.$scope.objectMetaData = null;
            me.$scope.showTargetTree = false;
            me._maskLoader.hide();
            return;
        } else {
            me.$scope.mapperMetaDataById = null;
        }

        if (!me._cloudElementsUtils.isEmpty(objectDetails)) {
            me.$scope.parentOpbjetName = objectDetails.parentObjectName;
            me.$scope.fileUpload = objectDetails.fileUpload;
        } else {
            me.$scope.parentOpbjetName = null;
            me.$scope.fileUpload = null;
        }
        me._maskLoader.show(me.$scope, "Loading Object fields...");
        me.$scope.showTargetObjectSelection = false;
        me.$scope.selectedSourceObject = me.$scope.selectedObject.select;
//        Get the Where condition objects for the source element
        if (!me._cloudElementsUtils.isEmpty(me._mapper.all[me._picker.selectedElementInstance.element.key])
            && !me._cloudElementsUtils.isEmpty(me._mapper.all[me._picker.selectedElementInstance.element.key].objectsWhere)) {
            me.$scope.mapperwhere = me._mapper.all[me._picker.selectedElementInstance.element.key].objectsWhere[me.$scope.selectedObject.select.name];
        } else {
            me.$scope.mapperwhere = null;
        }

        var metadata = null;
        if (!me._cloudElementsUtils.isEmpty(me._mapper.all[me._picker.selectedElementInstance.element.key].metadataflat)) {
            metadata = me._mapper.all[me._picker.selectedElementInstance.element.key].metadataflat[me.$scope.selectedObject.select.name];
        }

        if (me._cloudElementsUtils.isEmpty(metadata)) {
            me._mapper.loadObjectMetaData(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name, me._picker.targetElementInstance)
                .then(me._handleOnMetadataLoad.bind(me, me.$scope.selectedObject));
        } else {
            var data = me._mapper.loadObjectMetaDataFromCache(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name, me._picker.targetElementInstance);
            me._handleOnMetadataLoad(me.$scope.selectedObject, data);
        }
    },

    _handleOnMetadataLoad: function (obj, data) {
        var me = this
        me.$scope.objectMetaData = me._cloudElementsUtils.orderObjects(data.fields, 'path');
        me.$scope.showTree = true;
        me.$scope.mapperMetaDataById = null;
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
        } catch (e) {
            me.$scope.showTargetObjectSelection = true;
            me._maskLoader.hide();
        }
    },
    refreshTargetObject: function () {
        var me = this;
        me._maskLoader.show(me.$scope, "Loading mapping...");

        //Get the targetmapping
        var targetMetaMapping = me._mapper.getTargetMetaMapping(me._picker.targetElementInstance, me.$scope.selectedObject.select.name, me.$scope.selectedTargetObject.name);
        if (me._cloudElementsUtils.isEmpty(targetMetaMapping)) {
            //Calling the API to load the target objectmetadata and mapping
            var trn = new Object();
            trn.vendorName = me.$scope.selectedTargetObject.name;
            me._mapper.loadTargetObjectMetaMapping(me._picker.selectedElementInstance, me.$scope.selectedObject.select.name, me._picker.targetElementInstance, trn)
                .then(me._handleOnTargetMetamappingLoad.bind(me, me.$scope.selectedTargetObject.name));
        } else {
            me._handleOnTargetMetamappingLoad(me.$scope.selectedTargetObject.name, targetMetaMapping);
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
            me.$scope.collapsedAce = true;
            if (me.$scope.enum.length !== 0) {
                me.$scope.mapperdata = [];
            }
            for (var i = 0; i < me.$scope.enum.length; i++) {
                for (var i = 0; i < me._application.getTargetenumFields().length; i++) {
                    for (keys in me._application.getTargetenumFields()[i]) {
                        if (keys === me.$scope.targetName) {
                            me
                                .$scope
                                .mapperdata
                                .push(me._application.getTargetenumFields()[i][keys]);
                            me
                                .$scope
                                .mapper
                                .fields
                                .push(me._application.getTargetenumFields()[i][keys]);
                        }
                    }
                }
            }
                if(me._application.getSourceenumFields()){
                    for (var i = 0; i < me._application.getSourceenumFields().length; i++) {
                        for (keys in me._application.getSourceenumFields()[i]) {
                            if (keys === me.$scope.sourceName) {
                                me.$scope.objectMetaData = [me._application.getSourceenumFields()[i][keys]];
                                me.$scope.sourceFieldName = '';
                            }
                        }
                    }

                }



            if(!me._cloudElementsUtils.isEmpty(me._aceEditor)) {
                if(me._cloudElementsUtils.isEmpty(data.script)
                    || me._cloudElementsUtils.isEmpty(data.script.body)) {
                    me._aceEditor.setValue("");
                } else {
                    me._aceEditor.setValue(data.script.body, 1);
                }
            }

            if(me._cloudElementsUtils.isEmpty(me.$scope.selectedTargetObject) || me._cloudElementsUtils.isEmpty(me.$scope.selectedTargetObject.name)) {
                me.$scope.selectedTargetObject = new Object();
                me.$scope.selectedTargetObject.name = data.vendorName;
                if(!me._cloudElementsUtils.isEmpty(me._mapper.all[me._picker.targetElementInstance.element.key].objectDisplayName)) {
                    me.$scope.selectedTargetObject.displayName = me._mapper.all[me._picker.targetElementInstance.element.key].objectDisplayName[data.vendorName];
                }

            }
            if (me.$scope.showObjectSelection == true){
                me.$scope.showTargetObjectSelection = true;
            } else {
                me.$scope.showTargetObjectSelection = false;
            }

        } else {
            me.$scope.showTargetObjectSelection = true;
        }

        me._maskLoader.hide();
    },

    _seedMapper: function () {
        var me = this;

        if (me._cloudElementsUtils.isEmpty(me._picker.selectedElementInstance)
            || me._cloudElementsUtils.isEmpty(me._picker.targetElementInstance)) {

            me.$location.path('/');
            return;
        }

        if (me._application.isJSEditorHidden() == true) {
            me.$scope.showJSEditor = false;
        } else {
            me.$scope.showJSEditor = true;
        }

        me.$scope.sourceElement = me._picker.getElementConfig(me._picker.selectedElementInstance.element.key, 'source');
        me.$scope.sourceLogo = me.$scope.sourceElement.image;
        me.$scope.targetLogo = me._picker._target.image;
        me.$scope.sourceName = me.$scope.sourceElement.name;
        me.$scope.targetName = me._picker._target.name;

        me._maskLoader.show(me.$scope, 'Loading Objects...');

        //Load the objects for the element
        me._mapper.loadInstanceObjects(me._picker.selectedElementInstance, me._picker.targetElementInstance)
            .then(me._handleOnInstanceObjectsLoad.bind(me));

        if (me._application.isMapperBiDirectional() == true) {
            me.$scope.bidirectionalMapping = true;
        } else {
            me.$scope.bidirectionalMapping = false;
        }

    },

    _handleOnInstanceObjectsLoad: function (data) {
        var me = this;
        if (me._cloudElementsUtils.isEmpty(data)) {
            return;
        }
        if (me.$scope.instanceObjects.length === 0) {
            me.$scope.instanceObjects = data;
        }
        me.$scope.targetObjects = me.buildTargetObjects();
        me.$scope.selectedObject.select = me.$scope.instanceObjects[0];
        me.refreshObjectMetaData(me.$scope.selectedObject.select.name);
    },

    buildTargetObjects: function () {
        var me = this;
        var objects = [];
        // me._application.configuration
        if (me._application.getdisplayTargetObject()) {
            for (var i = 0; i < me._application.getdisplayTargetObject().length; i++) {
                for (keys in me._application.getdisplayTargetObject()[i]) {
                    if (keys === me.$scope.targetName) {
                        objects = me._application.getdisplayTargetObject()[i][keys];
                    }
                }
            }
        }
        else {
            var objectDetails = me._mapper.all[me._picker.targetElementInstance.element.key].objectDetails;
            for (var key in objectDetails) {
                objects.push(objectDetails[key]);
            }
        }
        var objectDetails = me._mapper.all[me._picker.targetElementInstance.element.key].objectDetails;

        return objects;
    },



    cancel: function () {
        var me = this;
        me.$location.path('/');
    },

    save: function (checkWhereFields) {
        var me = this;
        // might eventually want to add me._application.custom field and be able to push required:true to any
        // mapperdata object but have not handled that yet
        for (var i=0; i<me.$scope.mapperdata.length; i++) {
            if (me.$scope.mapperdata[i].required===true) {
                if(!(me.$scope.mapperdata[i].path)) {
                    return (me.$scope.error(me.$scope.mapperdata[i].actualVendorPath+" is required"));
                }
            }
        }
        //First check if existing Where condition mandatory ones are filled, if not warn user
        if ((me._cloudElementsUtils.isEmpty(checkWhereFields) || checkWhereFields == true)
            && !me._cloudElementsUtils.isEmpty(me.$scope.mapperwhere)) {
            for (var i = 0; i < me.$scope.mapperwhere.length; i++) {
                var mw = me.$scope.mapperwhere[i];
                if (me._cloudElementsUtils.isEmpty(mw.value) && mw.required == true) {

                    var confirm = me.$mdDialog.confirm()
                        .title('Missing required fields')
                        .content("Missing required value " + mw.name + " for object " + me.$scope.selectedSourceObject.name + ". Do you still want to continue ?")
                        .ok('Yes')
                        .cancel('No');

                    me.$mdDialog.show(confirm).then(function () {
                        //continue
                        me.save(false);
                    }, function () {
                        //Don't do anything
                    });
                    return false;
                }
            }
        }


        //Check for missing required mappings and warning
        var missingRequired = me._validateForRequiredMappings(this.$scope.mapperdata);
        if (!me._cloudElementsUtils.isEmpty(missingRequired)) {
            var confirm = me.$mdDialog.confirm()
                .title('Missing required mapping')
                .content("Missing required mapping " + missingRequired + " for object " + me.$scope.selectedTargetObject.name + ". Do you still want to continue ?")
                .ok('Yes')
                .cancel('No');

            me.$mdDialog.show(confirm).then(function () {
                //continue
                me._continueToSave();
            }, function () {
                //Don't do anything
            });
        } else {
            me._continueToSave();
        }
    },
    _error: function(message){
        alert(message);

    },

    _validateForRequiredMappings: function (mapperdata) {
        var me = this;

        if (me._cloudElementsUtils.isEmpty(mapperdata)
            || me._cloudElementsUtils.isEmpty(mapperdata.fields)
            || mapperdata.fields.length == 0) {
            return null;
        }

        var missingRequired = null;
        for (var i = 0; i < mapperdata.fields.length; i++) {
            var md = mapperdata.fields[i];

            if (me._cloudElementsUtils.isEmpty(md.fields)
                || md.fields.length == 0) {

                if (md.vendorRequired == true &&
                    me._cloudElementsUtils.isEmpty(md.path)) {
                    missingRequired = (md.vendorDisplayName) == null ? md.vendorPath : md.vendorDisplayName;
                }

            } else {
                missingRequired = me._validateForRequiredMappings(md);
            }

            if (!this._cloudElementsUtils.isEmpty(missingRequired)) {
                break;
            }
        }

        return missingRequired;
    },

    _continueToSave: function () {
        var me = this;

        me._setJSTransformationValue();

        me._maskLoader.show(me.$scope, 'Saving...');
        var saveStatus = me._mapper.saveDefinitionAndTransformation(me._picker.selectedElementInstance,
            me._picker.targetElementInstance,
            me.$scope.instanceObjects);
    },

    _onTransformationSave: function () {
        var me = this;

        me._maskLoader.hide();
        if (me._application.isCAaaS()) {
            me.$location.path('/formulas');
        } else {
            me.$location.path('/schedule');
        }
    },

    _onMapperError: function (event, error) {
        var me = this;
        me._maskLoader.hide();
        var confirm = me.$mdDialog.alert()
            .title('Error')
            .content(error)
            .ok('OK');

        me.$mdDialog.show(confirm);
    },

    checkAllInstance: function (cbState, cbObject) {
        var me = this;
        for (var i = 0; i < me.$scope.objectMetaData.length; i++) {
            me.$scope.objectMetaData[i].transform = cbState;
            if (me.$scope.objectMetaData[i].type == "object" || me.$scope.objectMetaData[i].type == "array") {
                var obj = me.$scope.objectMetaData[i].fields;
                for (var metadata in obj) {
                    var metoo = obj[metadata];
                    metoo.transform = cbState;
                }
            }
        }
    },

    unCheckObject: function (cbState, metadata, obj) {
        var me = this;
        var o = obj.length;
        var ownerData;
        while (o--) {
            var n = metadata.actualVendorPath.indexOf(".");
            if (metadata.actualVendorPath.slice(0, n) == obj[o].vendorPath || metadata.actualVendorPath == obj[o].vendorPath) {
                ownerData = obj[o];
                break;
            }
        }

        if (metadata.type == "object" || metadata.type == "array") {
            for (var i = 0; i < metadata.fields.length; i++) {
                metadata.fields[i].transform = cbState;
                if (ownerData.type == "object" && cbState == false) {
                    ownerData.transform = cbState;
                }
            }
        } else {
            metadata.transform = cbState;
            if (cbState == false) {
                ownerData.transform = cbState;
                me.$scope.cbObject.checked = cbState;
            }
        }
    },

    checkAllObjects: function (cbState, cbObject) {
        var me = this;
        for (var i = 0; i < me.$scope.instanceObjects.length; i++) {
            me.$scope.instanceObjects[i].transformed = cbState;
        }
    },

    removeMapPath: function (treenode) {
        var me = this;

        var obj = treenode.$nodeScope.$modelValue;
        if (me._cloudElementsUtils.isEmpty(obj.path)) {
            return;
        }
        treenode.$nodeScope.$element.removeClass('mapped');

        this._populateBackToMetaData(obj.path, obj.targetVendorType, obj.path, me.$scope.objectMetaData, obj.targetMask, obj.sourceVendorDisplayName);
        obj.path = null;
        obj.sourceVendorDisplayName = null;
        obj.targetVendorType = null;
    },

    _findAndGetInnerMetadata: function (objField, metadatafields) {
        for (var i = 0; i < metadatafields.length; i++) {
            var field = metadatafields[i];
            if (field.path == objField) {
                return field;
            }
        }
    },

    _populateBackToMetaData: function (targetVendorPath, targetVendorType, actualTargetVendorPath, metadatafields, targetMask, vendorDisplayName) {
        var me = this;
        if (me._cloudElementsUtils.isEmpty(targetVendorType)) {
            targetVendorType = 'string';
        }

        if (me._cloudElementsUtils.isEmpty(targetVendorPath)) {
            return;
        }

        if (targetVendorPath.indexOf('.') != -1) {
            //Find the inner object inside metadata and add it to it
            var fieldParts = targetVendorPath.split('.').slice(1).join('.');
            var objField = targetVendorPath.split('.')[0];

            var innerMetadata = me._findAndGetInnerMetadata(objField, metadatafields);
            if (this._cloudElementsUtils.isEmpty(innerMetadata)) {
                var t = 'object';

                if (objField.indexOf('[*]') != -1) {
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

            me._populateBackToMetaData(fieldParts, targetVendorType, actualTargetVendorPath, innerMetadata.fields, targetMask);
        }
        else {

            var oldObj = {
                path: targetVendorPath,
                type: targetVendorType,
                mask: targetMask,
                actualVendorPath: actualTargetVendorPath,
                vendorDisplayName: vendorDisplayName
            };

            metadatafields.push(oldObj);
            me.$scope.objectMetaData = me._cloudElementsUtils.orderObjects(me.$scope.objectMetaData, 'path');
        }
    },

    _aceLoaded: function (_editor) {
        var me = this;
        me._aceEditor = _editor;
    },

    _addCustomFields: function (fieldName) {
        if(fieldName) {
            var me = this;
            var fields = {"vendorPath": fieldName, "type": "string", "fields": []}
            me.$scope.mapperdata.push(fields);
            me.$scope.mapper.fields.push(fields);
            me.$scope.fieldName='';
        }
    },

    _addCustomfieldSource: function (sourceFieldName) {
        if(sourceFieldName) {
            var me = this;
            var fields = {
                "actualVendorPath": sourceFieldName,
                "path": sourceFieldName,
                "vendorPath": null,
                "type": "string",
                "fields": []
            }
            me.$scope.objectMetaData.push(fields);
            me.$scope.sourceFieldName='';

        }

    },


    _jsCustomization: function ($event) {
        var me = this;

//        $event.preventDefault();
        $event.stopPropagation();
        me.$scope.collapsedAce = false;

        if (me._aceEditor.getValue() != null) {
            me._aceEditor.setValue(me._aceEditor.getValue());
        }

        me._aceEditor.resize()
    },

    _closeJS: function () {
        var me = this;
        me.$scope.collapsedAce = true;
    },

    _setJSTransformationValue: function () {
        var me = this;
        if (me._cloudElementsUtils.isEmpty(me.$scope.selectedSourceObject)) {
            return;
        }

        if (me._cloudElementsUtils.isEmpty(me._aceEditor)) {
            return;
        }
        //Get Script if available to save with the transformation
        //Populate it with the me.$scope.mapperdata
        if (!me._cloudElementsUtils.isEmpty(me.$scope.selectedTargetObject)) {
            var targetMetaMapping = me._mapper.getTargetMetaMapping(me._picker.targetElementInstance, me.$scope.selectedSourceObject.name, me.$scope.selectedTargetObject.name);
            if (!me._cloudElementsUtils.isEmpty(targetMetaMapping)) {
                var script = me._aceEditor.getValue();
                if (me._cloudElementsUtils.isEmpty(script)) {
                    me.$scope.mapperdata.script = null;
                } else {
                    targetMetaMapping["script"] = new Object();
                    targetMetaMapping["script"].body = script;
                    targetMetaMapping["script"].mimeType = "application/javascript";
                }
            }
        }
    }
});

MapperController.$inject = ['$scope', 'CloudElementsUtils', 'Picker', 'Datalist', 'Mapper', 'Notifications', 'Schedule', 'MaskLoader', 'Application', '$window', '$location', '$filter', '$route', '$mdDialog', '$mdUtil', '$mdSidenav'];

angular.module('bulkloaderApp')
    .controller('MapperController', MapperController)
    .filter('trust', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    })
    .config(function (uiTreeFilterSettingsProvider) {
        uiTreeFilterSettingsProvider.addresses = ['path', 'vendorPath'];
        uiTreeFilterSettingsProvider.descendantCollection = 'fields'
    });
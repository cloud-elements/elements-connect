/**
 * Datalist factor class as an helper to picker controller.
 *
 *
 * @author Ramana
 */

bulkloader.events.TRANSFORMATION_SAVED = "Datalist.TRANSFORMATION_SAVED";

var Mapper = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _transformationUtil: null,
    _application: null,
    _objectMetadata: null,
    _objectMetadataFlat: null,
    _hasFileUpload: false,

    //An Object which holds all the data at instance Level
    all: new Object,

    _setFileUpload: function(bool) {
        var me = this;
        me._hasFileUpload = bool;
    },

    _handleLoadError: function(error) {
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    _isLiteral: function(type) {
        if(type == 'string' || type == 'number'
            || type == 'date' || type == 'boolean'
            || type == 'unknown' || type == null
            || this._isDateFormat(type)
            || this._isLiteralArray(type)) {
            return true;
        }

        return false;
    },

    _isLiteralArray: function(type) {
        if(type == 'array[string]' || type == 'array[number]'
            || type == 'array[boolean]') {
            return true;
        }

        return false;
    },

    _isDateFormat: function(type) {
        if(type == "yyyy-MM-dd'T'HH:mm:ssXXX"
            || type == "yyyy-MM-dd"
            || type == "MM/dd/yyy'T'HH:mm:ssXXX"
            || type == "MM/dd/yyy"
            || type == "dd/MM/yyy'T'HH:mm:ssXXX"
            || type == "dd/MM/yyy"
            || type == "milliseconds"
            || type == "Vendor date format"
            || type == "date") {
            return true;
        }
        return false;
    },

    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Load selected Instance Objects
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    loadInstanceObjects: function(sourceInstance, targetInstance) {
        var me = this;

        var sourceInstance = angular.fromJson(sourceInstance);
        var targetInstance = angular.fromJson(targetInstance);

        if(me._cloudElementsUtils.isEmpty(me.all[sourceInstance.element.key])) {
            me.all[sourceInstance.element.key] = new Object;
            me.all[sourceInstance.element.key].instance = sourceInstance;
        }

        if(me._cloudElementsUtils.isEmpty(me.all[targetInstance.element.key])) {
            me.all[targetInstance.element.key] = new Object;
            me.all[targetInstance.element.key].instance = targetInstance;
        }

        // Load target and source instance definitions,
        // the only reason for this call is for making appropriate POST/PUT calls while saving
        me.loadInstanceDefinitions(targetInstance);

        if(me._application.isMapperBiDirectional() == true) {
            me.loadInstanceDefinitions(sourceInstance);

            me._elementsService.loadInstanceTransformations(sourceInstance)
                .then(
                this._handleLoadSourceInstanceTransformations.bind(this, sourceInstance),
                this._handleLoadSourceInstanceTransformationsError.bind(this, sourceInstance));
        }

        //Load source objects
        return me._loadObjects(sourceInstance, targetInstance);
    },

    _handleLoadSourceInstanceTransformationsError: function(sourceInstance, result) {
        var me = this;
        me.all[sourceInstance.element.key].transformationsLoaded = true;
    },

    _handleLoadSourceInstanceTransformations: function(sourceInstance, result) {
        var me = this;
        me.all[sourceInstance.element.key].transformationsLoaded = true;
        me.all[sourceInstance.element.key].transformations = result.data;
    },

    //------------------------------------------------------------------
    // Target Instance Definitions
    //------------------------------------------------------------------
    //Based on the selected instance get all the instance definitions
    loadInstanceDefinitions: function(targetInstance) {
        var me = this;

        me._elementsService.loadInstanceObjectDefinitions(targetInstance)
            .then(
            this._handleLoadInstanceDefinitions.bind(this, targetInstance),
            this._handleLoadError.bind(this));

    },

    _handleLoadInstanceDefinitions: function(targetInstance, result) {
        var me = this;
        me.all[targetInstance.element.key].definitions = result.data;
    },

    //------------------------------------------------------------------
    // Source Instance Objects
    //------------------------------------------------------------------
    _loadObjects: function(selectedInstance, targetInstance) {
        var me = this;
        var sourceElement = me._picker.getSourceElement(selectedInstance.element.key);
        if(!me._cloudElementsUtils.isEmpty(sourceElement.objects)) {
            return me._handleLoadInstanceObjects(selectedInstance, targetInstance, new Object());
        } else {
            return this._elementsService.loadInstanceObjects(selectedInstance)
                .then(
                this._handleLoadInstanceObjects.bind(this, selectedInstance, targetInstance),
                this._handleLoadInstanceObjectError.bind(this));
        }
    },

    _handleLoadInstanceObjects: function(selectedInstance, targetInstance, result) {
        var me = this;

        me.all[selectedInstance.element.key].objects = result.data;

        me.all[selectedInstance.element.key].objects = me._cloudElementsUtils.orderBy(me.all[selectedInstance.element.key].objects, 'toString()');

        if(me.all[selectedInstance.element.key].objects == null ||
            me.all[selectedInstance.element.key].objects.length == 0) {

            var sourceElement = me._picker.getSourceElement(selectedInstance.element.key);

            if(!me._cloudElementsUtils.isEmpty(sourceElement.objects)) {
                var srcObjects = new Array();
                angular.copy(sourceElement.objects, srcObjects);

                var objects = new Array();
                var objectsVendorDisplayName = new Object();
                var objectsWhere = new Object();
                var objectDetails = new Object();
                for(var i in srcObjects) {
                    var obj = srcObjects[i];
                    objects.push(obj.vendorPath);
                    objectDetails[obj.vendorPath] = {
                        name: obj.vendorPath,
                        displayName: obj.vendorDisplayName,
                        fileUpload: obj.fileUpload ? true : false,
                        parentObjectName: obj.parentObjectName,
                        multipleUpload: obj.multipleUpload ? true : false
                    };

                    if(!me._cloudElementsUtils.isEmpty(obj.vendorDisplayName)) {
                        objectsVendorDisplayName[obj.vendorPath] = obj.vendorDisplayName;
                    }

                    if(!me._cloudElementsUtils.isEmpty(obj.where) && obj.where.length > 0) {
                        objectsWhere[obj.vendorPath] = obj.where;
                    }

                    if(!me._cloudElementsUtils.isEmpty(obj.fields) && obj.fields.length > 0) {
                        if(me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].metadata)) {
                            me.all[selectedInstance.element.key].metadata = new Object;
                            me.all[selectedInstance.element.key].metadataflat = new Object;
                        }

                        var objectMetadata = obj;
                        var objectMetadataFlat = new Object;

                        angular.copy(objectMetadata, objectMetadataFlat);
                        me.all[selectedInstance.element.key].metadataflat[obj.vendorPath] = objectMetadataFlat;

                        me._restructureObjectMetadata(objectMetadata, 'path');
                        me.all[selectedInstance.element.key].metadata[obj.vendorPath] = objectMetadata;
                    }
                }

                me.all[selectedInstance.element.key].objects = objects;
                me.all[selectedInstance.element.key].objectDetails = objectDetails;
                me.all[selectedInstance.element.key].objectsWhere = objectsWhere;
                me.all[selectedInstance.element.key].objectDisplayName = objectsVendorDisplayName;
                result.data = objects;
            }
        }

        return me.loadInstanceTransformations(targetInstance, selectedInstance);
    },

    _handleLoadInstanceObjectError: function(result) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, "Error getting the discovery objects or connection to provider is bad");
        //return "Error getting the discovery object";
    },

    //------------------------------------------------------------------
    // Target Instance Objects and transformations
    //------------------------------------------------------------------

    //Based on the selected instance get all the object transformation
    loadInstanceTransformations: function(targetInstance, selectedInstance) {
        return this._elementsService.loadInstanceTransformations(targetInstance, selectedInstance)
            .then(
            this._handleLoadInstanceTransformations.bind(this, targetInstance, selectedInstance),
            this._handleLoadInstanceTransformationsError.bind(this, targetInstance, selectedInstance));
    },

    _handleLoadInstanceTransformationsError: function(targetInstance, selectedInstance, result) {
        var me = this;
        me.all[targetInstance.element.key].transformationsLoaded = true;
        return me._loadTargetObjects(selectedInstance, targetInstance);
    },

    _handleLoadInstanceTransformations: function(targetInstance, selectedInstance, result) {
        var me = this;
        me.all[targetInstance.element.key].transformationsLoaded = true;
        me.all[targetInstance.element.key].transformations = result.data;
        return me._loadTargetObjects(selectedInstance, targetInstance);
    },

    _loadTargetObjects: function(selectedInstance, targetInstance) {
        var me = this;

        var targetElement = me._picker.getTargetElement(targetInstance.element.key);
        if(!me._cloudElementsUtils.isEmpty(targetElement.objects)) {
            return me._handleLoadTargetInstanceObjects(selectedInstance, targetInstance, new Object());
        } else {
            //loading the target Instance Objects
            return me._elementsService.loadInstanceObjects(targetInstance)
                .then(
                me._handleLoadTargetInstanceObjects.bind(this, selectedInstance, targetInstance),
                me._handleLoadInstanceObjectError.bind(this));
        }
    },

    _handleLoadTargetInstanceObjects: function(selectedInstance, targetInstance, result) {
        var me = this;

        me.all[targetInstance.element.key].objects = result.data;

        if(me._cloudElementsUtils.isEmpty(me.all[targetInstance.element.key].objects)) {
            me._loadTargetInstanceObjectsFromConfig(targetInstance);
        } else {
            var objectDetails = new Object();
            for(var i in result.data) {
                objectDetails[result.data[i]] = {
                    name: result.data[i]
                };
            }
            me.all[targetInstance.element.key].objectDetails = objectDetails;
        }

        me._findAndUpdateTransformation(targetInstance, selectedInstance);

        return me.all[selectedInstance.element.key].objectsAndTransformation;
    },

    _loadTargetInstanceObjectsFromConfig: function(targetInstance) {
        var me = this;
        var targetElement = me._picker.getTargetElement(targetInstance.element.key);
        if(me._cloudElementsUtils.isEmpty(targetElement.objects)) {
            return;
        }

        var objects = new Array();
        var objectDetails = new Object();
        var objectDisplayName = new Object();
        for(var i in targetElement.objects) {
            var obj = targetElement.objects[i];
            objects.push(obj.vendorPath);
            objectDetails[obj.vendorPath] = {
                name: obj.vendorPath,
                displayName: obj.vendorDisplayName
            };

            objectDisplayName[obj.vendorPath] = obj.vendorDisplayName;

            if(me._cloudElementsUtils.isEmpty(me.all[targetInstance.element.key].metadata)) {
                me.all[targetInstance.element.key].metadata = new Object;
                me.all[targetInstance.element.key].metadataflat = new Object;
            }

            var objectMetadata = obj;
            var objectMetadataFlat = new Object;

            angular.copy(objectMetadata, objectMetadataFlat);
            me.all[targetInstance.element.key].metadataflat[obj.vendorPath] = objectMetadataFlat;

            me._restructureObjectMetadata(objectMetadata);
            me.all[targetInstance.element.key].metadata[obj.vendorPath] = objectMetadata;
        }

        me.all[targetInstance.element.key].objects = objects;
        me.all[targetInstance.element.key].objectDetails = objectDetails;
        me.all[targetInstance.element.key].objectDisplayName = objectDisplayName;
    },

    _findAndUpdateTransformation: function(targetInstance, selectedInstance) {
        var me = this;

        var trans = me.all[targetInstance.element.key].transformations;
        var objectsAndTransformation = new Object();
        var tempObjectNames = new Object();

        if(!me._cloudElementsUtils.isEmpty(trans)) {
            var transformationKeys = Object.keys(trans);
            var targetObject = null;

            for(var i = 0; i < transformationKeys.length; i++) {
                targetObject = transformationKeys[i];

                //Transformations are saved in the format <source_element>_<sourceobject>_<targetobject>
                //selectedInstance.element.key+'_'+selectedInstanceObject+'_'+selectedObject;
                var selectObjectName = null;
                var srcElement = null;
                var targetObjectName = null;
                try {
                    var spl = targetObject.split('_');
                    selectObjectName = spl[1]; // Second field in the objectname is source objectname
                    targetObjectName = spl[2];
                    srcElement = spl[0];
                }
                    //Ignore the error
                catch(err) {
                }

                if(srcElement != selectedInstance.element.key
                    || me._cloudElementsUtils.isEmpty(selectObjectName)) {
                    continue;
                }

                var obj = new Object();
                obj.vendorName = targetObjectName;
                obj.name = selectObjectName;
                if(!me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].objectDisplayName)) {
                    obj.displayName = me.all[selectedInstance.element.key].objectDisplayName[selectObjectName];
                }
                obj.transformed = true;
                if(!me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].objectDetails)) {
                    var objDetails = me.all[selectedInstance.element.key].objectDetails;
                    var matchingObject = objDetails[selectObjectName];
                    if (matchingObject) {
                        obj.fileUpload = matchingObject.fileUpload;
                        obj.parentObjectName = matchingObject.parentObjectName;
                    }
                }
                objectsAndTransformation[selectObjectName] = obj;

                tempObjectNames[selectObjectName] = true;
            }
        }

        //Now navigate through all the objects from source and push the pending objects to
        var sortedObjectsAndTransformation = new Array();
        var objs = me.all[selectedInstance.element.key].objects;
        for(var i = 0; i < objs.length; i++) {
            var objName = objs[i];
            if(me._cloudElementsUtils.isEmpty(tempObjectNames[objName])) {
                var obj = {
                    name: objName,
                    transformed: false
                };

                if(!me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].objectDisplayName)) {
                    obj['displayName'] = me.all[selectedInstance.element.key].objectDisplayName[selectObjectName];
                }
                sortedObjectsAndTransformation.push(obj);
            } else {
                sortedObjectsAndTransformation.push(objectsAndTransformation[objName]);
            }
        }

        me.all[selectedInstance.element.key].objectsAndTransformation = sortedObjectsAndTransformation;
    },

    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Load selected Object metadata
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    loadObjectMetaData: function(selectedInstance, selectedObject, targetInstance, discoveryId) {

        return this._elementsService.loadObjectMetaData(selectedInstance, selectedObject, discoveryId)
            .then(
            this._handleLoadObjectMetadata.bind(this, selectedInstance, selectedObject, targetInstance),
            this._handleLoadErrorObjectMetadata.bind(this));
    },

    //This method is used for reloading the source object metadata on changing the target object
    loadObjectMetaDataFromCache: function(selectedInstance, selectedObject, targetInstance) {
        var me = this;

        var objectMetadata = new Object;
        angular.copy(me.all[selectedInstance.element.key].metadataflat[selectedObject], objectMetadata);
        return me._stripSelectedInstanceMetadata(selectedInstance, targetInstance, selectedObject, objectMetadata);
    },

    _handleLoadErrorObjectMetadata: function(result) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, "Error getting the object fields");
        //return "Error getting the discovery object";
    },

    _handleLoadObjectMetadata: function(selectedInstance, selectedObject, targetInstance, result) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].metadata)) {
            me.all[selectedInstance.element.key].metadata = new Object;
            me.all[selectedInstance.element.key].metadataflat = new Object;
        }

        var objectMetadata = result.data;
        //Check if the Element has any fields to be added addition to metadata and join those fields
        var sourceElement = me._picker.getSourceElement(selectedInstance.element.key);
        if(!me._cloudElementsUtils.isEmpty(sourceElement.relations)) {
            objectMetadata.fields = objectMetadata.fields.concat(sourceElement.relations);
        }

        var objectMetadataFlat = new Object;

        angular.copy(objectMetadata, objectMetadataFlat);
        me.all[selectedInstance.element.key].metadataflat[selectedObject] = objectMetadataFlat;

        return me._stripSelectedInstanceMetadata(selectedInstance, targetInstance, selectedObject, objectMetadata);
    },

    _stripSelectedInstanceMetadata: function(selectedInstance, targetInstance, selectedObject, objectMetadata) {
        var me = this;

        //Check if there is a Transformation already applied for the Object, if so strip the rows which are already mapped
        var trans = me.all[targetInstance.element.key].transformations;
        if(!me._cloudElementsUtils.isEmpty(trans)) {
            var transformationKeys = Object.keys(trans);
            var transformation = null;
            var targetObject = null;

            for(var i = 0; i < transformationKeys.length; i++) {
                targetObject = transformationKeys[i];
                transformation = trans[targetObject];

                var selectObjectName = null;
                var sourceEle = null;
                try {
                    var spl = targetObject.split('_');
                    selectObjectName = spl[1];
                    sourceEle = spl[0];
                }
                catch(err) { //Ignore the error
                }

                if(selectObjectName == selectedObject && sourceEle == selectedInstance.element.key) {
                    break;
                }
                else {
                    transformation = null;
                }
            }

            if(!me._cloudElementsUtils.isEmpty(transformation)
                && !me._cloudElementsUtils.isEmpty(transformation.fields)) {

                //Before restructuring, using trasformation find the fields that are transformed and remove from metadata
                for(var i = 0; i < transformation.fields.length; i++) {
                    var t = transformation.fields[i];
                    me._findAndRemoveInSourceMetadata(objectMetadata, t.path);
                }
            }
        }

        me._restructureObjectMetadata(objectMetadata, 'path');
        me.all[selectedInstance.element.key].metadata[selectedObject] = objectMetadata;

        return objectMetadata;
    },

    _findAndRemoveInSourceMetadata: function(sourceMetadata, path) {
        for(var i = 0; i < sourceMetadata.fields.length; i++) {
            var field = sourceMetadata.fields[i];
            if(field.vendorPath === path) {
                sourceMetadata.fields.splice(i, 1);
                break;
            }
        }
    },

    loadObjectMapping: function(selectedInstance, selectedObject, targetInstance, objectMetadata) {
        var me = this;

        var trans = me.all[targetInstance.element.key].transformations;
        if(me._cloudElementsUtils.isEmpty(trans)) {
            return "";
        }

        var transformationKeys = Object.keys(trans);
        var transformedObject = null;
        var targetObject = null;

        for(var i = 0; i < transformationKeys.length; i++) {
            targetObject = transformationKeys[i];
            transformedObject = trans[targetObject];

            var selectObjectName = null;
            var srcElement = null;
            try {
                var spl = targetObject.split('_');
                selectObjectName = spl[1];
                srcElement = spl[0];
            }
                //Ignore the error
            catch(err) {
            }

            if(srcElement === selectedInstance.element.key &&
                selectObjectName === selectedObject) {
                transformedObject.name = selectObjectName;
                break;
            }
            else {
                transformedObject = null;
            }
        }

        if(me._cloudElementsUtils.isEmpty(transformedObject)
            || me._cloudElementsUtils.isEmpty(transformedObject.fields)) {
            return null;
        }

        objectMetadata.objectTransformation = true;

        return me.loadTargetObjectMetaMapping(selectedInstance, selectedObject, targetInstance, transformedObject);
    },

    _restructureObjectMetadata: function(objectMetadata, pathName) {
        var me = this;
        if(this._cloudElementsUtils.isEmpty(objectMetadata)
            || this._cloudElementsUtils.isEmpty(objectMetadata.fields)) {
            return;
        }

        if(this._cloudElementsUtils.isEmpty(pathName)) {
            pathName = 'vendorPath';
        }

        for(var i = 0; i < objectMetadata.fields.length; i++) {
            var field = objectMetadata.fields[i];

            if(!this._cloudElementsUtils.isEmpty(field.vendorReadOnly)
                && field.vendorReadOnly == true) {
                continue;
            }

            if(field.vendorPath.indexOf('.') !== -1) {

                var fieldParts = field.vendorPath.split('.').slice(1).join('.');
                var objField = field.vendorPath.split('.')[0];

                var newInnerMetaData = this._getObjectInMetaData(objectMetadata, objField);
                if(this._cloudElementsUtils.isEmpty(newInnerMetaData)) {
                    newInnerMetaData = new Object;
                    newInnerMetaData[pathName] = objField;
                    newInnerMetaData.vendorPath = objField;
                    if(!me._cloudElementsUtils.isEmpty(field.vendorDisplayName)) {
                        newInnerMetaData.vendorDisplayName = objField;
                    }
                    newInnerMetaData['fields'] = [];
                    var t = 'object';
                    if(objField.indexOf('[*]') !== -1) {
                        t = 'array';
                    }
                    newInnerMetaData['type'] = t;

                    objectMetadata.fields.push(newInnerMetaData);
                }

                if(fieldParts.indexOf('.') === -1) {
                    var newInnerField = angular.copy(field);
                    newInnerField.actualVendorPath = field.vendorPath;
                    newInnerField.vendorPath = null;
                    newInnerField[pathName] = fieldParts;

                    newInnerField.vendorDisplayName = field.vendorDisplayName;
                    newInnerField.vendorRequired = field.vendorRequired;
                    newInnerField.vendorReadOnly = field.vendorReadOnly;

                    if(pathName != 'path' && this._cloudElementsUtils.isEmpty(field.path)) {
                        newInnerField.path = field.path;
                    }

                    if(this._cloudElementsUtils.isEmpty(newInnerField.fields)) {
                        newInnerField.fields = [];
                    }
                    newInnerMetaData.fields.push(newInnerField);
                }
                else {
                    this._structureInnerObjectMetadata(newInnerMetaData, fieldParts, field, pathName);
                }
            }
            else {
                field['actualVendorPath'] = field.vendorPath;
                field.vendorPath = null;
                field[pathName] = field['actualVendorPath'];
                if(this._cloudElementsUtils.isEmpty(field.fields)) {
                    field.fields = [];
                }
            }
        }

        objectMetadata.fields = objectMetadata.fields
            .filter(function(field) {
                if(field[pathName] != null) {
                    return field[pathName].indexOf('.') === -1;
                } else {
                    return field.vendorPath.indexOf('.') === -1;
                }

            });
    },

    _getObjectInMetaData: function(metadata, objectname) {
        for(var i = 0; i < metadata.fields.length; i++) {
            var field = metadata.fields[i];

            if(field.vendorPath === objectname) {
                return field;
            }
        }
    },

    _structureInnerObjectMetadata: function(metadata, fieldParts, field, pathName) {
        var me = this;
        var innerfieldParts = fieldParts.split('.').slice(1).join('.');
        var objField = fieldParts.split('.')[0];

        var newInnerMetaData = this._getObjectInMetaData(metadata, objField);
        if(this._cloudElementsUtils.isEmpty(newInnerMetaData)) {
            newInnerMetaData = new Object;
            newInnerMetaData.vendorPath = objField;
            newInnerMetaData[pathName] = objField;
            if(!me._cloudElementsUtils.isEmpty(field.vendorDisplayName)) {
                newInnerMetaData.vendorDisplayName = objField;
            }
            newInnerMetaData[pathName] = objField;
            newInnerMetaData['fields'] = [];
            var t = 'object';
            if(objField.indexOf('[*]') !== -1) {
                t = 'array';
            }
            newInnerMetaData['type'] = t;
            metadata.fields.push(newInnerMetaData);
        }

        if(innerfieldParts.indexOf('.') === -1) {
            var newInnerField = angular.copy(field);
            newInnerField.actualVendorPath = field.vendorPath;
            newInnerField.vendorPath = null;

            newInnerField.vendorDisplayName = field.vendorDisplayName;
            newInnerField.vendorRequired = field.vendorRequired;
            newInnerField.vendorReadOnly = field.vendorReadOnly;

            newInnerField[pathName] = innerfieldParts;
            if(pathName != 'path' && this._cloudElementsUtils.isEmpty(field.path)) {
                newInnerField.path = field.path;
            }

            if(this._cloudElementsUtils.isEmpty(field.fields)) {
                newInnerField.fields = [];
            }
            newInnerMetaData.fields.push(newInnerField);
        }
        else {
            this._structureInnerObjectMetadata(newInnerMetaData, innerfieldParts, field, pathName);
        }
    },

    loadTargetObjectMetaMapping: function(selectedInstance, selectedInstanceObject, targetInstance, transformation) {
        var me = this;

        return me._elementsService.loadObjectMetaData(targetInstance, transformation.vendorName)
            .then(
            me._handleTargetLoadObjectMetadata.bind(me, selectedInstance, selectedInstanceObject, targetInstance, transformation),
            me._handleTargetLoadErrorObjectMetadata.bind(me));
    },

    _handleTargetLoadErrorObjectMetadata: function(result) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, "Error getting the target object metadata");
        //return "Error getting the discovery object";
    },

    _handleTargetLoadObjectMetadata: function(selectedInstance, selectedInstanceObject, targetInstance, transformation, result) {
        var me = this;

        var targetObjectName = transformation.vendorName;

        if(me._cloudElementsUtils.isEmpty(me.all[targetInstance.element.key].metadata)) {
            me.all[targetInstance.element.key].metadata = new Object;
            me.all[targetInstance.element.key].metadataflat = new Object;
        }

        if(me._cloudElementsUtils.isEmpty(me.all[targetInstance.element.key].metamapping)) {
            me.all[targetInstance.element.key].metamapping = new Object;
        }

        var objectMetadata = result.data;
        //Check if the Element has any fields to be added addition to metadata and join those fields
        var targetElement = me._picker.getTargetElement(targetInstance.element.key);
        if(!me._cloudElementsUtils.isEmpty(targetElement.relations)
            && !me._cloudElementsUtils.isEmpty(targetElement.relations[targetObjectName])) {
            objectMetadata.fields = objectMetadata.fields.concat(targetElement.relations[targetObjectName]);
        }

        var objectMetadataFlat = new Object;

        angular.copy(objectMetadata, objectMetadataFlat);
        me.all[targetInstance.element.key].metadataflat[targetObjectName] = objectMetadataFlat;

        if(!me._cloudElementsUtils.isEmpty(transformation)
            && !me._cloudElementsUtils.isEmpty(transformation.fields)) {
            //Before restructuring, set the Path values from trasformation so that its easy in mapping
            for(var i = 0; i < transformation.fields.length; i++) {
                var t = transformation.fields[i];
                me._setPathInMetaData(objectMetadata, t.path, t.vendorPath, t.configuration);
            }
        }

        me._restructureObjectMetadata(objectMetadata);

        me.all[targetInstance.element.key].metadata[targetObjectName] = objectMetadata;

        //Create an empty mapping, basically the definition from metadata and return it
        return me._createEmptyMapping(selectedInstance, selectedInstanceObject, targetInstance, targetObjectName, objectMetadata)
    },

    hasDisplayName: function(instance, objectname) {
        var me = this;

        var metadataflat = me.all[instance.element.key].metadataflat[objectname];

        var displayName = false;
        var count = 0;
        if(!me._cloudElementsUtils.isEmpty(metadataflat.fields)) {
            for(var i = 0; i < metadataflat.fields.length; i++) {
                var field = metadataflat.fields[i];

                if(!this._cloudElementsUtils.isEmpty(field.vendorDisplayName)) {
                    displayName = true;
                    break;
                }
                //Just dont want to loop all the field to find out
                //Should be a good number to decide what to sort on
                if(count == 10) {
                    break;
                }
                count++;
            }
        }

        return displayName;
    },

    _createEmptyMapping: function(selectedInstance, selectedInstanceObject, targetInstance, targetObjectName, objectMetadata) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.all[targetInstance.element.key].metamapping)) {
            me.all[targetInstance.element.key].metamapping = new Object;
        }

        var name = selectedInstance.element.key + '_' + selectedInstanceObject + '_' + targetObjectName;

        if(!me._cloudElementsUtils.isEmpty(me.all[targetInstance.element.key].metamapping[name])) {
            return me.all[targetInstance.element.key].metamapping[name];
        }

        var newMapping = new Object;
        newMapping['name'] = name;
        newMapping['vendorName'] = targetObjectName;
        newMapping['fields'] = objectMetadata.fields;

        //Check if bidirectional is enabled,
        // if so check if there is a transformation of the same on the source Object and enable bidirection
        if(me._application.isMapperBiDirectional() == true
            && !me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].transformations)) {
            var sourceObjName = targetInstance.element.key + '_' + targetObjectName + '_' + selectedInstanceObject;

            //Check if the object exists in transformation
            var trans = me.all[selectedInstance.element.key].transformations[sourceObjName];
            if(!me._cloudElementsUtils.isEmpty(trans)) {
                newMapping['bidirectional'] = true;
            } else {
                newMapping['bidirectional'] = false;
            }
        } else {
            newMapping['bidirectional'] = false;
        }

        var targetTrans = null;
        if(!me._cloudElementsUtils.isEmpty(me.all[targetInstance.element.key].transformations)) {
            targetTrans = me.all[targetInstance.element.key].transformations[name];
        }
        if(!me._cloudElementsUtils.isEmpty(targetTrans) && !me._cloudElementsUtils.isEmpty(targetTrans.script)) {
            newMapping['script'] = targetTrans.script;
        }

        me.all[targetInstance.element.key].metamapping[name] = newMapping;
        return newMapping;
    },

    _setPathInMetaData: function(objectMetadata, path, vendorPath, configuration) {
        var me = this;
        for(var i = 0; i < objectMetadata.fields.length; i++) {
            var field = objectMetadata.fields[i];
            if(field.vendorPath === vendorPath) {
                field.path = path;
                if(!me._cloudElementsUtils.isEmpty(configuration)) {
                    field.configuration = configuration;
                }
                break;
            }
        }
    },

    getTargetMetaMapping: function(targetInstance, sourceObject, targetObject) {
        var me = this;

        var targetMetaMapping = me.all[targetInstance.element.key].metamapping;
        if(me._cloudElementsUtils.isEmpty(targetMetaMapping)) {
            return null;
        }

        var mKeys = Object.keys(targetMetaMapping);

        for(var i = 0; i < mKeys.length; i++) {
            var mappingName = mKeys[i];
            var spl = mappingName.split('_');
            selectObjectName = spl[1];
            targetObjectName = spl[2];

            if(selectObjectName == sourceObject &&
                targetObjectName == targetObject) {
                return targetMetaMapping[mKeys[i]];
            }
        }
    },

    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Construct and Save Definitions
    // Construct and Save transformations
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    saveDefinitionAndTransformation: function(sourceInstance, targetInstance, objects) {
        var me = this;

        //Construct the Object Definition and inner Object definitions
        //Save all the definitions at instance level
        me._constructAndSaveObjectDefinition(targetInstance, sourceInstance);
    },

    //STEP 1 : Get All the definitions that needs to be created or updated
    //STEP 2 : Save all the definitions
    //STEP 3 : Get all transformation for the target object
    //STEP 4 : Save all the transformation for the target object
    //STEP 5 : Bidirectional - Check if there are any definitions that needs to be saved for source element
    //STEP 5.1 : Save all source definitions
    //STEP 6 : Bidirectional - Get source transformations
    //STEP 6 : Bidirectional - save all source transformations

    _constructAndSaveObjectDefinition: function(selectedInstance, sourceInstance) {
        var me = this;
        var definitionArray = me._transformationUtil.getAllDefinitions(selectedInstance, sourceInstance);
        var definitionSaveCounter = 0;
        return me._saveDefinitionFromArray(selectedInstance, sourceInstance, definitionArray, definitionSaveCounter);
    },

    _saveDefinitionFromArray: function(selectedInstance, sourceInstance, definitionArray, definitionSaveCounter, useMethodType) {
        var me = this;

        var keys = Object.keys(definitionArray);
        var key = keys[definitionSaveCounter];

        if(me._cloudElementsUtils.isEmpty(key))
            return;

        var methodType = 'POST';

        var defs = me.all[selectedInstance.element.key].definitions;

        if(!me._cloudElementsUtils.isEmpty(defs)
            && !me._cloudElementsUtils.isEmpty(defs[key])
            && defs[key].level == 'instance') {
            methodType = 'PUT';
        }

        if(!me._cloudElementsUtils.isEmpty(useMethodType)) {
            methodType = useMethodType;
        }

        definitionSaveCounter++;

        return me._elementsService.saveObjectDefinition(selectedInstance, key, definitionArray[key], 'instance', methodType)
            .then(
            me._handleOnSaveObjectDefinition.bind(this, selectedInstance, sourceInstance, definitionArray, definitionSaveCounter),
            me._handleOnSaveObjectDefinitionError.bind(this, selectedInstance, sourceInstance, definitionArray, definitionSaveCounter));
    },

    _handleOnSaveObjectDefinitionError: function(selectedInstance, sourceInstance, definitionArray, definitionSaveCounter, error) {
        var me = this;

        definitionSaveCounter--;

        if(error.status == 404) {
            return me._saveDefinitionFromArray(selectedInstance, sourceInstance, definitionArray, definitionSaveCounter, 'POST');
        }
        else if(error.status == 409) {
            return me._saveDefinitionFromArray(selectedInstance, sourceInstance, definitionArray, definitionSaveCounter, 'PUT');
        }
        else {
            this._notifications.notify(bulkloader.events.ERROR, error.data.message);
            return error;
        }
    },

    _handleOnSaveObjectDefinition: function(selectedInstance, sourceInstance, definitionArray, definitionSaveCounter, result) {

        var me = this;

        var keys = Object.keys(definitionArray);

        if(me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].definitions)) {
            me.all[selectedInstance.element.key].definitions = new Object();
        }
        //Setting the saved definition in case used for multiple save
        var savedkey = keys[definitionSaveCounter - 1];
        me.all[selectedInstance.element.key].definitions[savedkey] = definitionArray[savedkey];

        //Save transformations once all the definitions are stored
        if(definitionSaveCounter == keys.length) {
            return me._constructAndSaveObjectTransformation(selectedInstance, sourceInstance, definitionArray);
        }
        else {
            return me._saveDefinitionFromArray(selectedInstance, sourceInstance, definitionArray, definitionSaveCounter);
        }
    },

    _constructAndSaveObjectTransformation: function(selectedInstance, sourceInstance, definitionArray) {
        var me = this;

        var transformationArray = me._transformationUtil.getAllTransformations(selectedInstance, sourceInstance);

        var transformationSaveCounter = 0;
        return me._saveTransformationFromArray(selectedInstance, sourceInstance, definitionArray, transformationArray, transformationSaveCounter);
    },

    _saveTransformationFromArray: function(selectedInstance, sourceInstance, definitionArray, transformationArray, transformationSaveCounter, useMethodType) {
        var me = this;

        var keys = Object.keys(transformationArray);
        var key = keys[transformationSaveCounter];

        if(me._cloudElementsUtils.isEmpty(key))
            return;

        var methodType = 'POST';

        var trans = me.all[selectedInstance.element.key].transformations;

        if(!me._cloudElementsUtils.isEmpty(trans)
            && !me._cloudElementsUtils.isEmpty(trans[key])) {
            methodType = 'PUT';
        }

        if(!me._cloudElementsUtils.isEmpty(useMethodType)) {
            methodType = useMethodType;
        }

        transformationSaveCounter++;

        return me._elementsService.saveObjectTransformation(selectedInstance,
            key, transformationArray[key], 'instance', methodType)
            .then(
            this._handleOnSaveTransformation.bind(this, selectedInstance, sourceInstance, definitionArray, transformationArray, transformationSaveCounter),
            this._handleOnSaveTransformationError.bind(this, selectedInstance, sourceInstance, definitionArray, transformationArray, transformationSaveCounter));
    },

    _handleOnSaveTransformationError: function(selectedInstance, sourceInstance, definitionArray, transformationArray, transformationSaveCounter, error) {
        var me = this;
        transformationSaveCounter--;

        if(error.status == 404) { //in this scenario it might be a PUT, but expecting a POST, so change this and make a POST call again
            return me._saveTransformationFromArray(selectedInstance, sourceInstance, definitionArray, transformationArray, transformationSaveCounter, 'POST');
        }
        else if(error.status == 409) { //In this case a transformation might have already been present so make a PUT call
            return me._saveTransformationFromArray(selectedInstance, sourceInstance, definitionArray, transformationArray, transformationSaveCounter, 'PUT');
        }
        else {
            this._notifications.notify(bulkloader.events.ERROR, error.data.message);
            return false;
        }
    },

    _handleOnSaveTransformation: function(selectedInstance, sourceInstance, definitionArray, transformationArray, transformationSaveCounter, result) {
        var me = this;

        var keys = Object.keys(transformationArray);

        //Setting the saved transformation
        if(me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].transformations)) {
            me.all[selectedInstance.element.key].transformations = new Object();
        }
        var savedkey = keys[transformationSaveCounter - 1];
        me.all[selectedInstance.element.key].transformations[savedkey] = transformationArray[savedkey];

        //Save transformations once all the definitions are stored
        if(transformationSaveCounter == keys.length) {
            //this._notifications.notify(bulkloader.events.TRANSFORMATION_SAVED);
            me._constructAndSaveSourceDefinition(selectedInstance, sourceInstance, definitionArray, transformationArray);
        }
        else {
            return me._saveTransformationFromArray(selectedInstance, sourceInstance, definitionArray, transformationArray, transformationSaveCounter);
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Source Instance Transformations and Definitions for Bi-directional mapping
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    _constructAndSaveSourceDefinition: function(selectedInstance, sourceInstance, definitionArray, transformationArray) {
        var me = this;
        var sourceDefinitionArray = me._transformationUtil.getDefinitionsForSource(selectedInstance, sourceInstance, definitionArray);
        var dKeys = Object.keys(sourceDefinitionArray);

        if(dKeys == null || me._cloudElementsUtils.isEmpty(dKeys.length) || dKeys.length == 0) {
            me._notifications.notify(bulkloader.events.TRANSFORMATION_SAVED);
        }

        var definitionSaveCounter = 0;
        me._saveSourceDefinitionFromArray(selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray, definitionSaveCounter);
    },

    _saveSourceDefinitionFromArray: function(selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray, definitionSaveCounter, useMethodType) {
        var me = this;

        var keys = Object.keys(sourceDefinitionArray);
        var key = keys[definitionSaveCounter];

        if(me._cloudElementsUtils.isEmpty(key))
            return;

        var methodType = 'POST';

        var defs = me.all[sourceInstance.element.key].definitions;

        if(!me._cloudElementsUtils.isEmpty(defs)
            && !me._cloudElementsUtils.isEmpty(defs[key])
            && defs[key].level == 'instance') {
            methodType = 'PUT';
        }

        if(!me._cloudElementsUtils.isEmpty(useMethodType)) {
            methodType = useMethodType;
        }

        definitionSaveCounter++;

        return me._elementsService.saveObjectDefinition(sourceInstance, key, sourceDefinitionArray[key], 'instance', methodType)
            .then(
            me._handleOnSaveSourceObjectDefinition.bind(this, selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray, definitionSaveCounter),
            me._handleOnSaveSourceObjectDefinitionError.bind(this, selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray, definitionSaveCounter));
    },

    _handleOnSaveSourceObjectDefinitionError: function(selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray, definitionSaveCounter, error) {
        var me = this;

        definitionSaveCounter--;

        if(error.status == 404) {
            return me._saveSourceDefinitionFromArray(selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray, definitionSaveCounter, 'POST');
        }
        else if(error.status == 409) {
            return me._saveSourceDefinitionFromArray(selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray, definitionSaveCounter, 'PUT');
        }
        else {
            this._notifications.notify(bulkloader.events.ERROR, error.data.message);
            return error;
        }
    },

    _handleOnSaveSourceObjectDefinition: function(selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray, definitionSaveCounter, result) {

        var me = this;

        var keys = Object.keys(sourceDefinitionArray);

        if(me._cloudElementsUtils.isEmpty(me.all[sourceInstance.element.key].definitions)) {
            me.all[sourceInstance.element.key].definitions = new Object();
        }
        //Setting the saved definition in case used for multiple save
        var savedkey = keys[definitionSaveCounter - 1];
        me.all[sourceInstance.element.key].definitions[savedkey] = sourceDefinitionArray[savedkey];

        //Save transformations once all the definitions are stored
        if(definitionSaveCounter == keys.length) {
            return me._constructAndSaveSourceObjectTransformation(selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray);
        }
        else {
            return me._saveSourceDefinitionFromArray(selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray, definitionSaveCounter);
        }
    },

    _constructAndSaveSourceObjectTransformation: function(selectedInstance, sourceInstance, definitionArray, transformationArray, sourceDefinitionArray) {
        var me = this;

        var sourceTransformationArray = me._transformationUtil.getTransformationsForSource(selectedInstance, sourceInstance, transformationArray);

        var transformationSaveCounter = 0;
        return me._saveSourceTransformationFromArray(selectedInstance, sourceInstance, sourceTransformationArray, transformationSaveCounter);
    },

    _saveSourceTransformationFromArray: function(selectedInstance, sourceInstance, sourceTransformationArray, transformationSaveCounter, useMethodType) {
        var me = this;

        var keys = Object.keys(sourceTransformationArray);
        var key = keys[transformationSaveCounter];

        if(me._cloudElementsUtils.isEmpty(key))
            return;

        var methodType = 'POST';

        var trans = me.all[sourceInstance.element.key].transformations;

        if(!me._cloudElementsUtils.isEmpty(trans)
            && !me._cloudElementsUtils.isEmpty(trans[key])) {
            methodType = 'PUT';
        }

        if(!me._cloudElementsUtils.isEmpty(useMethodType)) {
            methodType = useMethodType;
        }

        transformationSaveCounter++;

        return me._elementsService.saveObjectTransformation(sourceInstance,
            key, sourceTransformationArray[key], 'instance', methodType)
            .then(
            this._handleOnSaveSourceTransformation.bind(this, selectedInstance, sourceInstance, sourceTransformationArray, transformationSaveCounter),
            this._handleOnSaveSourceTransformationError.bind(this, selectedInstance, sourceInstance, sourceTransformationArray, transformationSaveCounter));
    },

    _handleOnSaveSourceTransformationError: function(selectedInstance, sourceInstance, sourceTransformationArray, transformationSaveCounter, error) {
        var me = this;
        transformationSaveCounter--;

        if(error.status == 404) { //in this scenario it might be a PUT, but expecting a POST, so change this and make a POST call again
            return me._saveSourceTransformationFromArray(selectedInstance, sourceInstance, sourceTransformationArray, transformationSaveCounter, 'POST');
        }
        else if(error.status == 409) { //In this case a transformation might have already been present so make a PUT call
            return me._saveSourceTransformationFromArray(selectedInstance, sourceInstance, sourceTransformationArray, transformationSaveCounter, 'PUT');
        }
        else {
            this._notifications.notify(bulkloader.events.ERROR, error.data.message);
            return false;
        }
    },

    _handleOnSaveSourceTransformation: function(selectedInstance, sourceInstance, sourceTransformationArray, transformationSaveCounter, result) {
        var me = this;

        var keys = Object.keys(sourceTransformationArray);

        //Setting the saved transformation
        if(me._cloudElementsUtils.isEmpty(me.all[sourceInstance.element.key].transformations)) {
            me.all[sourceInstance.element.key].transformations = new Object();
        }
        var savedkey = keys[transformationSaveCounter - 1];
        me.all[sourceInstance.element.key].transformations[savedkey] = sourceTransformationArray[savedkey];

        //Save transformations once all the definitions are stored
        if(transformationSaveCounter == keys.length) {
            this._notifications.notify(bulkloader.events.TRANSFORMATION_SAVED);
        }
        else {
            return me._saveSourceTransformationFromArray(selectedInstance, sourceInstance, sourceTransformationArray, transformationSaveCounter);
        }
    }

});

/**
 * TransformationUtil Factory object creation
 *
 */
(function() {

    var MapperObject = Class.extend({

        instance: new Mapper(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Notifications', 'Picker', 'Application', 'TransformationUtil', function(CloudElementsUtils, ElementsService, Notifications, Picker, Application, TransformationUtil) {
            var me = this;
            me.instance._cloudElementsUtils = CloudElementsUtils;
            me.instance._elementsService = ElementsService;
            me.instance._notifications = Notifications;
            me.instance._picker = Picker;
            me.instance._application = Application;
            me.instance._transformationUtil = TransformationUtil;

            me.instance._transformationUtil.all = me.instance.all;
            return me.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Mapper', MapperObject);
}());

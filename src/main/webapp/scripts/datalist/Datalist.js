/**
 * Datalist factor class as an helper to picker controller.
 *
 *
 * @author Ramana
 */

bulkloader.events.TRANSFORMATION_SAVED = "Datalist.TRANSFORMATION_SAVED";

var Datalist = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _objectMetadata: null,
    _objectMetadataFlat: null,

    //An Object which holds all the data at instance Level
    all: new Object,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    _isLiteral: function(type) {
        if(type == 'string' || type == 'number'
            || type == 'date' || type == 'boolean'
            || type == 'unknown' || type == null
            || this._isDateFormat(type)
            || this._isLiteralArray(type))
        {
            return true;
        }

        return false;
    },

    _isLiteralArray: function(type) {
        if(type == 'array[string]' || type == 'array[number]'
            || type == 'array[boolean]')
        {
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
            || type ==  "dd/MM/yyy"
            || type ==  "milliseconds"
            || type ==  "Vendor date format")
        {
            return true;
        }
        return false;
    },

    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Load selected Instance Objects
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    loadInstanceObjects:function(selectedInstance){
        var me = this;

        var selectedInstance = angular.fromJson(selectedInstance);

        if(me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key])) {
            me.all[selectedInstance.element.key] = new Object;
            me.all[selectedInstance.element.key].instance = selectedInstance;
        }

        me.loadInstanceDefinitions(selectedInstance);

        return me.loadInstanceTransformations(selectedInstance);
    },

    _handleLoadInstanceObjects:function(selectedInstance, result){
        var me = this;
        var objectsAndTransformation = new Array();
        var sourceElement = me._picker.getSourceElement(selectedInstance.element.key);
        if(!me._cloudElementsUtils.isEmpty(sourceElement.objects)) {
            var objs = new Array();
            for(var i in sourceElement.objects) {
                var obj = sourceElement.objects[i];
                objs.push(obj.vendorPath);
                objectsAndTransformation.push({
                    name: obj.vendorPath,
                    //For now setting everything to transformed and the saving definitions and transformations will decide
//                    transformed: me._isObjectTransformed(objName, selectedInstance)
                    transformed: true
                });
            }
            me.all[selectedInstance.element.key].objects = objs;

        } else {
            me.all[selectedInstance.element.key].objects = result.data;
            if(!me._cloudElementsUtils.isEmpty(result.data)) {
                for(var i=0; i< result.data.length; i++) {
                    var objName = result.data[i];
                    objectsAndTransformation.push({
                        name: objName,
                        //For now setting everything to transformed and the saving definitions and transformations will decide
//                    transformed: me._isObjectTransformed(objName, selectedInstance)
                        transformed: true
                    });
                }
            }
        }

        me.all[selectedInstance.element.key].objectsAndTransformation = objectsAndTransformation;

        return me.all[selectedInstance.element.key].objectsAndTransformation;
    },

    _isObjectTransformed: function(objectName, selectedInstance) {
        var me = this;

        if(!me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].transformations)
            && !me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].transformations[objectName])) {
            return true;
        }
        return false;
    },

    _handleLoadInstanceObjectError: function(result) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, "Error getting the discovery objects");
        return "Error getting the discovery object";
    },

    //Based on the selected instance get all the object transformation
    loadInstanceTransformations: function(selectedInstance) {
        return this._elementsService.loadInstanceTransformations(selectedInstance)
            .then(
            this._handleLoadInstanceTransformations.bind(this, selectedInstance),
            this._handleLoadInstanceTransformationsError.bind(this, selectedInstance) );
    },

    _handleLoadInstanceTransformations:function(selectedInstance,result){
        var me = this;
        me.all[selectedInstance.element.key].transformationsLoaded = true;
        me.all[selectedInstance.element.key].transformations = result.data;

        var sourceElement = me._picker.getSourceElement(selectedInstance.element.key);
        if(!me._cloudElementsUtils.isEmpty(sourceElement.objects)) {
            return me._handleLoadInstanceObjects(selectedInstance, new Object());
        } else {
            //loading the Instance Objects
            return this._elementsService.loadInstanceObjects(selectedInstance)
                .then(
                this._handleLoadInstanceObjects.bind(this, selectedInstance),
                this._handleLoadInstanceObjectError.bind(this));
        }
    },

    _handleLoadInstanceTransformationsError:function(selectedInstance,result){
        var me = this;
        me.all[selectedInstance.element.key].transformationsLoaded = true;

        var sourceElement = me._picker.getSourceElement(selectedInstance.element.key);
        if(!me._cloudElementsUtils.isEmpty(sourceElement.objects)) {
            return me._handleLoadInstanceObjects(selectedInstance, new Object());
        } else {
            //loading the Instance Objects
            return this._elementsService.loadInstanceObjects(selectedInstance)
                .then(
                this._handleLoadInstanceObjects.bind(this, selectedInstance),
                this._handleLoadInstanceObjectError.bind(this));
        }
    },

    //Based on the selected instance get all the instance definitions
    loadInstanceDefinitions: function(selectedInstance) {
        this._elementsService.loadInstanceObjectDefinitions(selectedInstance)
            .then(
            this._handleLoadInstanceDefinitions.bind(this, selectedInstance),
            this._handleLoadError.bind(this) );

    },

    _handleLoadInstanceDefinitions:function(selectedInstance, result){
        var me = this;
        me.all[selectedInstance.element.key].definitions = result.data;
    },

    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Load selected Object metadata
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    loadObjectMetaData:function(selectedInstance, selectedObject){

        return this._elementsService.loadObjectMetaData(selectedInstance, selectedObject)
            .then(
            this._handleLoadObjectMetadata.bind(this, selectedInstance, selectedObject),
            this._handleLoadErrorObjectMetadata.bind(this) );
    },

    _handleLoadErrorObjectMetadata: function(result) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, "Error getting object fields");
        return "Error getting the discovery object";
    },

    _handleLoadObjectMetadata:function(selectedInstance, selectedObject, result){
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].metadata)) {
            me.all[selectedInstance.element.key].metadata = new Object;
            me.all[selectedInstance.element.key].metadataflat = new Object;
        }

        var objectMetadata = result.data;
        var objectMetadataFlat = new Object;

        //Check to see if there is a transformation available for the object and handle transform flag setting
        me._addTransformFlag(selectedInstance, selectedObject, objectMetadata);

        angular.copy(objectMetadata, objectMetadataFlat);
        me.all[selectedInstance.element.key].metadataflat[selectedObject] = objectMetadataFlat;

        me._restructureObjectMetadata(objectMetadata);
        me.all[selectedInstance.element.key].metadata[selectedObject] = objectMetadata;

        return objectMetadata;
    },

    //Check to see if there is a transformation available for the object and set the transform flag for the metadata
    //Set true if the vendorpath is in transformation, else set False
    _addTransformFlag: function(selectedInstance, selectedObject, objectMetadata) {
        var me  = this;

        if(me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].transformations)) {
            return;
        }

        var objectTransformation = me.all[selectedInstance.element.key].transformations[selectedObject];

        if(me._cloudElementsUtils.isEmpty(objectTransformation)
            || me._cloudElementsUtils.isEmpty(objectTransformation.fields)) {
            return;
        }

        for(var i=0; i< objectTransformation.fields.length; i++) {
            var f = objectTransformation.fields[i];
            me._setTransformValue(objectMetadata, f.vendorPath);
        }

        // Mark the object as All Instances with transformation
        if (objectMetadata.fields.length == objectTransformation.fields.length){
           return  objectMetadata.objectTransformation = true;
        }

    },

    _setTransformValue: function(objectMetadata, vendorPath) {
        for(var i=0; i< objectMetadata.fields.length; i++) {
            var f = objectMetadata.fields[i];
            if(f.vendorPath == vendorPath) {
                f.transform = true;
                break;
            }
        }
    },

    _restructureObjectMetadata: function(objectMetadata) {

        if(this._cloudElementsUtils.isEmpty(objectMetadata)
            || this._cloudElementsUtils.isEmpty(objectMetadata.fields)) {
            return;
        }

        for(var i=0; i < objectMetadata.fields.length; i++) {
            var field = objectMetadata.fields[i];

            if(field.vendorPath.indexOf('.') !== -1) {


                var fieldParts = field.vendorPath.split('.').slice(1).join('.');
                var objField = field.vendorPath.split('.')[0];

                var newInnerMetaData = this._getObjectInMetaData(objectMetadata, objField);
                if(this._cloudElementsUtils.isEmpty(newInnerMetaData)) {
                    newInnerMetaData = new Object;
                    newInnerMetaData['vendorPath'] = objField;
                    newInnerMetaData['fields'] = [];
                    var t = 'object';
                    if(objField.indexOf('[*]') !== -1) {
                        t = 'array';
                    }
                    newInnerMetaData['type'] = t;

                    objectMetadata.fields.push(newInnerMetaData);
                }

                if(fieldParts.indexOf('.') === -1)
                {
                    var newInnerField = angular.copy(field);
                    newInnerField.actualVendorPath = field.vendorPath;
                    newInnerField.vendorPath = fieldParts;
                    newInnerMetaData.fields.push(newInnerField);
                }
                else
                {
                    this._structureInnerObjectMetadata(newInnerMetaData, fieldParts, field);
                }
            }
            else {
                field['actualVendorPath'] = field.vendorPath;
            }
        }

        objectMetadata.fields = objectMetadata.fields
            .filter(function (field) {
                return field.vendorPath.indexOf('.') === -1;
            });
    },

    _getObjectInMetaData: function(metadata, objectname) {
        for(var i=0; i < metadata.fields.length; i++) {
            var field = metadata.fields[i];

            if(field.vendorPath === objectname) {
                return field;
            }
        }
    },

    _structureInnerObjectMetadata: function(metadata, fieldParts, field) {

        var innerfieldParts = fieldParts.split('.').slice(1).join('.');
        var objField = fieldParts.split('.')[0];

        var newInnerMetaData = this._getObjectInMetaData(metadata, objField);
        if(this._cloudElementsUtils.isUndefinedOrNull(newInnerMetaData)) {
            newInnerMetaData = new Object;
            newInnerMetaData['vendorPath'] = objField;
            newInnerMetaData['fields'] = [];
            var t = 'object';
            if(objField.indexOf('[*]') !== -1) {
                t = 'array';
            }
            newInnerMetaData['type'] = t;
            metadata.fields.push(newInnerMetaData);
        }

        if(innerfieldParts.indexOf('.') === -1)
        {
            var newInnerField = angular.copy(field);
            newInnerField.actualVendorPath = field.vendorPath;
            newInnerField.vendorPath = innerfieldParts;
            newInnerMetaData.fields.push(newInnerField);
        }
        else
        {
            this._structureInnerObjectMetadata(newInnerMetaData, innerfieldParts, field);
        }
    },

    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Construct and Save Definitions
    // Construct and Save transformations
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    saveDefinitionAndTransformation: function(selectedInstance, objects) {
        var me = this;

        //Convert objects to map of objectName key and transformed value
        var objectsAndTrans = objects.reduce(function ( total, objects ) {
            total[ objects.name ] = objects.transformed;
            return total;
        }, {});

        me.all[selectedInstance.element.key].objectsAndTrans = objectsAndTrans;

        //Construct the Object Definition and inner Object definitions
        //Save all the definitions at instance level
        me._constructAndSaveObjectDefinition(selectedInstance);
    },

    _constructDefinition: function(definitionArray, objectName, mData, parentObjectName) {
        var me = this;

        var objDefinition = {
            fields:[]
        };

        for(var i = 0; i < mData.fields.length; i++){
            var mapperData = mData.fields[i];

            if((me._cloudElementsUtils.isEmpty(mapperData.transform)
                || mapperData.transform == false)
                && (me._cloudElementsUtils.isEmpty(mapperData.fields) || mapperData.fields.length == 0)) {
                continue;
            }

            if(me._cloudElementsUtils.isEmpty(mapperData.type))
                mapperData.type = 'string'; //this is dirty fix for setting a type value by default

            if(this._isLiteral(mapperData.type.toLowerCase())
                || this._isDateFormat(mapperData.type))
            {
                var t = mapperData.type;
                var p = mapperData.vendorPath;

                if(this._isDateFormat(t)) {
                    t = 'date';
                }

                if(this._isLiteralArray(mapperData.type)) {
                    p = p+'[*]';
                }

                objDefinition.fields.push({
                    'path': p,
                    'type': t
                });
            }
            else{
                //This is where its of type Object so create a definition out of it
                // and also add it to the base definition
                var name = mapperData.vendorPath;
                if(this._cloudElementsUtils.isEmpty(name) || name.length == 0) {
                    name = mapperData.vendorPath
                }

                if(mapperData.type == 'array') {
                    name = name.replace('[*]', '');
                }

                this._constructDefinition(definitionArray, name, mapperData, parentObjectName);

                var t = parentObjectName+'_'+mapperData.vendorPath;
                var p = mapperData.vendorPath;
                if(mapperData.type == 'array') {
                    t = 'array['+mapperData.vendorPath.replace('[*]', '')+']';
                    p = p+'[*]';
                }

                objDefinition.fields.push({
                    'path': p,
                    'type': t
                });
            }
        }

        if(parentObjectName === objectName ) {
            definitionArray[objectName]=objDefinition;
        } else {
            definitionArray[parentObjectName+'_'+objectName]=objDefinition;
        }
    },

    _anyFieldSelected: function(object) {

        var me = this;

        if (me._cloudElementsUtils.isEmpty(object)) {
          return false;
        }

        if (me._cloudElementsUtils.isEmpty(object.fields)) {
          return false;
        }

        if (object.fields.length <= 0) {
          return false;
        }

        for (var i = 0; i < object.fields.length; i++) {
            var field = object.fields[i];

            if ((field instanceof Object) == false) {
              continue;
            }

            if ('fields' in field) {
              if (me._anyFieldSelected(field) == false) {
                  continue;
              } else {
                  return true;
              }
            } else {
                if ('transform' in field) {
                    if (field.transform == true) {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    _constructAndSaveObjectDefinition: function(selectedInstance) {
        var me = this;

        var mData = me.all[selectedInstance.element.key].metadata;
        var objectsAndTrans = me.all[selectedInstance.element.key].objectsAndTrans;
        var mKeys = Object.keys(mData);

        var definitionArray = new Object;

        var present = false;
        for (var i = 0; i < mKeys.length; i++) {

            if(objectsAndTrans[mKeys[i]] == false
                && me._anyFieldSelected(mData[mKeys[i]]) == false) {
                continue;
            }
            present = true;
            me._constructDefinition(definitionArray, mKeys[i], mData[mKeys[i]], mKeys[i]);
        }

        if(present == false) {
            me._notifications.notify(bulkloader.events.ERROR, "No Object selected for schedule");
            return;
        }

        var definitionSaveCounter = 0;

        return me._saveDefinitionFromArray(selectedInstance, definitionArray, definitionSaveCounter);
    },

    _saveDefinitionFromArray: function(selectedInstance, definitionArray, definitionSaveCounter, useMethodType) {
        var me = this;

        var keys = Object.keys(definitionArray);
        var key = keys[definitionSaveCounter];

        if(me._cloudElementsUtils.isEmpty(key))
            return;

        var methodType = 'POST';

        var defs = me.all[selectedInstance.element.key].definitions;

        if (!me._cloudElementsUtils.isEmpty(defs)
            && !me._cloudElementsUtils.isEmpty(defs[key])
            && defs[key].level == 'instance')
        {
            methodType = 'PUT';
        }

        if(!me._cloudElementsUtils.isEmpty(useMethodType)) {
            methodType = useMethodType;
        }

        definitionSaveCounter++;

        return me._elementsService.saveObjectDefinition(selectedInstance, key, definitionArray[key], 'instance', methodType)
            .then(
            me._handleOnSaveObjectDefinition.bind(this, selectedInstance, definitionArray, definitionSaveCounter),
            me._handleOnSaveObjectDefinitionError.bind(this, selectedInstance, definitionArray, definitionSaveCounter) );
    },

    _handleOnSaveObjectDefinitionError: function(selectedInstance, definitionArray, definitionSaveCounter, error) {
        var me = this;

        definitionSaveCounter--;

        if(error.status == 404) {
            return me._saveDefinitionFromArray(selectedInstance, definitionArray, definitionSaveCounter, 'POST');
        }
        else if(error.status == 409)
        {
            return me._saveDefinitionFromArray(selectedInstance, definitionArray, definitionSaveCounter, 'PUT');
        }
        else
        {
            this._notifications.notify(bulkloader.events.ERROR, error.data.message);
            return error;
        }
    },

    _handleOnSaveObjectDefinition: function(selectedInstance, definitionArray, definitionSaveCounter, result) {

        var me = this;

        var keys = Object.keys(definitionArray);

        if(me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].definitions)) {
            me.all[selectedInstance.element.key].definitions = new Object();
        }

        //Setting the saved definition in case used for multiple save
        var savedkey = keys[definitionSaveCounter-1];
        me.all[selectedInstance.element.key].definitions[savedkey] = definitionArray[savedkey];

        //Save transformations once all the definitions are stored
        if(definitionSaveCounter == keys.length)
        {
            return me._constructAndSaveObjectTransformation(selectedInstance);
        }
        else
        {
            return me._saveDefinitionFromArray(selectedInstance, definitionArray, definitionSaveCounter);
        }
    },

    _constructDeeperTransformation: function(objectTransformation, objectMapperData, objectName) {

        var me = this;

        if(objectMapperData.type == 'array') {
            objectName = objectName+'[*]';
        }

        for(var i = 0; i < objectMapperData.fields.length; i++){
            var mapperData = objectMapperData.fields[i];
            if((me._cloudElementsUtils.isEmpty(mapperData.transform)
                || mapperData.transform == false)
                && (me._cloudElementsUtils.isEmpty(mapperData.fields) || mapperData.fields.length == 0)) {
                continue;
            }

            var mapperType = mapperData.type.toLowerCase();

            if(this._isLiteral(mapperType)
                || this._isDateFormat(mapperData.type))
            {
                var p = mapperData.vendorPath;
                if(this._isLiteralArray(mapperData.type)) {
                    p = p+'[*]';
                }

//                if(!this._cloudElementsUtils.isEmpty(mapperData.configuration)) {
//                    objectTransformation.fields.push({
//                        'path': objectName+'.'+p,
//                        'vendorPath': mapperData.vendorPath,
//                        'configuration':mapperData.configuration
//                    });
//                }
//                else {
                    objectTransformation.fields.push({
                        'path': mapperData.actualVendorPath,
                        'vendorPath': mapperData.actualVendorPath
                    });
//                }
            }
            else
            {
                var newObjectName = mapperData.vendorPath;
                if(me._cloudElementsUtils.isEmpty(objectName)) {
                    newObjectName = objectName+'.'+mapperData.vendorPath;
                }
                this._constructDeeperTransformation(objectTransformation, mapperData,newObjectName);
            }
        }
    },

    _constructTransformation: function(selectedInstance, transformationArray, vendorName, metaData) {
        var me = this;

        var objectTransformation = {
            'vendorName':  vendorName,
            //For setting ignore unmapped, only the ones which are selected will be returned
            'configuration':[
                {
                    "type": "passThrough",
                    "properties": {
                        "fromVendor": false,
                        "toVendor": false
                    }
                }
            ],
            fields:[]
        };
        me._constructDeeperTransformation(objectTransformation, metaData, null, vendorName);
        transformationArray[vendorName]=objectTransformation;
    },

    _constructAndSaveObjectTransformation: function(selectedInstance) {
        var me = this;

        var mData = me.all[selectedInstance.element.key].metadata;
        var objectsAndTrans = me.all[selectedInstance.element.key].objectsAndTrans;
        var mKeys = Object.keys(mData);

        var transformationArray = new Object;

        for (var i = 0; i < mKeys.length; i++) {

            if (objectsAndTrans[mKeys[i]] ==false
                && me._anyFieldSelected(mData[mKeys[i]]) == false) {
                continue;
            }

            me._constructTransformation(selectedInstance, transformationArray, mKeys[i], mData[mKeys[i]]);
        }

        var transformationSaveCounter = 0;
        return me._saveTransformationFromArray(selectedInstance, transformationArray, transformationSaveCounter);
    },

    _saveTransformationFromArray: function(selectedInstance, transformationArray, transformationSaveCounter, useMethodType) {
        var me = this;

        var keys = Object.keys(transformationArray);
        var key = keys[transformationSaveCounter];

        if(me._cloudElementsUtils.isEmpty(key))
            return;

        var methodType = 'POST';

        var trans = me.all[selectedInstance.element.key].transformations;

        if (!me._cloudElementsUtils.isEmpty(trans)
            && !me._cloudElementsUtils.isEmpty(trans[key]))
        {
            methodType = 'PUT';
        }

        if(!me._cloudElementsUtils.isEmpty(useMethodType)) {
            methodType = useMethodType;
        }

        transformationSaveCounter++;


        return me._elementsService.saveObjectTransformation(selectedInstance,
            key, transformationArray[key], 'instance', methodType)
            .then(
                this._handleOnSaveTransformation.bind(this, selectedInstance, transformationArray, transformationSaveCounter),
                this._handleOnSaveTransformationError.bind(this, selectedInstance, transformationArray, transformationSaveCounter) );
    },

    _handleOnSaveTransformationError: function(selectedInstance, transformationArray, transformationSaveCounter, error) {
        var me = this;
        transformationSaveCounter--;

        if(error.status == 404) { //in this scenario it might be a PUT, but expecting a POST, so change this and make a POST call again
            return me._saveTransformationFromArray(selectedInstance, transformationArray, transformationSaveCounter, 'POST');
        }
        else if(error.status == 409) { //In this case a transformation might have already been present so make a PUT call
            return me._saveTransformationFromArray(selectedInstance, transformationArray, transformationSaveCounter, 'PUT');
        }
        else {
            this._notifications.notify(bulkloader.events.ERROR, error.data.message);
            return false;
        }
    },

    _handleOnSaveTransformation: function(selectedInstance, transformationArray, transformationSaveCounter, result) {
        var me = this;

        var keys = Object.keys(transformationArray);

        //Setting the saved transformation
        if(me._cloudElementsUtils.isEmpty(me.all[selectedInstance.element.key].transformations)) {
            me.all[selectedInstance.element.key].transformations = new Object();
        }
        var savedkey = keys[transformationSaveCounter - 1];
        me.all[selectedInstance.element.key].transformations[savedkey] = transformationArray[savedkey];


        //Save transformations once all the definitions are stored
        if(transformationSaveCounter == keys.length)
        {
            this._notifications.notify(bulkloader.events.TRANSFORMATION_SAVED);
            //return true;
        }
        else
        {
            return me._saveTransformationFromArray(selectedInstance, transformationArray, transformationSaveCounter);
        }
    }


});


/**
 * Picker Factory object creation
 *
 */
(function (){

    var DatalistObject = Class.extend({

        instance: new Datalist(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications','Picker', function(CloudElementsUtils, ElementsService, Notifications, Picker){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._picker = Picker;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Datalist',DatalistObject);
}());

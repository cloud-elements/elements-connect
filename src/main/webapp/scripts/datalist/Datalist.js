/**
 * Picker factor class as an helper to picker controller.
 *
 *
 * @author Ramana
 */


var Datalist = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,

    _objectMetadata: null,
    _objectMetadataFlat: null,

    //An Object which holds all the data at instance Level
    all: new Object,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
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

        me.loadInstanceTransformations(selectedInstance);
        me.loadInstanceDefinitions(selectedInstance);

        return this._elementsService.loadInstanceObjects(selectedInstance)
            .then(
            this._handleLoadIntanceObjects.bind(this, selectedInstance),
            this._handleLoadIntanceObjectError.bind(this) );
    },

    _handleLoadIntanceObjects:function(selectedInstance, result){
        var me = this;

        me.all[selectedInstance.element.key].objects = result.data;
        return result.data;
    },

    _handleLoadIntanceObjectError: function(result) {
        return "Error getting the discovery object";
    },

    //Based on the selected instance get all the object transformation
    loadInstanceTransformations: function(selectedInstance) {
        this._elementsService.loadInstanceTransformations(selectedInstance)
            .then(
            this._handleLoadInstanceTransformations.bind(this, selectedInstance),
            this._handleLoadError.bind(this) );
    },

    _handleLoadInstanceTransformations:function(selectedInstance,result){
        var me = this;
        me.all[selectedInstance.element.key].transformations = result.data;
    },

    //Based on the selected instance get all the instance definitions
    loadInstanceDefinitions: function(selectedInstance) {
        this._elementsService.loadAccountObjectDefinitions(selectedInstance)
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
                    var innerObjField = fieldParts.split('.')[0];
                    var newDeepInnerMetaData = this._getObjectInMetaData(newInnerMetaData, innerObjField);
                    if(this._cloudElementsUtils.isEmpty(newDeepInnerMetaData)) {
                        newDeepInnerMetaData = new Object;
                        newDeepInnerMetaData['vendorPath'] = innerObjField;
                        newDeepInnerMetaData['fields'] = [];
                        var t = 'object';
                        if(innerObjField.indexOf('[*]') !== -1) {
                            t = 'array';
                        }
                        newDeepInnerMetaData['type'] = t;
                        newInnerMetaData.fields.push(newDeepInnerMetaData);
                    }

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

    saveDefinitionAndTransformation: function(selectedInstance) {
        var me = this;

        //Construct the Object Definition and inner Object definitions
        //Save all the definitions at instance level
        var done = me._constructAndSaveObjectDefinition(selectedInstance);

        //Construct the transformation and save at instance level
        if(done == true) {
            ////Save transformation
            done = me._constructAndSaveObjectTransformation(selectedInstance);
        } else {
            //Might be an error, return an error from here
            //TODO Notify ERROR
        }

        return done;
    },

    _constructDefinition: function(definitionArray, objectName, mData) {
        var me = this;

        var objDefinition = {
            fields:[]
        };

        for(var i = 0; i < mData.fields.length; i++){
            var mapperData = mData.fields[i];

            if(me._cloudElementsUtils.isEmpty(mapperData.transform)
                || mapperData.transform == false) {
                continue;
            }

            if(me._cloudElementsUtils.isEmpty(mapperData.type))
                mapperData.type = 'string'; //this is dirty fix for setting a type value by default

            if(this._isLiteral(mapperData.type.toLowerCase())
                || this._isDateFormat(mapperData.type))
            {
                var t = mapperData.type;
                var p = mapperData.path;

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
                if(this._cloudElementsUtils.isUndefinedOrNull(name) || name.length == 0) {
                    name = mapperData.path
                }

                if(mapperData.type == 'array') {
                    name = name.replace('[*]', '');
                }

                this._constructDefinition(definitionArray, name, mapperData);

                var t = mapperData.vendorPath;
                var p = mapperData.path;
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

        definitionArray[objectName]=objDefinition;
    },

    _constructAndSaveObjectDefinition: function(selectedInstance) {
        var me = this;

        var mData = me.all[selectedInstance.element.key].metadata;
        var mKeys = Object.keys(mData);

        var definitionArray = new Object;
        for(var i=0; i< mKeys.length; i++) {
            me._constructDefinition(definitionArray, mKeys[i], mData[mKeys[i]]);
        }

        var definitionSaveCounter = 0;
        var defArraykeys = Object.keys(definitionArray);
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
            && !me._cloudElementsUtils.isEmpty(defs[key]))
        {
            methodType = 'PUT';
        }

        if(!me._cloudElementsUtils.isEmpty(useMethodType)) {
            methodType = useMethodType;
        }

        definitionSaveCounter++;

        return me._elementsService.saveObjectDefinition(key, definitionArray[key], 'account', methodType)
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
            return error;
        }
    },

    _handleOnSaveObjectDefinition: function(selectedInstance, definitionArray, definitionSaveCounter, result) {

        var me = this;

        var keys = Object.keys(definitionArray);
        //Save transformations once all the definitions are stored
        if(definitionSaveCounter == keys.length)
        {
            return true;
        }
        else
        {
            return me._saveDefinitionFromArray(selectedInstance, definitionArray, definitionSaveCounter);
        }
    },

    _constructDeeperTransformation: function(objectTransformation, objectMapperData, objectName) {

        if(objectMapperData.type == 'array') {
            objectName = objectName+'[*]';
        }

        for(var i = 0; i < objectMapperData.fields.length; i++){
            var mapperData = objectMapperData.fields[i];
            if(me._cloudElementsUtils.isEmpty(mapperData.transform)
                || mapperData.transform == false) {
                continue;
            }

            var mapperType = mapperData.type.toLowerCase();

            if(this._isLiteral(mapperType))
            {
                var p = mapperData.path;
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
                this._constructDeeperTransformation(objectTransformation, mapperData, objectName+'.'+mapperData.path)
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

        for(var i = 0; i < metaData.fields.length; i++){
            var mapperData = metaData.fields[i];

            if(me._cloudElementsUtils.isEmpty(mapperData.transform)
                || mapperData.transform == false) {
                continue;
            }

            if(this._isLiteral(mapperData.type.toLowerCase())
                || this._isDateFormat(mapperData.type))
            {
                var p = mapperData.path;
                if(this._isLiteralArray(mapperData.type)) {
                    p = p+'[*]';
                }

                //TODO Handle for dates
//                if(!this._cloudElementsUtils.isEmpty(mapperData.configuration)) {
//                    objectTransformation.fields.push({
//                        'path': p,
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
                this._constructDeeperTransformation(objectTransformation, mapperData, mapperData.path)
            }
        }
    },

    _constructAndSaveObjectTransformation: function(selectedInstance) {
        var me = this;

        var mData = me.all[selectedInstance.element.key].metadata;
        var mKeys = Object.keys(mData);

        var transformationArray = new Object;

        for(var i=0; i< mKeys.length; i++) {
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


        return me._datamapperService.saveObjectTransformation(selectedInstance,
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
            return false;
        }
    },

    _handleOnSaveTransformation: function(selectedInstance, transformationArray, transformationSaveCounter, result) {
        var me = this;

        var keys = Object.keys(transformationArray);
        //Save transformations once all the definitions are stored
        if(transformationSaveCounter == keys.length)
        {
            return true;
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
        $get:['CloudElementsUtils', 'ElementsService','Notifications',function(CloudElementsUtils, ElementsService, Notifications){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Datalist',DatalistObject);
}());

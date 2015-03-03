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

        var selectedInstance = angular.fromJson(selectedInstance);

        return this._elementsService.loadInstanceObjects(selectedInstance)
            .then(
            this._handleLoadIntanceObjects.bind(this),
            this._handleLoadIntanceObjectError.bind(this) );
    },

    _handleLoadIntanceObjects:function(result){
        return result.data;
    },

    _handleLoadIntanceObjectError: function(result) {
        return "Error getting the discovery object";
    },

    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Load selected Object metadata
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    loadObjectMetaData:function(selectedInstance, selectedObject){

        return this._elementsService.loadObjectMetaData(selectedInstance, selectedObject.select    )
            .then(
            this._handleLoadeObjectMetadata.bind(this),
            this._handleLoadErrorObjectMetadata.bind(this) );
    },

    _handleLoadErrorObjectMetadata: function(result) {
        return "Error getting the discovery object";
    },

    _handleLoadeObjectMetadata:function(result){
        var me = this;
        me._objectMetadata = result.data;

        me._objectMetadataFlat = new Object;
        angular.copy(me._objectMetadata, me._objectMetadataFlat);

        me._restructureObjectMetadata();

        return me._objectMetadata;
    },


    _restructureObjectMetadata: function() {

        if(this._cloudElementsUtils.isUndefinedOrNull(this._objectMetadata)
            || this._cloudElementsUtils.isUndefinedOrNull(this._objectMetadata.fields)) {
            return;
        }

        for(var i=0; i < this._objectMetadata.fields.length; i++) {
            var field = this._objectMetadata.fields[i];

            if(field.vendorPath.indexOf('.') !== -1) {


                var fieldParts = field.vendorPath.split('.').slice(1).join('.');
                var objField = field.vendorPath.split('.')[0];

                var newInnerMetaData = this._getObjectInMetaData(this._objectMetadata, objField);
                if(this._cloudElementsUtils.isUndefinedOrNull(newInnerMetaData)) {
                    newInnerMetaData = new Object;
                    newInnerMetaData['vendorPath'] = objField;
//                    newInnerMetaData['type'] = 'object';
                    newInnerMetaData['fields'] = [];
                    var t = 'object';
                    if(objField.indexOf('[*]') !== -1) {
                        t = 'array';
                    }
                    newInnerMetaData['type'] = t;

                    this._objectMetadata.fields.push(newInnerMetaData);
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
                    if(this._cloudElementsUtils.isUndefinedOrNull(newDeepInnerMetaData)) {
                        newDeepInnerMetaData = new Object;
                        newDeepInnerMetaData['vendorPath'] = innerObjField;
//                        newDeepInnerMetaData['type'] = 'object';
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

        this._objectMetadata.fields = this._objectMetadata.fields
            .filter(function (field) {
                return field.vendorPath.indexOf('.') === -1;
            });
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

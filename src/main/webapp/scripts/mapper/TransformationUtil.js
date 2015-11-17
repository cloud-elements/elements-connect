/**
 * Transformation factor class as an helper to Mapper factor class
 * @author Ramana
 */


var TransformationUtil = Class.extend({
    _cloudElementsUtils: null,
    _objectMetadata: null,
    _objectMetadataFlat: null,

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
            || type == "Vendor date format") {
            return true;
        }
        return false;
    },

    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Construct and Save Definitions
    // Construct and Save transformations
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------

    getAllDefinitions: function(selectedInstance, sourceInstance) {
        var me = this;

        var mData = me.all[selectedInstance.element.key].metamapping;
        var mKeys = Object.keys(mData);
        var definitionArray = new Object;
        for(var i = 0; i < mKeys.length; i++) {
            me._addToDefinition(definitionArray, mKeys[i], mData[mKeys[i]]);
        }

        return definitionArray;
    },

    _findDefinition: function(definitionArray, objectName, p, currentDefinition) {
        var me = this;

        var pArray = p.split('.');

        var name = objectName;
        var objectDefinition = null;
        for(var i = 0; i < pArray.length - 1; i++) {
            var pathStep = pArray[i];
            name = name + '_' + pathStep;

            if(me._cloudElementsUtils.isEmpty(definitionArray[name])) {
                var objDef = {
                    fields: []
                };
                definitionArray[name] = objDef;
                objectDefinition = objDef;

                currentDefinition.fields.push({
                    'path': pathStep,
                    'type': name
                });

                currentDefinition = objectDefinition;

            } else {
                objectDefinition = definitionArray[name];
                currentDefinition = objectDefinition;
            }
        }

        return objectDefinition;
    },

    _addToDefinition: function(definitionArray, objectName, mData, objDefinition) {
        var me = this;

        if(objDefinition == null) {
            objDefinition = {
                fields: []
            };

            if(me._cloudElementsUtils.isEmpty(definitionArray[objectName])) {
                definitionArray[objectName] = objDefinition;
            } else {
                objDefinition = definitionArray[objectName];
            }

        }

        for(var i = 0; i < mData.fields.length; i++) {
            var mapperData = mData.fields[i];

            if(me._cloudElementsUtils.isEmpty(mapperData.type)) {
                mapperData.type = 'string'; //this is dirty fix for setting a type value by default
            }

            if(this._isLiteral(mapperData.type.toLowerCase())
                || me._isDateFormat(mapperData.type)) {
                var t = mapperData.type;
                var p = mapperData.path;

                if(this._isDateFormat(t)) {
                    t = 'date';
                }

                if(!this._cloudElementsUtils.isEmpty(p) && p.indexOf('.') > 0) {
                    var objDef = me._findDefinition(definitionArray, objectName, p, objDefinition);
                    var pArray = p.split('.');
                    objDef.fields.push({
                        'path': pArray[pArray.length - 1],
                        'type': t
                    });
                }
                else if(!this._cloudElementsUtils.isEmpty(p)) {
                    objDefinition.fields.push({
                        'path': p,
                        'type': t
                    });
                }
            }
            else {
                me._addToDefinition(definitionArray, objectName, mapperData);
            }
        }
    },

    getAllTransformations: function(selectedInstance, sourceInstance) {
        var me = this;

        var mData = me.all[selectedInstance.element.key].metamapping;
        var mKeys = Object.keys(mData);
        var transformationArray = new Object;
        for(var i = 0; i < mKeys.length; i++) {
            me._constructTransformation(selectedInstance, transformationArray, mKeys[i], mData[mKeys[i]].vendorName, mData[mKeys[i]]);
        }

        //Filter transformations for empty fields
        var fileteredArray = me._filterTransformationsForEmpty(transformationArray);

        return fileteredArray;
    },

    _constructDeeperTransformation: function(objectTransformation, objectMapperData, objectName) {

        var me = this;

        if(objectMapperData.type == 'array') {
            objectName = objectName + '[*]';
        }

        for(var i = 0; i < objectMapperData.fields.length; i++) {
            var mapperData = objectMapperData.fields[i];
            var mapperType = mapperData.type.toLowerCase();

            if(this._isLiteral(mapperType)
                || this._isDateFormat(mapperData.type)) {
                var p = mapperData.vendorPath;
                if(this._isLiteralArray(mapperData.type)) {
                    p = p + '[*]';
                }

                if(!me._cloudElementsUtils.isEmpty(mapperData.path)) {
                    var vp = mapperData.vendorPath;
                    if(!me._cloudElementsUtils.isEmpty(objectName)) {
                        vp = objectName + '.' + vp;
                    }

                    if(!me._cloudElementsUtils.isEmpty(mapperData.configuration)) {
                        objectTransformation.fields.push({
                            'path': mapperData.path,
                            'vendorPath': vp,
                            'configuration': mapperData.configuration
                        });
                    } else {
                        objectTransformation.fields.push({
                            'path': mapperData.path,
                            'vendorPath': vp
                        });
                    }
                }
            }
            else {
                var newObjectName = mapperData.vendorPath;
                if(!me._cloudElementsUtils.isEmpty(objectName)) {
                    newObjectName = objectName + '.' + mapperData.vendorPath;
                }
                this._constructDeeperTransformation(objectTransformation, mapperData, newObjectName);
            }
        }
    },

    _constructTransformation: function(selectedInstance, transformationArray, name, vendorName, metaData) {
        var me = this;

        var objectTransformation = {
            'vendorName': vendorName,
            //For setting ignore unmapped, only the ones which are mapped will be returned
            'configuration': [
                {
                    "type": "passThrough",
                    "properties": {
                        "fromVendor": false,
                        "toVendor": false
                    }
                }
            ],
            fields: []
        };

        if(!me._cloudElementsUtils.isEmpty(metaData.script)) {
            objectTransformation['script'] = metaData.script;
        }

        me._constructDeeperTransformation(objectTransformation, metaData);
        transformationArray[name] = objectTransformation;
    },

    _filterTransformationsForEmpty: function(transformationArray) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(transformationArray)) {
            return transformationArray;
        }

        var tKeys = Object.keys(transformationArray);

        var fileteredArray = new Object;
        for(var i = 0; i < tKeys.length; i++) {
            var tkey = tKeys[i];
            var tObj = transformationArray[tkey];
            if(me._cloudElementsUtils.isEmpty(tObj.fields)
                || tObj.fields.length == 0) {
                continue;
            }

            fileteredArray[tkey] = tObj;
        }

        return fileteredArray;
    },

    getDefinitionsForSource: function(selectedInstance, sourceInstance, definitionArray) {
        var me = this;

        //Check to see if bidirectional is enabled and handle for those objects

        var mData = me.all[selectedInstance.element.key].metamapping;
        var mKeys = Object.keys(mData);
        var sourceDefinitionArray = new Object;

        for(var i = 0; i < mKeys.length; i++) {
            var mapping = mData[mKeys[i]];
            if(mapping.bidirectional == true) {
                var objectName = mKeys[i];
                var newobjName = me._sourceObjectName(objectName, selectedInstance);
                //get all definitions for the objectName
                sourceDefinitionArray = me._getDefinitionsStartingWith(definitionArray, objectName, newobjName, sourceDefinitionArray);
            }
        }

        return sourceDefinitionArray;
    },

    _getDefinitionsStartingWith: function(definitionArray, objName, newobjName, sourceDefinitionArray) {
        var me = this;
        var dKeys = Object.keys(definitionArray);
        for(var i = 0; i < dKeys.length; i++) {
            if(dKeys[i].indexOf(objName) > -1) {
                var finalNewObj = dKeys[i].replace(objName, newobjName);
                //By doing this converting JSON to string and replacing any types of
                // objectnames which are present to the new object name
                var defStr = JSON.stringify(definitionArray[dKeys[i]]);
                defStr = defStr.replace(objName, finalNewObj);
                sourceDefinitionArray[finalNewObj] = JSON.parse(defStr);
            }
        }

        return sourceDefinitionArray;
    },

    getTransformationsForSource: function(selectedInstance, sourceInstance, transformationArray) {
        var me = this;

        //Check to see if bidirectional is enabled and handle for those objects

        var mData = me.all[selectedInstance.element.key].metamapping;
        var mKeys = Object.keys(mData);
        var sourceTransformationArray = new Object;

        for(var i = 0; i < mKeys.length; i++) {
            var mapping = mData[mKeys[i]];
            if(mapping.bidirectional == true) {
                var objectName = mKeys[i];
                var newobjName = me._sourceObjectName(objectName, selectedInstance);
                sourceTransformationArray[newobjName]  = transformationArray[objectName];
            }
        }

        return sourceTransformationArray;
    },

    _sourceObjectName: function(objectName, selectedInstance) {
        var me =  this;
        var o = objectName.split('_');
        return selectedInstance.element.key + '_' + o[2] + '_' + o[1];
    }
});

/**
 * TransformationUtil Factory object creation
 *
 */
(function() {

    var TransformationUtilObject = Class.extend({

        instance: new TransformationUtil(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', function(CloudElementsUtils) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('TransformationUtil', TransformationUtilObject);
}());

/**
 * FormulaInstanceController controller for working with formula instances
 * @author jjwyse
 */
var FormulaInstanceController = BaseController.extend({
    _notifications: null,
    _cloudElementsUtils: null,
    _elementsService: null,
    _formulaInstance: null,
    _picker: null,
    _application: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,
    init: function($scope, CloudElementsUtils, ElementsService, Picker, FormulaInstance, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog, Mapper, Application) {
        var me = this;
        me._notifications = Notifications;
        me._elementsService = ElementsService;
        me._cloudElementsUtils = CloudElementsUtils;
        me._formulaInstance = FormulaInstance;
        me._picker = Picker;
        me.$modal = $modal;
        me.$mdDialog = $mdDialog;
        me.$window = $window;
        me._maskLoader = MaskLoader;
        me.$location = $location;
        me._super($scope);


    },
    defineScope: function() {
        var me = this;
        // model that will be populated in the UI
        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.save = me.save.bind(this);
        me.$scope.formulaInstanceData = me._parseDefaults(me._formulaInstance.formulaTemplate);
        me.$scope.formulaName = me._formulaInstance.formulaTemplate.name;
        me.$scope.formulaConfiguration = me._formulaInstance.formulaTemplate.configuration;



        me._getExistingFormulaInstances().then(
            me._getOptions.bind(me, me._formulaInstance.formulaTemplate.configuration)
        );


    },
    defineListeners: function() {
        var me = this;
    },

    destroy: function() {
        var me = this;
    },

    _handleLoadError: function(error) {
        // ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    cancel: function() {
        var me = this;
        me._formulaInstance.closeModal();
    },

    save: function() {
        var me = this;

        me._maskLoader.show(me.$scope, 'Creating formula instance...');
        var formulaInstanceName = me.$scope.formulaName + "-instance";

        // Adding new variables to handle the processing of secondary key form application JSON.
        var secondaryKey = '';
        var secondaryValue = '';
        var formulaInstanceDataLength = Object.keys(me.$scope.formulaInstanceData).length;

        for(var i = 0; i < formulaInstanceDataLength; i++){
            if(typeof me.$scope.formulaInstanceData[me.$scope.formulaConfiguration[i].key] == 'object'){
                var obj = me.$scope.formulaInstanceData[me.$scope.formulaConfiguration[i].key];
                var displayFieldKey = me.$scope.formulaConfiguration[i].properties.displayField;
                var valueFieldKey = me.$scope.formulaConfiguration[i].properties.valueField;

                /* Change for multi-select drop-down.
                 * Drop-down will return an object in response to multiple selected values.
                 * Extract the values from the object and create a single comma separated string to use it as
                 * config variable in the formula.
                 */

                if(obj.length != null){
                    //It is a multi-select response as an array.
                    formulaInstanceName = obj[0][displayFieldKey];
                    var objectList = "";
                    for(var j = 0; j < obj.length; j++) {
                        objectList = objectList.concat(obj[j].name);
                        if(j != obj.length-1){
                            objectList = objectList.concat(",");
                        }
                    }
                    me.$scope.formulaInstanceData[me.$scope.formulaConfiguration[i].key] = objectList;
                }
                else {
                    formulaInstanceName = obj[displayFieldKey];
                    me.$scope.formulaInstanceData[me.$scope.formulaConfiguration[i].key] = obj[valueFieldKey];

                    /* If 'secondaryKey' parameter is present in application JSON, then store the key-value for specific
                     * config variable in a temporary variable to assign later, after for-loop ends
                     */
                    if (typeof me.$scope.formulaConfiguration[i].secondaryKey == 'string'){
                        secondaryKey = me.$scope.formulaConfiguration[i].secondaryKey;
                        secondaryValue = obj[displayFieldKey];
                    }
                }
            }
        }

        /*
         * Check if  variable secondaryKey was assigned some value, then add a new config variable for instance creation
         */
        if(secondaryKey != ''){
            me.$scope.formulaInstanceData[secondaryKey] = secondaryValue;
        }

        me._formulaInstance.createFormulaInstance(formulaInstanceName, me.$scope.formulaName,me.$scope.formulaInstanceData).
            then(me._handleFormulaInstanceSaved.bind(me));

    },

    _parseDefaults: function(formulaTemplate) {
        var defaultConfiguration = {};
        if(formulaTemplate && formulaTemplate.configuration) {
            for(var i = 0; i < formulaTemplate.configuration.length; i++) {
                var configuration = formulaTemplate.configuration[i];
                defaultConfiguration[configuration.key] = configuration.defaultValue;
            }
        }
        return defaultConfiguration;
    },

    _getExistingFormulaInstances: function() {
        var me = this;
        return me._elementsService.findFormulaInstances(me._formulaInstance.formulaTemplate.id).then(
            me._handleLoadFormulaInstances.bind(me),
            me._handleLoadError.bind(me));
    },

    _handleLoadFormulaInstances: function(httpResult) {
        var me = this;

        me._formulaInstances = httpResult.data;
    },

    _getOptions: function(configs) {
        var me = this;
        for(var i = 0; i < configs.length; i++) {
            if(configs[i].properties && configs[i].properties.path){
                var instance;
                if(configs[i].properties.instance === me._picker.selectedElementInstance.element.key) {
                    instance = me._picker.selectedElementInstance;
                }else if(configs[i].properties.instance === me._picker.targetElementInstance.element.key){
                    instance = me._picker.targetElementInstance;
                }
                me._maskLoader.show(me.$scope, 'Loading...');
                me._elementsService.findFormulaConfigOpts(configs[i].properties.path, instance).
                    then(me._handleGetOpts.bind(me, i));
            }
            /*
             * Added ELSE block for Static Lists (multiple/single select) while creating formula instance.
             * The options would be present in the Application JSON.
             */
            else if(configs[i].properties && configs[i].properties.options){
                var staticOptions = configs[i].properties.options;
                me._handleGetOpts.bind(me, staticOptions);
            }
        }
    },

    _handleFormulaInstanceSaved: function() {
        var me = this;
        me._maskLoader.hide();
        me._formulaInstance.closeModal();
    },


    _handleGetOpts: function(indx, httpResult) {
        var me = this;
        me._maskLoader.hide();
        var formulaInstanceConfigKey = me.$scope.formulaConfiguration[indx].key;
        var optionKey = me.$scope.formulaConfiguration[indx].properties.valueField;
        if (!formulaInstanceConfigKey || !optionKey) {
            me.$scope.formulaConfiguration[indx].properties.options = httpResult.data;
            return;
        }
        var options = [];
        for (var i = 0;i < httpResult.data.length;i++) {
            var option = httpResult.data[i];
            var optionKeyValue = option[optionKey];
            var alreadyExists = false;
            for (var j = 0;j < me._formulaInstances.length;j++) {
                var formulaInstanceConfig = me._formulaInstances[j].configuration;
                var formulaInstanceConfigKeyValue = formulaInstanceConfig[formulaInstanceConfigKey];
                if (formulaInstanceConfigKeyValue === optionKeyValue) {
                    alreadyExists = true;
                    break;
                }
            }
            if (!alreadyExists) {
                options.push(httpResult.data[i]);
            }
        }
        me.$scope.formulaConfiguration[indx].properties.options = options;
    }
});

FormulaInstanceController.$inject = ['$scope', 'CloudElementsUtils', 'ElementsService', 'Picker', 'FormulaInstance', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog', 'Mapper', 'Application'];

angular.module('bulkloaderApp')
    .controller('FormulaInstanceController', FormulaInstanceController);
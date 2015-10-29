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
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init: function($scope, CloudElementsUtils, ElementsService, Picker, FormulaInstance, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog) {
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

        me._getOptions(me._formulaInstance.formulaTemplate.configuration);
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
        for(var i = 0; i < Object.keys(me.$scope.formulaInstanceData).length; i++){
            if(typeof me.$scope.formulaInstanceData[me.$scope.formulaConfiguration[i].key] == 'object'){
                var obj = me.$scope.formulaInstanceData[me.$scope.formulaConfiguration[i].key];
                var displayFieldKey = me.$scope.formulaConfiguration[i].properties.displayField;
                var valueFieldKey = me.$scope.formulaConfiguration[i].properties.valueField;
                formulaInstanceName = obj[displayFieldKey];
                me.$scope.formulaInstanceData[me.$scope.formulaConfiguration[i].key] = obj[valueFieldKey];
            }
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
        me.$scope.formulaConfiguration[indx].properties.options = httpResult.data;
    }
});

FormulaInstanceController.$inject = ['$scope', 'CloudElementsUtils', 'ElementsService', 'Picker', 'FormulaInstance', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('FormulaInstanceController', FormulaInstanceController);

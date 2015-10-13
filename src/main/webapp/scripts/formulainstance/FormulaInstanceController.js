/**
 * FormulaInstanceController controller for working with formula instances
 * @author jjwyse
 */
var FormulaInstanceController = BaseController.extend({
    _notifications: null,
    _cloudElementsUtils: null,
    _formulaInstance: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init: function($scope, CloudElementsUtils, FormulaInstance, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._formulaInstance = FormulaInstance;
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
    },

    defineListeners: function() {
        var me = this;
    },

    destroy: function() {
        var me = this;
    },

    cancel: function() {
        var me = this;
        me._formulaInstance.closeModal();
    },

    save: function() {
        var me = this;
        me._maskLoader.show(me.$scope, 'Creating formula instance...');
        var formulaInstanceName = me.$scope.formulaName + "-instance";
        me._formulaInstance.createFormulaInstance(formulaInstanceName, me.$scope.formulaInstanceData).
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

    _handleFormulaInstanceSaved: function() {
        var me = this;
        me._maskLoader.hide();
        me._formulaInstance.closeModal();
    }
});

FormulaInstanceController.$inject = ['$scope', 'CloudElementsUtils', 'FormulaInstance', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('FormulaInstanceController', FormulaInstanceController);

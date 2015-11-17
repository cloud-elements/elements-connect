/**
 * FormulaInstance factor class as an helper to the FormulaInstanceController controller
 * @author jjwyse
 */
var FormulaInstance = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _openedModal: null,
    _mdDialog: null,
    _formula: null,
    formulaTemplate: null,
    _picker: null,

    _handleLoadError: function(error) {
        // ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    openCreateFormulaInstance: function(formulaTemplate) {
        var me = this;

        me.formulaTemplate = formulaTemplate;

        me.closeModal();
        me._openedModal = me.$modal.open({
            templateUrl: 'createformulainstance.html',
            controller: 'FormulaInstanceController',
            windowClass: 'bulkloaderModalWindow',
            backdropClass: 'bulkloaderModalbackdrop',
            backdrop: 'static'
        });
    },

    closeModal: function() {
        var me = this;
        if(!me._cloudElementsUtils.isEmpty(me._openedModal)) {
            me._openedModal.close();
        }
        me._openedModal = null;
    },

    createFormulaInstance: function(formulaInstanceName, formulaName, formulaInstanceConfiguration) {
        var me = this;
        return me._elementsService.createFormulaInstance(me.formulaTemplate.id, formulaInstanceName, formulaName, formulaInstanceConfiguration).then(
            me._formula.handleOnCreateFormulaInstance.bind(me._formula, me.formulaTemplate.name),
            me._formula.handleOnCreateFormulaInstanceError.bind(me._formula));
    }
});

/**
 * Formula instance factory object creation
 */
(function() {

    var FormulaInstanceObject = Class.extend({

        instance: new FormulaInstance(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Picker', 'Formula', 'Notifications', '$modal', '$mdDialog', function(CloudElementsUtils, ElementsService, Picker, Formula, Notifications, $modal, $mdDialog) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._picker = Picker;
            this.instance._formula = Formula;
            this.instance.$modal = $modal;
            this.instance.$mdDialog = $mdDialog;

            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('FormulaInstance', FormulaInstanceObject);
}());

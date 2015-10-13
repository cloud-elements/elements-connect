/**
 * Formula factor class as a helper to the Formula controller
 * @author jjwyse
 */

bulkloader.events.NEW_FORMULA_INSTANCE_CREATED = 'NEW_FORMULA_INSTANCE_CREATED';

var Formula = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _application: null,
    _allElements: null,
    _openedModal: null,
    formulaTemplate: null,
    _formulaInstances: null,

    _handleLoadError: function(error) {
        // ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    loadFormulaTemplates: function() {
        var me = this;

        return me._elementsService.loadFormulaTemplates().then(
            me._handleLoadFormulaTemplates.bind(me),
            me._handleLoadError.bind(me));
    },

    _handleLoadFormulaTemplates: function(httpResult) {
        return httpResult.data;
    },

    handleOnCreateFormulaInstance: function(formulaName, httpResult) {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me._formulaInstances)) {
            me._formulaInstances = {};
        }
        // adding the newly created formula instance to _formulaInstances
        me._formulaInstances[formulaName] = httpResult.data;

        // notifying for new formula instance creation
        me._notifications.notify(bulkloader.events.NEW_FORMULA_INSTANCE_CREATED);

        return httpResult.data;
    },

    handleOnCreateFormulaInstanceError: function(httpResult) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, 'Formula instance creation failed. ' + httpResult.data.message);
    }
});

/**
 * Formula factory object creation
 */
(function() {

    var FormulaObject = Class.extend({

        instance: new Formula(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Notifications', 'Application', '$modal', function(CloudElementsUtils, ElementsService, Notifications, Application, $modal) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._application = Application;
            this.instance.$modal = $modal;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Formula', FormulaObject);
}());

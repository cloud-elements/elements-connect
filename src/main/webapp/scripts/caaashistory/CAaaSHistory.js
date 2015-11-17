/**
 * CAaaSHistory factor class as an helper to CAaaSHistory controller.
 *
 *
 * @author Ramana
 */

var CAaaSHistory = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _application: null,
    _allElements: null,

    _handleLoadError: function(error) {
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    getHistory: function() {
        var me = this;
        return me._elementsService.getCaaasHistory().then(
            me._handleGetHistorySucceeded.bind(me),
            me._handleGetHistoryFailed.bind(me));
    },

    _handleGetHistorySucceeded: function(result) {
        var me = this;

        if (!me._cloudElementsUtils.isEmpty(result.data)
            && result.data.length > 0) {

            return result.data;
        }

        return null;
    },

    _handleGetHistoryFailed: function(result) {
        var me = this;

    },

    getInstanceExecution: function(formulaId, instanceId){
        var me = this;
        return me._elementsService.getFormulaInstanceExecutions(formulaId, instanceId).then(
            me._handleGetInstanceExecution.bind(me),
            me._handleGetInstanceExecutionFailed.bind(me));
    },

    _handleGetInstanceExecution: function(results) {
        var me = this;
        return results.data;
    },

    _handleGetInstanceExecutionFailed: function(results) {
        var me = this;
    },

    getExecutionValues: function(formulaId, instanceId, executionId){
        var me = this;
        return me._elementsService.getInstanceExecutionValues(formulaId, instanceId, executionId).then(
            me._handleGeExecutionValues.bind(me),
            me._handleGeExecutionValuesFailed.bind(me));
    },

    _handleGeExecutionValues: function(results) {
        var me = this;
        return results.data;
    },

    _handleGeExecutionValuesFailed: function(results) {
        var me = this;
    }

});

/**
 * CAaaSHistory Factory object creation
 *
 */
(function() {

    var CAaaSHistoryObject = Class.extend({

        instance: new CAaaSHistory(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Notifications', 'Application', function(CloudElementsUtils, ElementsService, Notifications, Application) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._application = Application;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('CAaaSHistory', CAaaSHistoryObject);
}());
/**
 * Workflow factor class as a helper to the Workflow controller
 * @author jjwyse
 */
var Workflow = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _application: null,
    _allElements: null,
    _openedModal: null,
    workflowTemplate: null,
    _workflowInstances: null,

    _handleLoadError: function(error) {
        // ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    loadWorkflowTemplates: function() {
        var me = this;

        return me._elementsService.loadWorkflowTemplates().then(
            me._handleLoadWorkflowTemplates.bind(me),
            me._handleLoadError.bind(me));
    },

    _handleLoadWorkflowTemplates: function(httpResult) {
        return httpResult.data;
    },

    handleOnCreateWorkflowInstance: function(workflowName, httpResult) {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me._workflowInstances)) {
            me._workflowInstances = {};
        }
        // adding the newly created workflow instance to _workflowInstances
        me._workflowInstances[workflowName] = httpResult.data;

        // TODO - JJW
        alert("Successfully created " + workflowName + " instance");

        return httpResult.data;
    },

    handleOnCreateWorkflowInstanceError: function(httpResult) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, 'Workflow instance creation failed. ' + httpResult.data.message);
    }
});

/**
 * Workflow factory object creation
 */
(function() {

    var WorkflowObject = Class.extend({

        instance: new Workflow(),

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
        .provider('Workflow', WorkflowObject);
}());
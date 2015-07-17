/**
 * WorkflowInstance factor class as an helper to the WorkflowInstanceController controller
 * @author jjwyse
 */
var WorkflowInstance = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _openedModal: null,
    _mdDialog: null,
    _workflow: null,
    workflowTemplate: null,

    _handleLoadError: function(error) {
        // ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    openCreateWorkflowInstance: function(workflowTemplate) {
        var me = this;

        me.workflowTemplate = workflowTemplate;

        me.closeModal();
        me._openedModal = me.$modal.open({
            templateUrl: 'createworkflowinstance.html',
            controller: 'WorkflowInstanceController',
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

    createWorkflowInstance: function(workflowInstanceName, workflowInstanceConfiguration) {
        var me = this;
        return me._elementsService.createWorkflowInstance(me.workflowTemplate.id, workflowInstanceName, workflowInstanceConfiguration).then(
            me._workflow.handleOnCreateWorkflowInstance.bind(me._workflow, me.workflowTemplate.name),
            me._workflow.handleOnCreateWorkflowInstanceError.bind(me._workflow));
    }
});

/**
 * Workflow instance factory object creation
 */
(function() {

    var WorkflowInstanceObject = Class.extend({

        instance: new WorkflowInstance(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Workflow', 'Notifications', '$modal', '$mdDialog', function(CloudElementsUtils, ElementsService, Workflow, Notifications, $modal, $mdDialog) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._workflow = Workflow;
            this.instance.$modal = $modal;
            this.instance.$mdDialog = $mdDialog;

            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('WorkflowInstance', WorkflowInstanceObject);
}());



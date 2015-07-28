/**
 * WorkflowInstanceController controller for working with workflow instances
 * @author jjwyse
 */
var WorkflowInstanceController = BaseController.extend({
    _notifications: null,
    _cloudElementsUtils: null,
    _workflowInstance: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init: function($scope, CloudElementsUtils, WorkflowInstance, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._workflowInstance = WorkflowInstance;
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
        me.$scope.workflowInstanceData = me._parseDefaults(me._workflowInstance.workflowTemplate);
        me.$scope.workflowName = me._workflowInstance.workflowTemplate.name;
        me.$scope.workflowConfiguration = me._workflowInstance.workflowTemplate.configuration;
    },

    defineListeners: function() {
        var me = this;
    },

    destroy: function() {
        var me = this;
    },

    cancel: function() {
        var me = this;
        me._workflowInstance.closeModal();
    },

    save: function() {
        var me = this;
        me._maskLoader.show(me.$scope, 'Creating workflow instance...');
        var workflowInstanceName = me.$scope.workflowName + "-instance";
        me._workflowInstance.createWorkflowInstance(workflowInstanceName, me.$scope.workflowInstanceData).
            then(me._handleWorkflowInstanceSaved.bind(me));
    },

    _parseDefaults: function(workflowTemplate) {
        var defaultConfiguration = {};
        if(workflowTemplate && workflowTemplate.configuration) {
            for(var i = 0; i < workflowTemplate.configuration.length; i++) {
                var configuration = workflowTemplate.configuration[i];
                defaultConfiguration[configuration.key] = configuration.defaultValue;
            }
        }
        return defaultConfiguration;
    },

    _handleWorkflowInstanceSaved: function() {
        var me = this;
        me._maskLoader.hide();
        me._workflowInstance.closeModal();
    }
});

WorkflowInstanceController.$inject = ['$scope', 'CloudElementsUtils', 'WorkflowInstance', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('WorkflowInstanceController', WorkflowInstanceController);




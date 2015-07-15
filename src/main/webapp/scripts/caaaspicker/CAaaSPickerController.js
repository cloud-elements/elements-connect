/**
 * CAaaS picker controller for selection of the service.
 *
 * @author jjwyse
 */
var CAaaSPickerController = PickerController.extend({
    _caaasPicker: null,

    init: function($scope, ElementsService, CloudElementsUtils, Picker, CAaaSPicker, Schedule, Credentials, Notifications, MaskLoader, CreateInstance, Login, JobHistory, Help, Application, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;
        me._super($scope, ElementsService, CloudElementsUtils, Picker, Schedule, Credentials, Notifications, MaskLoader, CreateInstance, Login, JobHistory, Help, Application, $window, $location, $interval, $filter, $route, $mdDialog);
        me._caaasPicker = CAaaSPicker;
        me._maskLoader.show(me.$scope, 'Loading...');
        me.checkKey();
    },

    defineScope: function() {
        var me = this;
        me._super();

        me.$scope.onCreateWorkflowInstances = me.onCreateWorkflowInstances.bind(me);
    },

    onCreateWorkflowInstances: function(sources, $event) {
        var me = this;
        var configuration = {};
        me._maskLoader.show(me.$scope, 'Creating workflow instances...');
        for(var i = 0; i < sources.length; i++) {
            var source = sources[i];
            var elementKey = source['elementKey'];
            var elementInstance = me._instances[elementKey];
            if(!elementInstance) {
                me._showWorkflowError(elementKey);
            }
            var instanceId = elementInstance['id'];
            if(!instanceId) {
                me._showWorkflowError(elementKey);
            }
            configuration[elementKey + '.instance.id'] = instanceId;
        }

        // create a workflow instance for each element instance
        for(i = 0; i < sources.length; i++) {
            source = sources[i];
            elementKey = source['elementKey'];

            // create the workflow instance if there is a workflow template tied to the source
            var workflowName = elementKey + "-workflow-instance";
            var workflowTemplateId = source['workflowTemplateId'];
            if(workflowTemplateId) {
                me._elementsService.createWorkflowInstance(workflowTemplateId, workflowName, configuration);
            }
        }

        me._maskLoader.hide();
    },

    _showWorkflowError: function(elementKey) {
        var me = this;
        var error = 'No instance found for element: ' + elementKey + '.  Please provision a ' + elementKey + ' element before attempting to move on.';
        var confirm = me.$mdDialog.alert()
            .title('Error')
            .content(error)
            .ok('OK');

        me._maskLoader.hide();
        me.$mdDialog.show(confirm);
    }
});

CAaaSPickerController.$inject = ['$scope', 'ElementsService', 'CloudElementsUtils', 'Picker', 'CAaaSPicker',
    'Schedule', 'Credentials', 'Notifications',
    'MaskLoader', 'CreateInstance', 'Login',
    'JobHistory', 'Help', 'Application',
    '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp').controller('CAaaSPickerController', CAaaSPickerController);

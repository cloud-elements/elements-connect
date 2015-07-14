/**
 * CAaaS picker controller for selection of the service.
 *
 * @author jjwyse
 */
var CAaaSPickerController = PickerController.extend({
    _caaasPicker: null,

    init: function($scope, CloudElementsUtils, Picker, CAaaSPicker, Schedule, Credentials, Notifications, MaskLoader, CreateInstance, Login, JobHistory, Help, Application, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;
        me._super($scope, CloudElementsUtils, Picker, Schedule, Credentials, Notifications, MaskLoader, CreateInstance, Login, JobHistory, Help, Application, $window, $location, $interval, $filter, $route, $mdDialog);
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
        console.log(JSON.stringify(configuration));
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

CAaaSPickerController.$inject = ['$scope', 'CloudElementsUtils', 'Picker', 'CAaaSPicker',
    'Schedule', 'Credentials', 'Notifications',
    'MaskLoader', 'CreateInstance', 'Login',
    'JobHistory', 'Help', 'Application',
    '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp').controller('CAaaSPickerController', CAaaSPickerController);

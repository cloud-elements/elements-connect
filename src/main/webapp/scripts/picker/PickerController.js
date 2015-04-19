/**
 * Picker controller for selection of the service.
 *
 *
 * @author Ramana
 */
bulkloader.events.VIEW_CHANGE_DATALIST = 'datalist';

var PickerController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _instances: null,
    _maskLoader: null,

    init:function($scope, CloudElementsUtils, Picker, Schedule, Notifications, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._schedule = Schedule;
        me.$window = $window;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);

        me._maskLoader.show(me.$scope, 'Loading Instances...');
        me._picker.loadConfiguration().then(me._handleConfigurationLoad.bind(me));
    },

    defineScope:function() {
        var me = this;
        // This is for transitions
        me.$scope.pageClass = 'page-picker';

        me.$scope.onSelect = me.onSelect.bind(me);
        me.$scope.onSelectSchedule = me.onSelectSchedule.bind(me);
        me.$scope.checkStatus = me.checkStatus.bind(me);

        // Add this class to show Target section
        me.$scope.withTarget = '';
        me.$scope.showTarget = false;
        me.$scope.showSelectTarget = false;
    },

    defineListeners:function() {
        var me = this;
        me._super();

        me._notifications.addEventListener(bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED, me._onInstancesRefresh.bind(me));
        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me));
    },

    checkStatus: function() {
        var me = this;

        var keys = Object.keys(me._instances);

        for(var i = 0; i < keys.length; i++) {
            console.log('Checking jobs for element instance ID: ' + me._instances[keys[i]].id + '...');
        }
    },

    _handleError: function(event, error) {

        var me = this;

        me._maskLoader.hide();

        var confirm = me.$mdDialog.alert()
            .title('Error')
            .content(error)
            .ok('OK');

        me.$mdDialog.show(confirm);
    },

    _onInstancesRefresh: function() {
        var me = this;

        me._instances = me._picker._elementInstances;

        if (bulkloader.Picker.oauthElementKey != me._picker.getTargetElementKey()) {
            me.onSelect(bulkloader.Picker.oauthElementKey);
        }

    },

    /*
    _addSources: function() {
        var me = this;

        if (me._cloudElementsUtils.isEmpty(me._picker.sources)) {
            return;
        }

        for (var i in me._picker.sources) {
            var source = me._picker.sources[i];
            var anchorElement = document.createElement('a');
            var textElement = document.createElement('i');

            angular.element(textElement)
                .attr('class', 'icon wait')
                .attr('ng-click', "onSelectSchedule('" + source.elementKey + "', $event)");

            angular.element(anchorElement)
                .attr('href', '')
                .attr('ng-click', "onSelect('" + source.elementKey + "')")
                .attr('id', source.elementKey)
                .attr('class', source.elementKey)
                .attr('alt', source.elementKey)
                .attr('data-instance', "Connect to " + source.elementKey)
                .text(textElement);
        }
    },
    */

    _handleConfigurationLoad: function(instances) {
        var me = this;
        me._maskLoader.hide();
        me._instances = instances;

        if (me._picker.isTargetHidden() == false) {
            me.showTarget = true;
        }

        if (!me._cloudElementsUtils.isEmpty(me._picker.getTargetElementKey())) {
            me.$scope.withTarget = 'show-target';

            if(!me._cloudElementsUtils.isEmpty(me._instances[me._picker.getTargetElementKey()])) {
                me.$scope.showSelectTarget = false;
            }
            else {
                me.$scope.showSelectTarget = true;
            }
        }

        if (!me._cloudElementsUtils.isEmpty(me._instances)) {
            var keys = Object.keys(me._instances);
            for(var i = 0; i< keys.length; i++) {
                angular.element(document.querySelector('#' + keys[i])).addClass('highlightingElement');
                angular.element(document.querySelector('#' + keys[i])).attr('data-instance', me._instances[keys[i]].name);
            }
        }
    },

    onSelect: function(elementKey) {
        var me = this;

        // Check if the target instance is created, if not inform user to create one
        if (me._picker.getTargetElementKey() != elementKey
            && me._cloudElementsUtils.isEmpty(me._instances[me._picker.getTargetElementKey()])) {

            var confirm = me.$mdDialog.alert()
                .title('Missing target')
                .content('Provision your target to proceed forward."')
                //.ariaLabel('Password notification')
                .ok('OK');

            me.$mdDialog.show(confirm);
            return;
        } else if (me._picker.getTargetElementKey() == elementKey &&
                   !me._cloudElementsUtils.isEmpty(me._instances[me._picker.getTargetElementKey()])) {
            return;
        }

        //Check to see if the element instance is created, if so then move the view to dataselect
        //If there is no instance, do the OAUTH flow and then land to the dataselect page
        if(me._cloudElementsUtils.isEmpty(me._instances) ||
            me._cloudElementsUtils.isEmpty(me._instances[elementKey])) {
            me._maskLoader.show(me.$scope, 'Creating Instance...');
            me._picker.getOAuthUrl(elementKey)
                .then(me._handleOnOAuthUrl.bind(me));
        } else {
            me._onElementInstanceSelect(me._instances[elementKey]);
        }
    },

    _handleOnOAuthUrl: function(oauthurl) {
        var me = this;
        me._maskLoader.hide();
        me.$window.open(oauthurl, '_blank');
    },

    _onElementInstanceSelect: function(instance) {
        var me = this;

        me._maskLoader.show(me.$scope, 'Loading Instance Data...');
        // Set the instance details to factory class to be used in datalist
        me._picker.selectedElementInstance = instance;

        //TODO Refer http://embed.plnkr.co/uW4v9T/preview for adding animation while switching the view
        if (me._cloudElementsUtils.isEmpty(me._picker.getTargetToken()) && !me._cloudElementsUtils.isEmpty(me._picker.getTargetElementKey())) {
            me._picker.targetElementInstance = me._instances[me._picker.getTargetElementKey()];
            me.$location.path('/mapper');
        } else {
            me.$location.path('/datalist');
        }

        //Notify about the VIEW Change
        me._notifications.notify(bulkloader.events.VIEW_CHANGE_DATALIST);
        me._maskLoader.hide();
    },

    onSelectSchedule: function(instance, $event){
        var me = this;
        event.preventDefault();
        event.stopPropagation();
//        me._maskLoader.show(me.$scope, 'Scheduling Job...');
        me._schedule.openSchedule();
    }


});

PickerController.$inject = ['$scope','CloudElementsUtils','Picker', 'Schedule', 'Notifications', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('PickerController', PickerController);

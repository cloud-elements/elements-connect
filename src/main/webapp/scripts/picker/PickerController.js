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
    _lastSelection: null,

    init:function($scope, CloudElementsUtils, Picker, Schedule, Notifications, MaskLoader, CreateInstance, Login, JobHistory, $window, $location, $interval, $filter, $route, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._schedule = Schedule;
        me._createinstance = CreateInstance;
        me._login = Login;
        me._jobhistory = JobHistory;
        me.$window = $window;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);

        me._maskLoader.show(me.$scope, 'Loading...');
        me.checkKey();
    },

    defineScope:function() {
        var me = this;
        // This is for transitions
        me.$scope.pageClass = 'page-picker';

        me.$scope.onSelect = me.onSelect.bind(me);
        me.$scope.onSelectSchedule = me.onSelectSchedule.bind(me);
        me.$scope.createInstance = me.createInstance.bind(me);
        me.$scope.checkStatus = me.checkStatus.bind(me);
        me.$scope.onJobHistory = me.onJobHistory.bind(me);

        // Add this class to show Target section
        me.$scope.withTarget = '';
        me.$scope.showTarget = false;
        me.$scope.showWait = false;
        me.$scope.showSelectTarget = false;

        me.$scope.targets = [];
        me.$scope.sources = [];
    },

    defineListeners:function() {
        var me = this;
        me._super();

        me._notifications.addEventListener(bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED, me._onInstancesRefresh.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.LOGIN_ENTERED, me.checkKey.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.SHOW_MASK, me.showMask.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.CONFIGURATION_LOAD, me._handleConfigurationLoad.bind(me), me.$scope.$id);
    },

    destroy:function(){
        var me = this;
        me._notifications.removeEventListener(bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED, me._onInstancesRefresh.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.LOGIN_ENTERED, me.checkKey.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.SHOW_MASK, me.showMask.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.CONFIGURATION_LOAD, me._handleConfigurationLoad.bind(me), me.$scope.$id);
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
        console.log('In error ' + me.$scope.$id);
        me._maskLoader.hide();

        var confirm = me.$mdDialog.alert()
            .title('Error')
            .content(error)
            .ok('OK');

        me.$mdDialog.show(confirm);
    },

    showMask: function(event, msg) {
        var me = this;
        me._maskLoader.show(me.$scope, msg.toString());
    },

    _onInstancesRefresh: function() {
        var me = this;
        me._maskLoader.hide();
        me._instances = me._picker._elementInstances;

        angular.element(document.querySelector('#' + bulkloader.Picker.oauthElementKey)).addClass('highlightingElement');
        angular.element(document.querySelector('#' + bulkloader.Picker.oauthElementKey)).attr('data-instance', me._instances[bulkloader.Picker.oauthElementKey].name);

        if(!me._cloudElementsUtils.isEmpty(bulkloader.Picker.oauthElementKey)) {
            me.onSelect(bulkloader.Picker.oauthElementKey, me._lastSelection);
        }
    },

    _handleConfigurationLoad: function(instances) {
        var me = this;
        me.$scope.sources = me._picker._sources;
        me.$scope.targets = me._picker._targets;

        if (me._picker.isTargetHidden() == false) {
            me.$scope.showTarget = true;
            me.$scope.withTarget = 'show-target';
        } else {
            me.$scope.withTarget = 'show-target dark-background';
        }

        if (me._picker.getView() == 'mapper') {
            me.$scope.showSelectTarget = true;
            me.$scope.showWait = false;
        } else {
            me.$scope.showSelectTarget = false;
            me.$scope.showWait = true;
        }


        me._maskLoader.hide();
        me._maskLoader.show(me.$scope, 'Loading Instances...');
        me._picker.loadElementInstances().then(me._handleInstancesLoad.bind(me));
    },

    _handleInstancesLoad: function(instances) {
        var me = this;
        me._maskLoader.hide();
        me._instances = instances;

        if (!me._cloudElementsUtils.isEmpty(me._instances)) {
            var keys = Object.keys(me._instances);
            for(var i = 0; i< keys.length; i++) {
                angular.element(document.querySelector('#' + keys[i])).addClass('highlightingElement');
                angular.element(document.querySelector('#' + keys[i])).attr('data-instance', me._instances[keys[i]].name);
            }
        }
    },

    onSelect: function(elementKey, selection) {
        var me = this;
        me._lastSelection = selection;
        //Check to see if the element instance is created, if so then move the view to dataselect
        //If there is no instance, do the OAUTH flow and then land to the dataselect page
        if(me._cloudElementsUtils.isEmpty(me._instances) ||
            me._cloudElementsUtils.isEmpty(me._instances[elementKey])) {

            var element = me._picker.getElementConfig(elementKey, selection);
            if(me._cloudElementsUtils.isEmpty(element.configs)) {

                me._maskLoader.show(me.$scope, 'Creating Instance...');

                me._picker.getOAuthUrl(elementKey, selection)
                    .then(me._handleOnOAuthUrl.bind(me));
            } else {
                me.createInstance(element, selection);
            }
        } else if(selection == 'source') {

            angular.element(document.querySelector('div.picker-source a.selectedTarget')).removeClass('selectedTarget');
            angular.element(document.querySelector('div.picker-source #' + elementKey)).addClass('selectedTarget');

            // Set the instance details to factory class to be used in datalist
            me._picker.selectedElementInstance = me._instances[elementKey];

            if (me._picker.getView() == 'datalist') {
                me._onElementInstanceSelect();
            }

        }
        else if(selection == 'target') {
            angular.element(document.querySelector('div.picker-target a.selectedTarget')).removeClass('selectedTarget');
            angular.element(document.querySelector('div.picker-target #' + elementKey)).addClass('selectedTarget');
            me._picker.setTargetElement(elementKey);
            me._picker.setTargetElementInstance(me._instances[elementKey]);

            if (me._picker.getView() == 'mapper') {

                // Check if the target instance is created, if not inform user to create one
                if(me._cloudElementsUtils.isEmpty(me._picker.selectedElementInstance)) {
                    var confirm = me.$mdDialog.alert()
                        .title('Missing Source')
                        .content('Select or Provision your source to proceed forward."')
                        .ok('OK');

                    me.$mdDialog.show(confirm);
                    return;
                }
            }

            me._onElementInstanceSelect();
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


        if (me._picker.getView() == 'mapper') {
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
        me._schedule.openSchedule();
    },

    createInstance: function(element, selection){
        var me = this;
        me._createinstance.openCreateInstance(element, selection);
    },

    checkKey: function(){
        var me = this;
        me._maskLoader.hide();

        if(me._picker.isSecretsPresent() == false) {
            if (me._picker.isAppKeyPresent() == false
                && me._picker.isKeyPresent() == false){
                me._login.openLogin();
                return
            } else if (me._picker.isAppKeyPresent() == false
                && me._picker.isKeyPresent() == true){
                me.$location.path('/credentials');
                return;
            }

            me._maskLoader.show(me.$scope, 'Loading...');
            me._picker.loadConfiguration().then(me._handleConfigurationLoad.bind(me));
        } else {
            me._handleConfigurationLoad(true);
        }
    },

    onJobHistory: function(){
        var me = this;
        me.$location.path('/jobhistory');
    }

});

PickerController.$inject = ['$scope','CloudElementsUtils','Picker', 'Schedule', 'Notifications', 'MaskLoader', 'CreateInstance', 'Login', 'JobHistory', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('PickerController', PickerController);

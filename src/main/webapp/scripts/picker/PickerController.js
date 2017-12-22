/**
 * Picker controller for selection of the service.
 *
 *
 * @author Ramana
 */
bulkloader.events.VIEW_CHANGE_DATALIST = 'datalist';

var PickerController = BaseController.extend({

    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _credentials: null,
    _instances: null,
    _maskLoader: null,
    _lastSelection: null,
    _application: null,

    init: function($scope, ElementsService, CloudElementsUtils, Picker, Schedule, Credentials, Notifications, MaskLoader, CreateInstance, Login, JobHistory, Help, Application, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._elementsService = ElementsService;
        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._credentials = Credentials;
        me._schedule = Schedule;
        me._createinstance = CreateInstance;
        me._login = Login;
        me._help = Help;
        me._application = Application;
        me._jobhistory = JobHistory;
        me.$window = $window;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);

        me._maskLoader.show(me.$scope, 'Loading...');
        document.title = me._application.getApplicationName();
        me.$scope.branding = me._application.getBranding();
        me.checkKey();
//        me.getBranding();
    },

    defineScope: function() {
        var me = this;
        // This is for transitions

        me.$scope.pageClass = 'page-picker';
        me.$scope.processtep = 'picker';
        me.$scope.shownext = false;

        me.$scope.onSelect = me.onSelect.bind(me);
        me.$scope.onSelectSchedule = me.onSelectSchedule.bind(me);
        me.$scope.createInstance = me.createInstance.bind(me);
        me.$scope.checkStatus = me.checkStatus.bind(me);
        me.$scope.onEditInstance = me.onEditInstance.bind(me);
        me.$scope.onDeleteInstance = me.onDeleteInstance.bind(me);
        me.$scope.appName = me._application.getApplicationName();
        me.$scope.service="Select a Service";
        me.$scope.connection= "That you would like to use";
        me.$scope.target_connect="Connect to your Account at";


        // Add this class to show Target section
        me.$scope.withTarget = '';
        me.$scope.showTarget = false;
        me.$scope.showWait = false;
        me.$scope.showSelectTarget = false;

        me.$scope.targets = [];
        me.$scope.sources = [];
    },

    defineListeners: function() {
        var me = this;
        me._super();

        me._notifications.addEventListener(bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED, me._onInstancesRefresh.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.LOGIN_ENTERED, me.checkKey.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.SHOW_MASK, me.showMask.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.CONFIGURATION_LOAD, me._handleConfigurationLoad.bind(me), me.$scope.$id);
    },

    destroy: function() {
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

//        for(var i = 0; i < keys.length; i++) {
//            console.log('Checking jobs for element instance ID: ' + me._instances[keys[i]].id + '...');
//        }
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

        if(!me._cloudElementsUtils.isEmpty(me._instances)) {
            var keys = Object.keys(me._instances);
            for(var i = 0; i < keys.length; i++) {
                angular.element(document.querySelector('#' + keys[i])).addClass('highlightingElement');
                var elementName = me.findConfigNameForInstance(keys[i]);
                angular.element(document.querySelector('#' + keys[i])).attr('data-instance', elementName ? elementName : me._instances[keys[i]].element.name);
            }
        }

        if(!me._cloudElementsUtils.isEmpty(bulkloader.Picker.oauthElementKey)) {
            me.onSelect(bulkloader.Picker.oauthElementKey, me._lastSelection);
        }
    },

    _handleConfigurationLoad: function(instances) {
        var me = this;
        if(window.location.href.indexOf('swiftpage') > -1 || window.location.href.indexOf('actpremium')> -1) {
            var me = this;
            me.$scope.appName = "Act! eCommerce Connections";
            me.$scope.service = "Log into your account";
            me.$scope.connection="";
            me.$scope.target_connect="Now log into Act!";
        }

        if(me._application.configuration.display["signup-popup"]) {
            console.log("TEST", me._application.configuration.display["signup-popup"]);

            me.$scope.popup = me._application.configuration.display["signup-popup"];
        }

        if(!me._cloudElementsUtils.isEmpty(instances) && instances == false) {
            return;
        }
        me.$scope.sources = me._picker._sources;
        me.$scope.targets = me._picker._targets;

        if(me._application.isTargetHidden() == false) {
            me.$scope.showTarget = true;
            me.$scope.withTarget = 'show-target';
        } else {
            me.$scope.withTarget = 'show-target dark-background';
        }

        if(me._application.getView() == 'mapper') {
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

        if(!me._cloudElementsUtils.isEmpty(me._instances)) {
            var keys = Object.keys(me._instances);
            for(var i = 0; i < keys.length; i++) {
                angular.element(document.querySelector('#' + keys[i])).addClass('highlightingElement');
                var elementName = me.findConfigNameForInstance(keys[i]);
                angular.element(document.querySelector('#' + keys[i])).attr('data-instance', elementName ? elementName : me._instances[keys[i]].element.name);
            }
        }
    },

    findConfigNameForInstance: function(elementKey) {
        var me = this;
        var name = null;
        me._picker._targets.forEach(function(target) {
            if (target.elementKey === elementKey) {
                name = target.name;
            }
        });
        if (name !== null) {
            return name;
        }
        me._picker._sources.forEach(function(source) {
            if (source.elementKey === elementKey) {
                name = source.name;
            }
        });
        return name;
    },

    onSelect: function(elementKey, selection, $event) {
        var me = this;

        $event.preventDefault();
        $event.stopPropagation();

        me._lastSelection = selection;
        //Check to see if the element instance is created, if so then move the view to dataselect
        //If there is no instance, do the OAUTH flow and then land to the dataselect page
        if(me._cloudElementsUtils.isEmpty(me._instances) ||
            me._cloudElementsUtils.isEmpty(me._instances[elementKey])) {

            var element = me._picker.getElementConfig(elementKey, selection);
            if(me._cloudElementsUtils.isEmpty(element.configs)) {

                me._maskLoader.show(me.$scope, 'Connecting to application...');
                me.openedWindow = me.$window.open('', '_blank');
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

            if(me._application.getView() == 'datalist') {
                me._onElementInstanceSelect();
            }

        }
        else if(selection == 'target') {
            angular.element(document.querySelector('div.picker-target a.selectedTarget')).removeClass('selectedTarget');
            angular.element(document.querySelector('div.picker-target #' + elementKey)).addClass('selectedTarget');
            me._picker.setTargetElement(elementKey);
            me._picker.setTargetElementInstance(me._instances[elementKey]);

            if(me._application.getView() == 'mapper') {

                // Check if the target instance is created, if not inform user to create one
                if(me._cloudElementsUtils.isEmpty(me._picker.selectedElementInstance)) {
                    var confirm = me.$mdDialog.alert()
                        .title('Missing Source')
                        .content('Select or Provision your source to proceed forward.')
                        .ok('OK');

                    me.$mdDialog.show(confirm);
                    return;
                }
            }

            me._onElementInstanceSelect();
        }
        $event.preventDefault();
        $event.stopPropagation();

    },

    _handleOnOAuthUrl: function(oauthurl) {
        var me = this;
        me._maskLoader.hide();
//        me.$window.open(oauthurl, '_blank');

        me.openedWindow.location.href = oauthurl;
    },

    _onElementInstanceSelect: function(instance) {
        var me = this;

        if(!me._cloudElementsUtils.isEmpty(me._picker.getTargetElementKey())) {
            me._picker.targetElementInstance = me._instances[me._picker.getTargetElementKey()];
        }

        if(me._application.ignoreMapper() == false) {
            if(me._application.getView() == 'mapper') {
                if(me._cloudElementsUtils.isEmpty(me._picker.targetElementInstance)) {
                    return;
                }
                me._maskLoader.show(me.$scope, 'Loading...');
                me.$location.path('/mapper');
            } else {
                me._maskLoader.show(me.$scope, 'Loading...');
                me.$location.path('/datalist');
            }
        } else {
            if(me._cloudElementsUtils.isEmpty(me._picker.targetElementInstance)) {
                return;
            }
            me._maskLoader.show(me.$scope, 'Loading...');
            if(me._application.isCAaaS()) {
                me.$location.path('/formulas');
            } else {
                me.$location.path('/schedule');
            }
        }

        //Notify about the VIEW Change
        me._notifications.notify(bulkloader.events.VIEW_CHANGE_DATALIST);
        me._maskLoader.hide();
    },

    onSelectSchedule: function(instance, $event) {
        var me = this;
        event.preventDefault();
        event.stopPropagation();
        me._schedule.openSchedule();
    },

    createInstance: function(element, selection) {
        var me = this;
        me._createinstance.openCreateInstance(element, selection);
    },

    checkKey: function() {
        var me = this;
        me._maskLoader.hide();

        if(me._application.isSecretsPresent() == false) {
            if(me._application.isTokenPresent() == true) {
                var login = new Object();
                login.email = me._application.getToken();
                me._maskLoader.show(me.$scope, 'Loading...');
                me._credentials.login(login).then(me._handleConfigurationLoad.bind(me));
                return;
            }
            else {
                me.$location.path(me._application.getLandingPage());
                return;
            }

            me._maskLoader.show(me.$scope, 'Loading...');
            me._picker.loadConfiguration().then(me._handleConfigurationLoad.bind(me));
        } else {
            me._handleConfigurationLoad(true);
        }
    },

    onEditInstance: function(elementKey, selection, $event) {
        var me = this;

        //Get Instance for ElementKey
        var element = null;
        var instance = null;

        if(selection == 'source') {
            element = me._picker.getSourceElement(elementKey);
        } else {
            element = me._picker.getTargetElement(elementKey);
        }

        var keys = Object.keys(me._picker._elementInstances);
        for(var i = 0; i < keys.length; i++) {
            var ins = me._instances[keys[i]];
            if(ins.element.key === elementKey) {
                instance = ins;
                break;
            }
        }

        if(me._cloudElementsUtils.isEmpty(element.configs)) {

            me._maskLoader.show(me.$scope, 'Editing application...');
            me.openedWindow = me.$window.open('', '_blank');
            me._picker.getOAuthUrl(elementKey, selection, instance)
                .then(me._handleOnOAuthUrl.bind(me));
        } else {
            me._createinstance.openCreateInstance(element, selection, instance);
        }

        $event.preventDefault();
        $event.stopPropagation();

    },

    onDeleteInstance: function(elementKey, selection, $event) {
        var me = this;

        var confirm = me.$mdDialog.confirm()
            .title('Warning !')
            .content("Are you sure you want to delete the instance " + elementKey + " ?")
            .ok('Yes')
            .cancel('No');

        me.$mdDialog.show(confirm).then(function() {
            //continue
            me.continueDelete(elementKey, selection);
        }, function() {
            //Don't do anything
        });

        $event.preventDefault();
        $event.stopPropagation();
    },

    continueDelete: function(elementKey, selection) {
        var me = this;

        me._maskLoader.show(me.$scope, 'Deleting Instance...');

        //Get Instance for ElementKey
        var element = null;
        var instance = null;

        if(selection == 'source') {
            element = me._picker.getSourceElement(elementKey);
        } else {
            element = me._picker.getTargetElement(elementKey);
        }

        var keys = Object.keys(me._picker._elementInstances);
        for(var i = 0; i < keys.length; i++) {
            var ins = me._instances[keys[i]];
            if(ins.element.key === elementKey) {
                instance = ins;
                break;
            }
        }

        me._picker.deleteInstance(instance)
            .then(me._handleOnDelete.bind(me, elementKey));
    },

    _handleOnDelete: function(elementKey) {
        var me = this;
        me._maskLoader.hide();

        angular.element(document.querySelector('#' + elementKey)).removeClass('highlightingElement');

        //Refresh the instances from Server to get the latest and greatest
        me._maskLoader.show(me.$scope, 'Refreshing...');
        me._picker.loadElementInstances().then(me._handleInstancesLoad.bind(me));
    }

});

PickerController.$inject = ['$scope', 'ElementsService', 'CloudElementsUtils', 'Picker',
    'Schedule', 'Credentials', 'Notifications',
    'MaskLoader', 'CreateInstance', 'Login',
    'JobHistory', 'Help', 'Application',
    '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('PickerController', PickerController);

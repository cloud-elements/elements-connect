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

    init:function($scope, CloudElementsUtils, Picker, Schedule, Notifications, $window, $location, $interval, $filter, $route){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._schedule = Schedule;
        me.$window = $window;
        me.$location = $location;
        me.$interval = $interval;
        me._super($scope);

        me._picker.loadElementInstances()
            .then(me._handleInstanceLoad.bind(me));
    },

    defineScope:function() {
        var me = this;
        // This is for transitions
        me.$scope.pageClass = 'page-picker';

        me.$scope.onSelect = me.onSelect.bind(me);
        me.$scope.onSelectSchedule = me.onSelectSchedule.bind(me);
        me.$scope.checkStatus = me.checkStatus.bind(me);
    },

    defineListeners:function() {
        var me = this;
        me._super();

        me._notifications.addEventListener(bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED, me._onInstancesRefresh.bind(me));
    },

    checkStatus: function() {
        var me = this;

        var keys = Object.keys(me._instances);

        for(var i = 0; i < keys.length; i++) {
            console.log('Checking jobs for element instance ID: ' + me._instances[keys[i]].id + '...');
        }
    },

    _onInstancesRefresh: function() {
        var me = this;

        me._instances = me._picker._elementInstances;
        me.onSelect(bulkloader.Picker.oauth_elementkey);
    },

    _handleInstanceLoad: function(instances) {
        var me = this;
        me._instances = instances;

        if(!me._cloudElementsUtils.isEmpty(me._instances)) {
            var keys = Object.keys(me._instances);
            for(var i = 0; i< keys.length; i++) {
                angular.element(document.querySelector('#' + keys[i])).addClass('highlightingElement');
                angular.element(document.querySelector('#' + keys[i])).attr('data-instance', me._instances[keys[i]].name);
            }
        }

        // VSJ me.$interval(me.$scope.checkStatus, 5000);
    },

    onSelect: function(elementKey) {
        var me = this;
        //Check to see if the element instance is created, if so then move the view to dataselect
        //If there is no instance, do the OAUTH flow and then land to the dataselect page

        if(me._cloudElementsUtils.isEmpty(me._instances) ||
            me._cloudElementsUtils.isEmpty(me._instances[elementKey])) {
            me._picker.getOAuthUrl(elementKey)
                .then(me._handleOnOAuthUrl.bind(me));
        } else {
            me._onElementInstanceSelect(me._instances[elementKey]);
        }
    },

    _handleOnOAuthUrl: function(oauthurl) {
        var me = this;
        me.$window.open(oauthurl, '_blank');
    },

    _onElementInstanceSelect: function(instance) {
        var me = this;

        // Set the instance details to factory class to be used in datalist
        me._picker.selectedElementInstance = instance;

        //TODO Refer http://embed.plnkr.co/uW4v9T/preview for adding animation while switching the view
        me.$location.path('/datalist');

        //Notify about the VIEW Change
        me._notifications.notify(bulkloader.events.VIEW_CHANGE_DATALIST);
    },

    onSelectSchedule: function(instance, $event){
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me._instances[instance])) {
            me._picker.getOAuthUrl(instance)
                .then(me._handleOnOAuthUrl.bind(me));

        } else {
            $event.stopPropagation();
        }
    }

});

PickerController.$inject = ['$scope','CloudElementsUtils','Picker', 'Schedule', 'Notifications', '$window', '$location', '$interval', '$filter', '$route'];


angular.module('bulkloaderApp')
    .controller('PickerController', PickerController);

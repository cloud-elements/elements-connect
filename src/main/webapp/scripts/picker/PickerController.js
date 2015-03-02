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

    init:function($scope, CloudElementsUtils, Picker, Notifications, $window, $location, $filter, $route){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me.$window = $window;
        me.$location = $location;
        me._super($scope);

        me._picker.loadElementInstances()
            .then(me._handleInstanceLoad.bind(me));

    },

    defineScope:function() {
        var me = this;

        me.$scope.onSelect = me.onSelect.bind(me);
        me.$scope.onSelectSchedule = me.onSelectSchedule.bind(me);
    },

    defineListeners:function(){
        var me = this;
        me._super();
    },

    _handleInstanceLoad: function(instances) {
        var me = this;
        me._instances = instances;

        //TODO Handle highlighting of the elements on UI if there is an instance present
    },

    onSelect: function(elementKey) {
        var me = this;
        //Check to see if the element instance is created, if so then move the view to dataselect
        //If there is no instance, do the OAUTH flow and then land to the dataselect page

        if(me._cloudElementsUtils.isUndefinedOrNull(me._instances[elementKey])) {
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

    onSelectSchedule: function(instance){
        var me = this;

        if(me._cloudElementsUtils.isUndefinedOrNull(me._instances[elementKey])) {
            me._picker.getOAuthUrl(elementKey)
                .then(me._handleOnOAuthUrl.bind(me));

        } else {
            me._onElementInstanceSelect(me._instances[elementKey]);
        }


    },

});

PickerController.$inject = ['$scope','CloudElementsUtils','Picker','Notifications', '$window', '$location', '$filter', '$route'];


angular.module('bulkloaderApp')
    .controller('PickerController', PickerController);
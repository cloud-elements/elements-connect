/**
 * CreateInstanceController controller for selecting the fields.
 *
 *
 * @author Paris
 */

var CreateInstanceController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _datalist: null,
    _createinstance: null,
    _instances: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init:function($scope, CloudElementsUtils, Picker, Datalist, CreateInstance, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._datalist = Datalist;
        me._createinstance = CreateInstance;
        me.$modal = $modal;
        me.$mdDialog = $mdDialog;
        me.$window = $window;
        me._maskLoader = MaskLoader;
        me.$location = $location;
        me._super($scope);
    },

    defineScope:function() {
        var me = this;

        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.save = me.save.bind(this);
        me.$scope.elementConfigs = me._createinstance.element.configs;
        me.$scope.elementData = new Object();
        me.$scope.elementName = me._createinstance.element.name;

    },

    defineListeners:function(){
        var me = this;

//        me._notifications.addEventListener(bulkloader.events.SHOW_SCHEDULER, me._seedSchedule.bind(me));
    },

    cancel: function() {
        var me = this;

        me._createinstance.closeCreateInstance();
        me.$scope.elementData = new Object();
        me.$scope.elementConfigs = null;
    },

    save: function() {
        var me = this;

        var ele = me._createinstance.element;

        if(me._cloudElementsUtils.isEmpty(ele.callbackUrl)) {
            var elementProvision = new Object();
            elementProvision.name = ele.name;
            elementProvision.configuration = me.$scope.elementData;
            elementProvision.element = {
                "key"  : ele.elementKey
            };

            me._maskLoader.show(me.$scope, 'Creating Instance...');
            me._createinstance.onSaveInstance(elementProvision);
        } else {

            me._maskLoader.show(me.$scope, 'Creating Instance...');
            var elementConfig = me._picker.getElementConfig(ele.elementKey, me._createinstance.selection);
            if(me._cloudElementsUtils.isEmpty(elementConfig.other)) {
                elementConfig.other = new Object();
            }
            var keys = Object.keys(me.$scope.elementData);
            for (key in keys) {
                elementConfig.other[keys[key]] = me.$scope.elementData[keys[key]];

                //This is the special case for Marketo where apikey/secret differs for every user
                if('oauth.api.key' === keys[key]) {
                    elementConfig.apiKey = me.$scope.elementData[keys[key]];
                } else if('oauth.api.secret' === keys[key]) {
                    elementConfig.apiSecret = me.$scope.elementData[keys[key]];
                }
            }

            me._picker.getOAuthUrl(ele.elementKey, me._createinstance.selection)
                .then(me._handleOnOAuthUrl.bind(me));
        }
    },

    _handleOnOAuthUrl: function(oauthurl) {
        var me = this;
        me._maskLoader.hide();
        me.$window.open(oauthurl, '_blank');
        me._createinstance.closeCreateInstance();
    }

});

CreateInstanceController.$inject = ['$scope','CloudElementsUtils','Picker', 'Datalist', 'CreateInstance', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('CreateInstanceController', CreateInstanceController);



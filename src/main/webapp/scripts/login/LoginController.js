/**
 * Login controller for selecting the fields.
 *
 *
 * @author Paris
 */

var LoginController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _application: null,
    _datalist: null,
    _login: null,
    _instances: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init: function($scope, CloudElementsUtils, Application, Datalist, Login, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._application = Application;
        me._datalist = Datalist;
        me._login = Login;
        me.$modal = $modal;
        me.$mdDialog = $mdDialog;
        me.$window = $window;
        me._maskLoader = MaskLoader;
        me.$location = $location;
        me._super($scope);
    },

    defineScope: function() {
        var me = this;

        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.save = me.save.bind(this);
        me.$scope.apiKey;
        me.$scope.userId;

    },

    defineListeners: function() {
        var me = this;

//        me._notifications.addEventListener(bulkloader.events.SHOW_SCHEDULER, me._seedSchedule.bind(me));
    },

    cancel: function() {
        var me = this;
        me._login.closeLogin();
    },

    save: function() {
        var me = this;
        me._application.setLogin(me.$scope.apiKey, me.$scope.userId);
        me._notifications.notify(bulkloader.events.LOGIN_ENTERED, "Done");
        me._login.closeLogin();
    }
});

LoginController.$inject = ['$scope', 'CloudElementsUtils', 'Application', 'Datalist', 'Login', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('LoginController', LoginController);
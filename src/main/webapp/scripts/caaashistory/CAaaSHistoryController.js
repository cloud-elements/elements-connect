/**
 * CAaaSHistory controller for showing the history details
 *
 *
 * @author Ramana
 */

var CAaaSHistoryController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _application: null,
    _history: null,
    _instances: null,
    _maskLoader: null,
    _credentials: null,

    init: function($scope, CloudElementsUtils, Application, CAaaSHistory, Notifications, Credentials, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._credentials = Credentials;
        me.$window = $window;
        me._application = Application;
        me._history = CAaaSHistory;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);

    },

    defineScope: function() {
        var me = this;
        me.$scope.close = me.close.bind(this);
        me.seedHistory();
    },

    defineListeners: function() {
        var me = this;
    },

    destroy: function() {
        var me = this;
    },

    seedHistory: function() {
        var me = this;

        if(me._application.isSecretsPresent() == false) {
            me.$location.path('/');
            return;
        }

    },

    close: function() {
        var me = this;
        me.$location.path('/');
    }

});

CAaaSHistoryController.$inject = ['$scope', 'CloudElementsUtils', 'Application', 'CAaaSHistory', 'Notifications', 'Credentials', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('CAaaSHistoryController', CAaaSHistoryController);

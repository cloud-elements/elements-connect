/**
 * Navigation controller for selection of the service.
 *
 *
 * @author Paris
 */

var LandingController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _maskLoader: null,
    _credentials: null,
    _landing: null,

    init: function($scope, CloudElementsUtils, Notifications, Credentials, MaskLoader, Landing, $window, $location, $interval, $route) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._credentials = Credentials;
        me.$window = $window;
        me.$location = $location;
        me.$interval = $interval;
        me._landing = Landing;
        me._super($scope);

    },

    defineScope: function() {
        var me = this;

        me.$scope.goToLogin = me.goToLogin.bind(me);
        me.$scope.goToSignup = me.goToSignup.bind(me);
    },

    defineListeners: function() {
        var me = this;
        me._super();
    },

    goToLogin: function() {
        var me = this;
        me._credentials.credentialsView = 'login';
        me.$location.path('/credentials');
    },
    goToSignup: function() {
        var me = this;
        me._credentials.credentialsView = 'signup';
        me.$location.path('/credentials');
    }
});

LandingController.$inject = ['$scope', 'CloudElementsUtils', 'Notifications', 'Credentials', 'MaskLoader', 'Landing', '$window', '$location', '$interval', '$route'];

angular.module('bulkloaderApp')
    .controller('LandingController', LandingController);

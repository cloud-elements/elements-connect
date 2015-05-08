/**
 * Credentials controller for selection of the service.
 *
 *
 * @author Paris
 */

var CredentialsController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _instances: null,
    _maskLoader: null,
    _credentials: null,

    init:function($scope, CloudElementsUtils, Notifications, Credentials, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._credentials = Credentials;
        me.$window = $window;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);

    },

    defineScope:function() {
        var me = this;
        me.$scope.showLogin = true;
        me.$scope.showSignup = false;
        me.$scope.login = {};
        me.$scope.signup = {};

        me.$scope.onLogin = me.onLogin.bind(me);
        me.$scope.onSignup = me.onSignup.bind(me);
        me.$scope.changeCredentialView = me.changeCredentialView.bind(me);

    },

    defineListeners:function() {
        var me = this;
        me._super();

        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me));
        me._notifications.addEventListener(bulkloader.events.SHOW_MASK, me.showMask.bind(me));
    },


    changeCredentialView: function(view,$event){
        var me = this;
        event.preventDefault();
        event.stopPropagation();

        if(view == 'login'){
            me.$scope.showLogin = false;
            me.$scope.showSignup = true;
        }else {
            me.$scope.showLogin = true;
            me.$scope.showSignup = false;
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

    showMask: function(event, msg) {
        var me = this;
        me._maskLoader.show(me.$scope, msg);
    },

    onLogin: function(){
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.$scope.login.email)
            || me._cloudElementsUtils.isEmpty(me.$scope.login.password)) {

            var confirm = me.$mdDialog.alert()
                .title('Missing values')
                .content('Please enter email and password to login."')
                .ok('OK');

            me.$mdDialog.show(confirm);
            return;
        }
        me._maskLoader.show(me.$scope, 'Authenticating...');
        me._credentials.login(me.$scope.login).then(me._handleConfigurationLoad.bind(me));
    },

    onSignup: function(){
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.$scope.signup.email)
            || me._cloudElementsUtils.isEmpty(me.$scope.signup.password)
            || me._cloudElementsUtils.isEmpty(me.$scope.signup.firstName)
            || me._cloudElementsUtils.isEmpty(me.$scope.signup.lastName)) {

            var confirm = me.$mdDialog.alert()
                .title('Missing values')
                .content('Missing required values."')
                .ok('OK');

            me.$mdDialog.show(confirm);
            return;
        }

        me._maskLoader.show(me.$scope, 'Creating account...');
        me._credentials.signup(me.$scope.signup).then(me._handleConfigurationLoad.bind(me));
    },

    _handleConfigurationLoad: function(result) {
        var me = this;
        me._maskLoader.hide();
        if(result == true) {
            me.$location.path('/');
        }
    }
});

CredentialsController.$inject = ['$scope','CloudElementsUtils', 'Notifications', 'Credentials', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('CredentialsController', CredentialsController);

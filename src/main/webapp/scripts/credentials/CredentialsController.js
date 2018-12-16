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
    _application: null,

    init: function($scope, CloudElementsUtils, Notifications, Credentials, MaskLoader, Application, Picker, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._credentials = Credentials;
        me._application = Application;
        me.$window = $window;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);
        document.title = me._application.getApplicationName();
    },

    defineScope: function() {
        var me = this;
        me.$scope.showLogin = true;
        me.$scope.showSignup = false;
        me.$scope.showForgotPassword = false;
        me.$scope.showNewPassword = false;
        me.$scope.login = {};
        me.$scope.signup = {};
        me.$scope.hscrm = {};
        me.$scope.forgotpassword = {};
        me.$scope.newpassword = null;
        me.$scope.newpasswordagain = null;

        me.$scope.shownav = false;

        me.$scope.appName = me._application.getApplicationName();

        me.$scope.onLogin = me.onLogin.bind(me);
        me.$scope.onSignup = me.onSignup.bind(me);
        me.$scope.changeCredentialView = me.changeCredentialView.bind(me);
        me.$scope.onForgot = me.onForgot.bind(me);
        me.$scope.onSetNewPassword = me.onSetNewPassword.bind(me);
        me.$scope.hsanalytics = me._application.isHS();
        me.$scope.hsformfields = me._application.isHS();
        me.$scope.btNoNewAccountLink = me._application.isBT();



        var a = me.$location.path();
        var b = me.$location.path();
        var c = me._credentials.credentialsView;
        if (me.$location.path() === '/signup') {
            me.changeCredentialView('signup');
        }
        else {
            me.changeCredentialView(me._credentials.credentialsView);
        }
        me.credentialsBranding(me._application.isST());
        me.credentialsBranding2(me._application.isSP());
        me.credentialsBranding3(me._application.isAO());



    },

    defineListeners: function() {
        var me = this;
        me._super();

        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.SHOW_MASK, me.showMask.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.CREDENTIALS_EXPIRED, me._onCredentialsExpired.bind(me), me.$scope.$id);
    },

    destroy: function() {
        var me = this;
        me._notifications.removeEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.SHOW_MASK, me.showMask.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.CREDENTIALS_EXPIRED, me._onCredentialsExpired.bind(me), me.$scope.$id);
    },

    changeCredentialView: function(view, event) {
        var me = this;
        if(!me._cloudElementsUtils.isEmpty(event)) {
            event.preventDefault();
            event.stopPropagation();
        }

        me.$scope.showLogin = false;
        me.$scope.showForgotPassword = false;
        me.$scope.showSignup = false;
        me.$scope.showNewPassword = false;

        if(view == 'login') {
            me.$scope.showLogin = true;
        } else if(view == 'signup') {
            me.$scope.showSignup = true;
        } else if(view == 'forgotpassword') {
            me.$scope.showForgotPassword = true;
        } else if(view == 'newpassword') {
            me.$scope.showNewPassword = true;
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

    onLogin: function() {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.$scope.login.email)
            || me._cloudElementsUtils.isEmpty(me.$scope.login.password)) {

            var confirm = me.$mdDialog.alert()
                .title('Missing values')
                .content('Please enter Email and Password to login.')
                .ok('OK');

            me.$mdDialog.show(confirm);
            return;
        }
        me._maskLoader.show(me.$scope, 'Authenticating...');
        me._credentials.login(me.$scope.login).then(me._handleConfigurationLoad.bind(me));
    },

    onForgot: function() {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.$scope.forgotpasswordEmail)) {
            var confirm = me.$mdDialog.alert()
                .title('Missing values')
                .content('Email is required.')
                .ok('OK');

            me.$mdDialog.show(confirm);
            return;
        }

        me._maskLoader.show(me.$scope, 'Resetting account...');
        me._credentials.forgot(me.$scope.forgotpasswordEmail).then(me._handleForgotPasswordLoad.bind(me));
    },

    _handleForgotPasswordLoad: function(result) {
        var me = this;
        me._maskLoader.hide();
        if(result == true) {
            var confirm = me.$mdDialog.alert()
                .title('Password Reset Successful')
                .content('Temporary password has been sent to your email address. Relogin with your temporary password.')
                .ok('OK');

            me.$mdDialog.show(confirm);
            me.changeCredentialView('login');
        }
    },

    onSetNewPassword: function() {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.$scope.newpassword)
            || me._cloudElementsUtils.isEmpty(me.$scope.newpasswordagain)) {

            var confirm = me.$mdDialog.alert()
                .title('Missing values')
                .content('Please enter new password and confirm new password.')
                .ok('OK');

            me.$mdDialog.show(confirm);
            return;
        }

        if(!(me.$scope.newpassword === me.$scope.newpasswordagain)) {
            var confirm = me.$mdDialog.alert()
                .title('Password mismatch')
                .content('New password and Confirm new password should match exactly.')
                .ok('OK');

            me.$mdDialog.show(confirm);
            return;
        }

        if(me._cloudElementsUtils.isEmpty(me.$scope.login.email)
            || me._cloudElementsUtils.isEmpty(me.$scope.login.password)) {

            var confirm = me.$mdDialog.alert()
                .title('Missing values')
                .content('Missing required values.')
                .ok('OK');

            me.$mdDialog.show(confirm);
            return;
        }

        me._maskLoader.show(me.$scope, 'Updating password...');
        me.$scope.login.newpassword = me.$scope.newpassword;
        me._credentials.updatePassword(me.$scope.login).then(me._handleSetNewPassword.bind(me));
    },

    _handleSetNewPassword: function(result) {
        var me = this;
        me._maskLoader.hide();
        if(result == true) {
            me.$scope.login.password = me.$scope.newpassword;
            me.$scope.login.newpassword = null;
            me.onLogin();
        }
    },

    onSignup: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.$scope.signup.email)
            || me._cloudElementsUtils.isEmpty(me.$scope.signup.password)
            || me._cloudElementsUtils.isEmpty(me.$scope.signup.firstName)
            || me._cloudElementsUtils.isEmpty(me.$scope.signup.lastName)) {

            var confirm = me.$mdDialog.alert()
                .title('Missing values')
                .content('First Name, Last Name, Email, and Password are required.')
                .ok('OK');

            me.$mdDialog.show(confirm);
            return;
        }

        // This is for HS only - if dropdown is not selected
        if( me._application.isHS() && me._cloudElementsUtils.isEmpty(me.$scope.hscrm.selected)){
            var confirm = me.$mdDialog.alert()
                .title('Missing values')
                .content('Select your Source CRM is required.')
                .ok('OK');

            me.$mdDialog.show(confirm);
            return;
        }
        if( me._application.isHS()){
            me._credentials.hscrm = me.$scope.hscrm.selected;
        }
        me._maskLoader.show(me.$scope, 'Creating account...');
        me._credentials.signup(me.$scope.signup).then(me._handleConfigurationLoad.bind(me));
    },

    _handleConfigurationLoad: function(result) {
        var me = this;
        me._maskLoader.hide();
        if(result == true) {
            if (me._application.getEnv()){
                chmln.setup({uid: me.$scope.login.email, email: me.$scope.login.email, subscription: me._picker.getSubscription()});
            }
            me._picker.getBranding();
            me.$location.path('/');
        }
    },

    _onCredentialsExpired: function(event, error) {
        var me = this;
        me.changeCredentialView('newpassword');
    },

    _onSignupLanding: function(event, error) {
        var me = this;
        me.changeCredentialView('signup');
    },

    credentialsBranding: function(isST){
        var me = this;
        var stylesheet = document.getElementById('customestyle');
            stylesheet = stylesheet.sheet;
        if(isST){
            me._picker.addCSSRule(stylesheet, '#credentials', "background-color: #f9f9f9 !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .content p', "color: #adadad !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .credentials-logo', "background-image: url('images/sailthru-logo.png') !important; width: 100% !important; height: 70px !important; display: block !important; background-repeat: no-repeat !important; background-position: center center !important; -webkit-background-size: contain !important; -moz-background-size: contain !important; -o-background-size: contain !important; background-size: contain !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .header', "visibility: hidden !important");
            me._picker.addCSSRule(stylesheet, '#credentials .credentials-container p > a', "color: #edaf4f !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .buttons .ui.inverted.green.basic.button', "background: #00cced !important; background-clip: padding-box !important; box-shadow: 0 4px #0399B1 !important; text-transform: uppercase !important; font-weight: bold !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .buttons .ui.inverted.green.basic.button:hover', "box-shadow: 0 3px #0399B1 !important; top: 2px !important; color: #fff !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .buttons .ui.inverted.green.basic.button:active', "box-shadow: 0 0 #0399B1 !important; top: 6px !important; outline: none !important; color: #fff !important;");
        }

    },
    credentialsBranding2: function(isSP){
        var me = this;
        var stylesheet = document.getElementById('customestyle');
            stylesheet = stylesheet.sheet;
        if(isSP){
            me.$scope.appName="Act! eCommerce Connections";
            me._picker.addCSSRule(stylesheet, '#credentials', "background-color: #CDCDC8 !important;");
            // me._picker.addCSSRule(stylesheet, '#credentials .content p', "color: #adadad !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .credentials-logo', "background-image:" +
                " url('http://cloud-elements.github.io/formulas/assets/act-circle-logo.png') !important; width: 100%" +
                " !important;" +
                " height: 250px !important; display: block !important; background-repeat: no-repeat !important;" +
                " background-position: center center !important; -webkit-background-size: contain !important;" +
                " -moz-background-size: contain !important; -o-background-size: contain !important; background-size: contain !important;");
            // me._picker.addCSSRule(stylesheet, '#credentials .header', "visibility: hidden !important");
            me._picker.addCSSRule(stylesheet, '#credentials .header', "color: #000000 !important");
            // me._picker.addCSSRule(stylesheet, '#credentials', "inner-html: "Welcome to test" !important");
            me._picker.addCSSRule(stylesheet, '#credentials .credentials-container p > a', "color: #000000" +
                " !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .buttons .ui.inverted.green.basic.button', "background: #328CC3 !important; background-clip: padding-box !important; box-shadow: 0 4px #0399B1 !important; text-transform: uppercase !important; font-weight: bold !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .buttons .ui.inverted.green.basic.button:hover', "box-shadow: 0 3px #0399B1 !important; top: 2px !important; color: #fff !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .buttons .ui.inverted.green.basic.button:active', "box-shadow: 0 0 #0399B1 !important; top: 6px !important; outline: none !important; color: #fff !important;");
            me._picker.addCSSRule(stylesheet, '.credentials-container', "top: 10% !important;");

        }

    },
    credentialsBranding3: function(isAO){
        var me = this;
        var stylesheet = document.getElementById('customestyle');
            stylesheet = stylesheet.sheet;
        if(isAO){
            me._picker.addCSSRule(stylesheet, '#credentials', "background-color: #EBEEF0 !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .content p', "color: #478BAA !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .credentials-logo', "background-image: url('https://cdn2.act-on.com/wp-content/uploads/2016/04/Act-On_logo-2016_two-tone.png') !important; width: 100% !important; height: 70px !important; display: block !important; background-repeat: no-repeat !important; background-position: center center !important; -webkit-background-size: contain !important; -moz-background-size: contain !important; -o-background-size: contain !important; background-size: contain !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .header', "visibility: hidden !important");
            me._picker.addCSSRule(stylesheet, '#credentials .credentials-container p > a', "color: #edaf4f !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .buttons .ui.inverted.green.basic.button', "background: #08314c !important; background-clip: padding-box !important; box-shadow: 0 4px #0399B1 !important; text-transform: uppercase !important; font-weight: bold !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .buttons .ui.inverted.green.basic.button:hover', "box-shadow: 0 3px #0399B1 !important; top: 2px !important; color: #fff !important;");
            me._picker.addCSSRule(stylesheet, '#credentials .buttons .ui.inverted.green.basic.button:active', "box-shadow: 0 0 #0399B1 !important; top: 6px !important; outline: none !important; color: #fff !important;");
        }

    }


});

CredentialsController.$inject = ['$scope', 'CloudElementsUtils', 'Notifications', 'Credentials', 'MaskLoader', 'Application', 'Picker', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('CredentialsController', CredentialsController);

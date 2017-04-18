/**
 * Credentials factor class as an helper to Credentials controller.
 *
 *
 * @author Paris
 */

var Credentials = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _application: null,
    credentialsView: 'login',
    hscrm: null,

    _handleLoadError: function(error) {
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    forgot: function(email) {
        var me = this;

        var user = new Object();
        user.username = email;
        user.email = email;

        return me._elementsService.resetPassword(user).then(
            me._resetPasswordSucceeded.bind(me),
            me._resetPasswordFailed.bind(me));
    },

    _resetPasswordSucceeded: function(result) {
        var me = this;
        return true;
    },

    _resetPasswordFailed: function(error) {
        var me = this;

        if(error.code == 206) {
            //Credentials expired, force user to change Password
            me._notifications.notify(bulkloader.events.CREDENTIALS_EXPIRED, error.data);
            return;
        }

        if(me._cloudElementsUtils.isEmpty(error.data)) {
            me._notifications.notify(bulkloader.events.ERROR,
                "Error while resetting the password.");
        } else {
            me._notifications.notify(bulkloader.events.ERROR,
                    "Error while resetting the password. " + error.data.message);
        }
    },

    updatePassword: function(login) {
        var me = this;

        return me._elementsService.updatePassword(login.email, login.password, login.newpassword).then(
            me._updatePasswordSucceeded.bind(me),
            me._updatePasswordFailed.bind(me));
    },

    _updatePasswordSucceeded: function(result) {
        var me = this;
        return true;
    },

    _updatePasswordFailed: function(error) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(error.data)) {
            me._notifications.notify(bulkloader.events.ERROR,
                "Could not update password.");
        } else {
            me._notifications.notify(bulkloader.events.ERROR,
                    "Could not update password. " + error.data.message);
        }
    },

    login: function(login) {
        var me = this;
        return me._elementsService.loginAndloadConfiguration(login.email, login.password).then(
            me._loadConfigurationSucceeded.bind(me),
            me._loadConfigurationFailed.bind(me));
    },

    _loadConfigurationSucceeded: function(result) {
        var me = this;
        if(result.status == 205) {
            //Credentials expired, force user to change Password
            me._notifications.notify(bulkloader.events.CREDENTIALS_EXPIRED, status.data);
            return false;
        }

        return me._picker.handleConfigurationSetUp(result);
    },

    _loadConfigurationFailed: function(error) {
        var me = this;
        if(error.status == 205) {
            //Credentials expired, force user to change Password
            me._notifications.notify(bulkloader.events.CREDENTIALS_EXPIRED, error.data);
            return false;
        }
        if(me._cloudElementsUtils.isEmpty(error.data)) {
            me._notifications.notify(bulkloader.events.ERROR,
                "Could not retrieve application configuration for organization.");
        } else {
            me._notifications.notify(bulkloader.events.ERROR,
                    "Could not retrieve application configuration for organization. " + error.data.message);
        }

        return false;
    },

    signup: function(signup) {
        var me = this;

        signup.username = signup.email;
        return me._elementsService.signup(signup).then(
            me._loadSignupSucceeded.bind(me, signup),
            me._loadSignupFailed.bind(me));
    },

    _loadSignupSucceeded: function(signup, result) {
        var me = this;
        if(me._application.isHS()){
            trackSignup(signup.email, signup.firstName, signup.lastName, me.hscrm);
        }
        return me.login(signup);
    },

    _loadSignupFailed: function(error) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(error.data)) {
            me._notifications.notify(bulkloader.events.ERROR,
                "Could not Signup for the application.");
        } else {
            me._notifications.notify(bulkloader.events.ERROR,
                    "Could not Signup for the application. " + error.data.message);
        }
    }

});

/**
 * Credentials Factory object creation
 *
 */
(function() {

    var CredentialsObject = Class.extend({

        instance: new Credentials(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Notifications', 'Picker', 'Application', function(CloudElementsUtils, ElementsService, Notifications, Picker, Application) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._picker = Picker;
            this.instance._application = Application;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Credentials', CredentialsObject);
}());
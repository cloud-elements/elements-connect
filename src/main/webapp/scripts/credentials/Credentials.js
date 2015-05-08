/**
 * Credentials factor class as an helper to Credentials controller.
 *
 *
 * @author Paris
 */

var Credentials = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    login: function(login) {
        var me = this;

        return me._elementsService.loginAndloadConfiguration(login.email, login.password).then(
            me._loadConfigurationSucceeded.bind(me),
            me._loadConfigurationFailed.bind(me));
    },

    _loadConfigurationSucceeded: function(result) {
        var me = this;

        me._picker.handleConfigurationSetUp(result);

        if(!me._picker.validateConfiguration()) {
            return false;
        }

        return true;
    },

    _loadConfigurationFailed: function(error) {
        var me = this;

        if (me._cloudElementsUtils.isEmpty(error.data)) {
            me._notifications.notify(bulkloader.events.ERROR,
                "Could not retrieve application configuration for organization.");
        } else {
            me._notifications.notify(bulkloader.events.ERROR,
                    "Could not retrieve application configuration for organization. " + error.data.message);
        }
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
        return me.login(signup);
    },

    _loadSignupFailed: function(error) {
        var me = this;

        if (me._cloudElementsUtils.isEmpty(error.data)) {
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
(function (){

    var CredentialsObject = Class.extend({

        instance: new Credentials(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications', 'Picker', function(CloudElementsUtils, ElementsService, Notifications, Picker){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._picker = Picker;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Credentials',CredentialsObject);
}());
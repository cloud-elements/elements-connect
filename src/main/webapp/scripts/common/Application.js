/**
 * This is Utils class used for setting and reading configuration values for the application
 *
 * Created by Ramana on 07/07/15.
 */
var Application = Class.extend({
    environment: null,
    configuration: null,

    populateApplicationDetails: function() {
        var me = this;

        //Read the URL arguments
        var pageParameters = me._cloudElementsUtils.pageParameters();
        if(me._cloudElementsUtils.isEmpty(pageParameters)) {
            return;
        }

        if(!me._cloudElementsUtils.isEmpty(pageParameters.key)) {
            me.environment.key = pageParameters.key;
        }

        if(!me._cloudElementsUtils.isEmpty(pageParameters.token)) {
            me.environment.token = pageParameters.token;
        }
    },

    getApplicationName: function() {
        var me = this;
        return me.environment.appName;
    },

    isCAaaS: function() {
        var me = this;
        return me.environment.appName === 'POSable';
    },

    isBulkloader: function() {
        var me = this;
        return me.environment.appName === 'Bulk Loader';
    },

    isSecretsPresent: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.configuration)
            || me._cloudElementsUtils.isEmpty(me.configuration.user)
            || me._cloudElementsUtils.isEmpty(me.configuration.company)) {
            return false;
        }

        return true;
    },

    /**
     * This will reset the configuration and secrets
     */
    resetConfiguration: function() {
        var me = this;
        me.configuration = null;
    },

    loadConfiguration: function(data) {
        var me = this;
        me.configuration = data.userData.configuration;
        me.configuration.company = data.company.secret;
        me.configuration.user = data.userData.secret;
    },

    isTokenPresent: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.environment.token)) {
            return false;
        }
        return true;
    },

    isKeyPresent: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.environment.key)) {
            return false;
        }
        return true;
    },

    getToken: function() {
        var me = this;
        return me.environment.token;
    },

    getView: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.configuration)
            || me._cloudElementsUtils.isEmpty(me.configuration.view)) {
            return 'datalist';
        }
        return  me.configuration.view;
    },

    getDisplay: function() {
        var me = this;
        return me.configuration.display;
    },

    getMapper: function() {
        var me = this;
        return me.configuration.mapper;
    },

    isMapperBiDirectional: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.configuration)
            || me._cloudElementsUtils.isEmpty(me.configuration.mapper)) {
            return false;
        }
        return  me.configuration.mapper.bidirectional;
    },

    isTargetHidden: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.configuration)) {
            return false;
        }
        var show = me.configuration.showTarget;
        if(me._cloudElementsUtils.isEmpty(show)) {
            show = false;
        }
        return !show;
    },

    isJSEditorHidden: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.configuration)) {
            return true;
        }

        if(me._cloudElementsUtils.isEmpty(me.configuration.display)) {
            return true;
        }
        else if(me.configuration.display.showJSEditor == true) {
            return false;
        }

        return true;
    },

    setLogin: function(key, userId) {
        var me = this;
        me.environment.apiKey = key;
        me.environment.userId = userId;
    },

    //This is very dirty way as there is no other option of directing only hubspot to a different landing page
    getLandingPage: function() {
        var me = this;
        if(window.location.href.indexOf('hubspot') > -1) {
            return '/hubspotelementloader';
        }

        return '/credentials';
    }
});

/**
 * Utils object creation
 *
 */
(function() {

    var application = Class.extend({

        instance: new Application(),

        /**
         * Initialize and configure
         */
        $get: [
            'ENV', 'CloudElementsUtils', function(ENV, CloudElementsUtils) {
                this.instance._cloudElementsUtils = CloudElementsUtils;
                this.instance.environment = ENV;
                this.instance.populateApplicationDetails();
                return this.instance;
            }
        ]
    })

    angular.module('Application', [])
        .provider('Application', application);
}());

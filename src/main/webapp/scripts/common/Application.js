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

        if(!me._cloudElementsUtils.isEmpty(pageParameters.appName)) {
            me.environment.appName = pageParameters.appName;
        }
    },

    getApplicationName: function() {
        var me = this;
        return me.environment.appName;
    },

    isCAaaS: function() {
        var me = this;
        return (me.environment.appName === 'POSable' || me.environment.appName === 'CAaaS' || me.environment.appName === 'Element Connect'
            || !(me.environment.appName === 'Bulk Loader'));
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

    getBranding: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.configuration)
            || me._cloudElementsUtils.isEmpty(me.configuration.branding)) {
            return false;
        }
        return  me.configuration.branding;
    },

    getDisplay: function() {
        var me = this;
        return me.configuration.display;
    },

    getConfigName: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.configuration)
            || me._cloudElementsUtils.isEmpty(me.configuration.name)){
            return null;
        }
        return me.configuration.name;
    },

    getSchedule: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.configuration)
            || me._cloudElementsUtils.isEmpty(me.configuration.display)
            || me._cloudElementsUtils.isEmpty(me.configuration.display.schedule)) {
            return null;
        }
        return me.configuration.display.schedule;
    },

    showScheduling: function() {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.configuration)
            || me._cloudElementsUtils.isEmpty(me.configuration.display)) {
            return false;
        }

        if(!me._cloudElementsUtils.isEmpty(me.getDisplay())
            && !me._cloudElementsUtils.isEmpty(me.getDisplay().scheduling)) {
            return (me.getDisplay().scheduling == true);
        }

        if(me._cloudElementsUtils.isEmpty(me.configuration.display.schedule)) {
            return false;
        }

        return (me.configuration.display.schedule.scheduling == true);
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
    isCustomConfig: function(){
        var me = this;
        return me.configuration.mapper && me.configuration.mapper.customFieldContainer;

    },

    getTargetenumFields: function() {
        var me = this;
        return me.configuration.mapper && me.configuration.mapper.TargetenumFields;
    },

    getSourceenumFields: function() {
        var me = this;
        return me.configuration.mapper && me.configuration.mapper.SourceenumFields;
    },

    getdisplaySourceObject: function() {
        var me = this;
        return me.configuration.mapper && me.configuration.mapper.displaySourceObject;
    },

    getdisplayTargetObject: function() {
        var me = this;
        return me.configuration.mapper && me.configuration.mapper.displayTargetObject;
    },

    isAllowdrop: function() {
        var me = this;
        return me.configuration.mapper && me.configuration.mapper.allowdrop;
    },

    isTargetHidden: function() {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.configuration)) {
            return false;
        }
        //Checking for backward compatibility
        if(!me._cloudElementsUtils.isEmpty(me.configuration.showTarget)) {
            return !me.configuration.showTarget;
        }

        if(me._cloudElementsUtils.isEmpty(me.configuration.display)) {
            return false;
        }

        var show = me.configuration.display.showTarget;
        if(me._cloudElementsUtils.isEmpty(show)) {
            show = false;
        }

        return !show;
    },

    isCompositeMetadata: function() {
        var me = this;
        if (me._cloudElementsUtils.isEmpty(me.configuration)) {
            return false;
        } else if (me._cloudElementsUtils.isEmpty(me.configuration.metadata)) {
            return false;
        } else if (me.configuration.metadata.composite === true) {
            return true;
        }
        return false;
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

    getTargetDisplayConfig: function(key){
        var me = this;
        var obj = me.configuration.targets;

        for (var i=0 ; i < obj.length ; i++)
        {
            if (obj[i]["elementKey"] == key) {
                return obj[i].display;
            }
        }
    },

    isMultipleInstance: function(key) {
        var me = this;
        var targetDisplayConfig = me.getTargetDisplayConfig(key);

        if(!me._cloudElementsUtils.isEmpty(targetDisplayConfig) &&
           !me._cloudElementsUtils.isEmpty(targetDisplayConfig.multipleInstance) &&
           targetDisplayConfig.multipleInstance) {
            return targetDisplayConfig.multipleInstance;
        }

        return false;
    },

    isInstanceTitle: function(key) {
        var me = this;
        var targetDisplayConfig = me.getTargetDisplayConfig(key);

        if(!me._cloudElementsUtils.isEmpty(targetDisplayConfig) &&
            !me._cloudElementsUtils.isEmpty(targetDisplayConfig.formulaInstanceName)) {
            return targetDisplayConfig.formulaInstanceName;
        }

        return 'instances';
    },

    isPageTitle: function(key) {
        var me = this;
        var targetDisplayConfig = me.getTargetDisplayConfig(key);

        if(!me._cloudElementsUtils.isEmpty(targetDisplayConfig)  &&
            !me._cloudElementsUtils.isEmpty(targetDisplayConfig.formulaTitlePicker)) {
            return targetDisplayConfig.formulaTitlePicker;
        }

        return 'Select a Formula Template';
    },

    isPageSubtitle: function(key) {
        var me = this;
        var targetDisplayConfig = me.getTargetDisplayConfig(key);

        if(!me._cloudElementsUtils.isEmpty(targetDisplayConfig)  &&
            !me._cloudElementsUtils.isEmpty(targetDisplayConfig.formulaSubtitlePicker)) {
            return targetDisplayConfig.formulaSubtitlePicker;
        }

        return 'That you would like to use with';
    },

    ignoreMapper: function() {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(me.configuration)) {
            return false;
        }

        if(me._cloudElementsUtils.isEmpty(me.configuration.display)) {
            return false;
        }
        else if(me.configuration.display.showMapper == false) {
            return true;
        }

        return false;
    },


    setLogin: function(key, userId) {
        var me = this;
        me.environment.apiKey = key;
        me.environment.userId = userId;
    },

    //This is very dirty way as there is no other option of directing only hubspot & sailthru to a different landing page
    getLandingPage: function() {
        var me = this;
        if(window.location.href.indexOf('hubspot') > -1) {
            return '/hubspotelementloader';
        }
//        if(window.location.href.indexOf('sailthru') > -1) {
//            return '/sailthruelementloader';
//        }
        return '/credentials';
    },
    //This is very dirty way as there is no other option of adding hubspot only analytics
    isHS: function() {
        var me = this;
        if(window.location.href.indexOf('hubspot') > -1) {
            return true;
        }

        return false;
    },
    //This is very dirty way as there is no other option of adding Sailthru only credentials branding
    isST: function() {
        var me = this;
        if(window.location.href.indexOf('sailthru') > -1) {
            return true;
        }

        return false;
    },
    //This is very dirty way as there is no other option of adding Act-On only credentials branding
    isAO: function() {
        var me = this;
        if(window.location.href.indexOf('act-on') > -1) {
            return true;
        }

        return false;
    },
    //This is very dirty way as there is no other option of adding SwiftPage only credentials branding
    isSP: function() {
        var me = this;
        if(window.location.href.indexOf('swiftpage') > -1 || window.location.href.indexOf('actpremium')> -1) {
            return true;
        }

        return false;
    },
    //This is very dirty way as there is no other option of adding Brighttalk only credentials branding
    isBT: function() {
        var me = this;
        if(window.location.href.indexOf('brighttalk') > -1) {
            return true;
        }

        return false;
    },

    getTransferNowMessage: function() {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.configuration) || me._cloudElementsUtils.isEmpty(me.configuration.display)) {
            return null;
        }

        if(!me._cloudElementsUtils.isEmpty(me.configuration.display.transferNowMessage)) {
            return me.configuration.display.transferNowMessage;
        }

        if(!me._cloudElementsUtils.isEmpty(me.configuration.display.schedule)
            && !me._cloudElementsUtils.isEmpty(me.configuration.display.schedule.transferNowMessage)) {
            return me.configuration.display.schedule.transferNowMessage;
        }

        return null;
    },

    //This is to filter user and no create Chmln users from non-staging env.
    getEnv: function(){
        var me = this;

        if((window.location.href.indexOf('http://qa') > -1) || (window.location.href.indexOf('http://staging') > -1) ||
            (window.location.href.indexOf('https://qa') > -1) || (window.location.href.indexOf('https://staging') > -1) ||
            (window.location.href.indexOf('localhost') > -1) || (window.location.href.indexOf('ngrok.io') > -1)) {
            return false;
        }

        return true;
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

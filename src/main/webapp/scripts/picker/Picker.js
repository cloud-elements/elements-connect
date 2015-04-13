/**
 * Picker factor class as an helper to picker controller.
 *
 *
 * @author Ramana
 */


bulkloader.events.ELEMENT_INSTANCES_LOAD = 'ELEMENT_INSTANCES_LOAD';
bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED = 'NEW_ELEMENT_INSTANCE_CREATED';
bulkloader.events.SHOW_SCHEDULER = 'SHOW_SCHEDULER';

namespace('bulkloader.Picker').oauthElementKey = null;

var Picker = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,
    _elementInstances: null,
    _sources: null,
    _target: null,
    selectedElementInstance: null,
    targetElementInstance: null,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },


    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Load all the instances and from it get the defaultinstance and also set it to _selectedElementInstance
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    loadConfiguration: function() {
        var me = this;

        return me._elementsService.loadOrgConfiguration().then(
          me._loadOrgConfigurationSucceeded.bind(me),
          me._loadOrgConfigurationFailed.bind(me));
    },

    _loadOrgConfigurationSucceeded: function(result) {
        var me = this;

        me._elementsService.configuration = result.data.userData.configuration;
        me._elementsService.configuration.company = result.data.company.secret;

        me._sources = result.data.userData.configuration.sources;
        me._target = result.data.userData.configuration.target;

        if (me._cloudElementsUtils.isEmpty(me._sources)) {
            // TODO: Throw an error here.
            console.log("No source elements configured.");
            return;
        }

        if (me._cloudElementsUtils.isEmpty(me._target)) {
            // TODO: Throw an error here.
            console.log("No target element configured.");
            return;
        }

        return me._elementsService.loadUserConfiguration().then(
          me._loadUserConfigurationSucceeded.bind(me),
          me._loadUserConfigurationFailed.bind(me));
    },

    _loadOrgConfigurationFailed: function(error) {
        console.log(error);
    },

    _loadUserConfigurationSucceeded: function(result) {
        var me = this;

        me._elementsService.configuration.user = result.data.secret;
        me._elementsService.populateServiceDetails();

        return me._elementsService.loadElementInstances().then(
            me._handleLoadElementIntanceSuccess.bind(me),
            me._handleLoadError.bind(me) );
    },

    _loadUserConfigurationFailed: function(error) {
        console.log(error);
    },

    _handleLoadElementIntanceSuccess:function(result){

        var me = this;

        //Filtering out only for Marketing
        me._elementInstances = new Object;
        for (var i = 0; i < result.data.length; i++){

            var inst = result.data[i];

            for (var j = 0; j <  me._sources.length; j++) {
                var source = me._sources[j];

                if (source.elementKey == inst.element.key) {
                    this._elementInstances[inst.element.key] = inst;
                }
            }

            // if (inst.element.hub == 'marketing' || inst.element.key == 'zendesk') { //TODO Hardcoding for zendesk, but need a better approach
                // this._elementInstances[inst.element.key] = inst;
            // }
        }

        this._notifications.notify(bulkloader.events.ELEMENT_INSTANCES_LOAD);

        return this._elementInstances;
    },

    _getElementConfig: function(elementKey) {

        var me = this;

        if (me._target.elementKey == elementKey) {
            return me._target;
        }

        for (var i in me._sources) {
          var source = me._sources[i];

            if (source.elementKey == elementKey) {
                return source;
            }
        }

        return null;
    },

    getOAuthUrl: function(elementKey) {
        var me = this;

        namespace('bulkloader.Picker').oauthElementKey = elementKey;

        var elementConfig = me._getElementConfig(elementKey);

        if (me._cloudElementsUtils.isEmpty(elementConfig)) {
            // TODO: Throw an error
            console.log("Element config for elementKey: " + elementKey + " not found.");
            return;
        }

        return me._elementsService.getOAuthUrl(elementConfig).then(
            me._handleGetOauthUrl.bind(me),
            me._handleLoadError.bind(me) );
    },

    _handleGetOauthUrl:function(result){
        return result.data.oauthUrl;
    },

    onOauthResponse: function(pagequery) {
        var me = this;

        var pageParameters = me._cloudElementsUtils.getParamsFromURI(pagequery);
        var not_approved= pageParameters.not_approved;

        if(not_approved) {
            // TODO Show that not approved
            return;
        }

        var elementKey  = bulkloader.Picker.oauthElementKey;
        var elementConfig = me._getElementConfig(elementKey);

        if (me._cloudElementsUtils.isEmpty(elementConfig)) {
            // TODO: Throw an error
            console.log("Element config for elementKey: " + elementKey + " not found.");
            return;
        }

        // VSJ return me._elementsService.createInstance(
                // VSJ elementKey,
                // VSJ pageParameters.code,
                // VSJ elementConfig.apiKey,
                // VSJ elementConfig.apiSecret,
                // VSJ elementConfig.callbackUrl)
        return me._elementsService.createInstance(elementConfig, pageParameters.code).then(
            me._handleOnCreateInstance.bind(me),
            me._handleLoadError.bind(me) );
    },

    _handleOnCreateInstance: function(response) {
        var me = this;

        //Adding the newly created instance to _elementInstances
        me._elementInstances[bulkloader.Picker.oauthElementKey] = response.data;

        //Notifying for new element instance creation
        me._notifications.notify(bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED);

        return response.data;
    },

    getTargetElementKey: function() {
        var me = this;

        if (me._cloudElementsUtils.isEmpty(me._target) == false) {
            return me._target.elementKey;
        } else {
            return null;
        }
    }
});


/**
 * Picker Factory object creation
 *
 */
(function (){

    var PickerObject = Class.extend({

        instance: new Picker(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications',function(CloudElementsUtils, ElementsService, Notifications){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Picker',PickerObject);
}());

Picker.onOauthResponse = function(pagequery) {
    var me = this;
    console.log(pagequery);
    angular.element('body').injector().get('Picker').onOauthResponse(pagequery);
};

/**
 * Picker factor class as an helper to picker controller.
 *
 *
 * @author Ramana
 */


bulkloader.events.ELEMENT_INSTANCES_LOAD = 'ELEMENT_INSTANCES_LOAD';
bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED = 'NEW_ELEMENT_INSTANCE_CREATED';
bulkloader.events.SHOW_SCHEDULER = 'SHOW_SCHEDULER';
bulkloader.events.SHOW_MASK = 'SHOW_MASK';
bulkloader.events.ERROR = 'PICKER_ERROR';
bulkloader.events.SCHEDULE_ERROR = 'SCHEDULE_ERROR';
bulkloader.events.SHOW_CREATEINSTANCE = 'SHOW_CREATEINSTANCE';
bulkloader.events.CONFIGURATION_LOAD = 'CONFIGURATION_LOAD';
bulkloader.events.CREDENTIALS_EXPIRED = 'CREDENTIALS_EXPIRED';
bulkloader.events.CONFIGURATION_LOADED = 'CONFIGURATION_LOADED';

namespace('bulkloader.Picker').oauthElementKey = null;

var Picker = Class.extend({
    _elementsService: null,
    _application: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _elementInstances: null,
    _sources: null,
    _targets: null,
    _target: null,
    _appname: null,
    selectedElementInstance: null,
    targetElementInstance: null,

    _handleLoadError: function(error) {
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

    handleConfigurationSetUp: function(result) {
        var me = this;
        me._application.loadConfiguration(result.data);
        me._notifications.notify(bulkloader.events.CONFIGURATION_LOADED);
        me._sources = result.data.userData.configuration.sources;
        me._targets = result.data.userData.configuration.targets;
        me._appname = result.data.name;
        if(me._targets && me._targets.length == 1) {
            me._target = result.data.userData.configuration.targets[0];
        }

        return me.validateConfiguration();
    },

    validateConfiguration: function() {
        var me = this;

        // allow for no targets to support CAaaS
        if(me._cloudElementsUtils.isEmpty(me._sources)) {
            // Throw an error here.
            me._notifications.notify(bulkloader.events.ERROR, "No source elements configured.");
            return false;
        }

        return true;
    },

    _loadOrgConfigurationSucceeded: function(result) {
        var me = this;

        me.handleConfigurationSetUp(result);

        if(!me.validateConfiguration()) {
            return;
        }

        return me._elementsService.loadUserConfiguration().then(
            me._loadUserConfigurationSucceeded.bind(me),
            me._loadUserConfigurationFailed.bind(me));
    },

    _loadOrgConfigurationFailed: function(error) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(error.data)) {
            me._notifications.notify(bulkloader.events.ERROR,
                "Could not retrieve application configuration for organization.");
        } else {
            me._notifications.notify(bulkloader.events.ERROR,
                    "Could not retrieve application configuration for organization. " + error.data.message);
        }
    },

    _loadUserConfigurationSucceeded: function(result) {
        var me = this;

        me._application.configuration.user = result.data.secret;
        return true;
    },

    _loadUserConfigurationFailed: function(error) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, "Could not load user configuration. " + error.data.message);
    },

    loadElementInstances: function(result) {
        var me = this;

        return me._elementsService.loadElementInstances().then(
            me._handleLoadElementIntancesSuccess.bind(me),
            me._handleLoadError.bind(me));
    },

    _handleLoadElementIntancesSuccess: function(result) {

        var me = this;

        // Add only the sources and targets to the instance list.
        me._elementInstances = new Object;

        for(var i = 0; i < result.data.length; i++) {
            var continueNext = true;
            var inst = result.data[i];
            for(var j = 0; j < me._sources.length; j++) {
                var source = me._sources[j];

                if(source.elementKey == inst.element.key) {
                    me._elementInstances[inst.element.key] = inst;
                    continueNext = false;
                    break;
                }
            }

            if(continueNext == true && me._targets) {
                for(var j = 0; j < me._targets.length; j++) {
                    var target = me._targets[j];

                    if(target.elementKey == inst.element.key) {
                        me._elementInstances[inst.element.key] = inst;

                        if(!me._cloudElementsUtils.isEmpty(me._target)
                            && me._cloudElementsUtils.isEmpty(me._target.token) == false
                            && me._target.token == inst.token) {
                            me.targetElementInstance = inst;
                        }

                        break;
                    }
                }
            }
        }

        if(!me._cloudElementsUtils.isEmpty(me._target)
            && me._application.getView() == 'datalist'
            && me._cloudElementsUtils.isEmpty(me.targetElementInstance)) {
            //Create a dummy targetElementInstance to be used all the places
            me.targetElementInstance = new Object();
            me.targetElementInstance.token = me._target.token;
            me.targetElementInstance.element = me._target;
        }

        this._notifications.notify(bulkloader.events.ELEMENT_INSTANCES_LOAD);

        return this._elementInstances;
    },

    _findElementFrom: function(elements, elementKey) {
        for(var i in elements) {
            var src = elements[i];
            if(src.elementKey == elementKey) {
                return src;
            }
        }

        return null;
    },

    getElementConfig: function(elementKey, selection) {

        var me = this;

        if(!me._cloudElementsUtils.isEmpty(me._target)
            && me._target.elementKey == elementKey) {
            return me._target;
        }

        if(me._cloudElementsUtils.isEmpty(selection)) {
            var element = me._findElementFrom(me._sources, elementKey);
            if(element == null) {
                element = me._findElementFrom(me._targets, elementKey);
            }
            return element;
        }
        else if(selection == 'source') {
            return me._findElementFrom(me._sources, elementKey);
        } else {
            return me._findElementFrom(me._targets, elementKey);
        }
        return null;
    },

    getElementObjectDetails: function(elementKey, selection, objectName) {
        var me = this;

        var elementConfig = me.getElementConfig(elementKey, selection);
        if(me._cloudElementsUtils.isEmpty(elementConfig.objects)) {
            return null;
        }

        for(var i = 0; i < elementConfig.objects.length; i++) {
            var obj = elementConfig.objects[i];

            if(obj.vendorPath === objectName) {
                return obj;
            }
        }

        return null;
    },

    getOAuthUrl: function(elementKey, selection, instance) {
        var me = this;

        //Adding the logic to be consistent for OAuth1 nd OAuth2 flows irrespective of authentication Types
        // 1) Get request token
        // 2) Get Oauth URL


        namespace('bulkloader.Picker').oauthElementKey = elementKey;
        namespace('bulkloader.Picker').oauthElementInstance = instance;

        var elementConfig = me.getElementConfig(elementKey, selection);

        if(me._cloudElementsUtils.isEmpty(elementConfig)) {
            // Throw an error
            me._notifications.notify(bulkloader.events.ERROR, "Element config for elementKey: " + elementKey + " not found.");
            return;
        }

        if(elementConfig.oauth1 == true) {
            return me._makeOAuthRequestTokenCall(elementConfig);
        } else {
            return me._makeOAuthUrlCall(elementConfig);
        }

    },

    _makeOAuthRequestTokenCall: function(elementConfig) {
        var me = this;

        return me._elementsService.getOAuthRequestToken(elementConfig).then(
            me._handleGetOauthRequestToken.bind(me, elementConfig),
            me._handleGetOauthRequestTokenError.bind(me, elementConfig));
    },

    _handleGetOauthRequestTokenError: function(elementConfig, err) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, "Error getting OAuth information");
    },

    _handleGetOauthRequestToken: function(elementConfig, result) {
        var me = this;

        if(!me._cloudElementsUtils.isEmpty(result.data)) {
            if(me._cloudElementsUtils.isEmpty(elementConfig.other)) {
                elementConfig.other = new Object();
            }
            elementConfig.other['secret'] = result.data.secret;
            elementConfig.other['requestToken'] = result.data.token;
        }

        return me._makeOAuthUrlCall(elementConfig);
    },

    _makeOAuthUrlCall: function(elementConfig) {
        var me = this;

        return me._elementsService.getOAuthUrl(elementConfig).then(
            me._handleGetOauthUrl.bind(me),
            me._handleGetOauthUrlError.bind(me));
    },
    _handleGetOauthUrlError: function(err) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, "Error getting OAuth information");
    },

    _handleGetOauthUrl: function(result) {
        return result.data.oauthUrl;
    },

    onOauthResponse: function(pagequery) {
        var me = this;

        var pageParameters = me._cloudElementsUtils.getParamsFromURI(pagequery);
        var not_approved = pageParameters.not_approved;

        if(not_approved) {
            // Show that not approved
            me._notifications.notify(bulkloader.events.ERROR, "Not authorized to access the " + bulkloader.Picker.oauthElementKey + " information");
            return;
        }

        me._notifications.notify(bulkloader.events.SHOW_MASK, 'Connecting...');
        var elementKey = bulkloader.Picker.oauthElementKey;
        var elementConfig = me.getElementConfig(elementKey);

        if(me._cloudElementsUtils.isEmpty(elementConfig)) {
            //Throw an error
            me._notifications.notify(bulkloader.events.ERROR, "Element config for elementKey: " + bulkloader.Picker.oauthElementKey + " not found.");
            return;
        }

        var methodType = 'POST';
        var insId = null;
        if(!me._cloudElementsUtils.isEmpty(bulkloader.Picker.oauthElementInstance)) {
            var methodType = 'PUT';
            var insId = bulkloader.Picker.oauthElementInstance.id;
        }

        if(elementConfig.oauth1 == true) {
            pageParameters.secret = elementConfig.other.secret;
        }

        return me._elementsService.createInstance(elementConfig, pageParameters, insId, methodType).then(
            me._handleOnCreateInstance.bind(me, bulkloader.Picker.oauthElementKey),
            me._handleOnCreateInstanceFailed.bind(me));
    },

    _handleOnCreateInstance: function(elementKey, response) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me._elementInstances)) {
            me._elementInstances = new Object();
        }
        //Adding the newly created instance to _elementInstances
        me._elementInstances[elementKey] = response.data;

        bulkloader.Picker.oauthElementKey = elementKey;

        //Check to see if the instance is from target, if so set it to the target
        me.setTargetElement(elementKey);

        //Notifying for new element instance creation
        me._notifications.notify(bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED);

        return response.data;
    },

    _handleOnCreateInstanceFailed: function(error) {
        var me = this;

        me._notifications.notify(bulkloader.events.ERROR, 'Provisioning failed. ' + error.data.message);
    },

    deleteInstance: function(instance) {
        var me = this;

        return me._elementsService.deleteInstance(instance).then(
            me._handleOnDeleteInstance.bind(me),
            me._handleOnDeleteInstanceFailed.bind(me));
    },

    _handleOnDeleteInstance: function(response) {
        var me = this;
        return true;
    },

    _handleOnDeleteInstanceFailed: function(error) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, 'Error occurred while removing the connection to application. ' + error.data.message);
    },

    getSourceElement: function(elementKey) {
        var me = this;

        for(var i in me._sources) {
            var src = me._sources[i];
            if(src.elementKey == elementKey) {
                return src;
                break;
            }
        }
    },

    getTargetElement: function(elementKey) {
        var me = this;

        for(var i in me._targets) {
            var src = me._targets[i];
            if(src.elementKey == elementKey) {
                return src;
                break;
            }
        }
    },

    setTargetElement: function(elementKey) {
        var me = this;

        for(var i in me._targets) {
            var target = me._targets[i];
            if(target.elementKey == elementKey) {
                me._target = target;
                break;
            }
        }
    },

    getTarget: function() {
        var me = this;
        return me._target;
    },

    setTargetElementInstance: function(instance) {
        var me = this;
        me.targetElementInstance = instance;
    },

    getTargetElementKey: function() {
        var me = this;

        if(!me._cloudElementsUtils.isEmpty(me._target)) {
            return me._target.elementKey;
        } else {
            return null;
        }
    },

    getTargetToken: function() {
        var me = this;
        return me._target.token;
    },

    getTargetElementBulkSequence: function(elementKey) {
        var me = this;
        var target = null;
        for(var i in me._targets) {
            target = me._targets[i];
            if(target.elementKey == elementKey) {
                break;
            }
        }
        return target.bulkSequence;
    },

    getSubscription: function(){
        var me = this;
        return me._appname;
    }
});

/**
 * Picker Factory object creation
 *
 */
(function() {

    var PickerObject = Class.extend({

        instance: new Picker(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Application', 'Notifications', function(CloudElementsUtils, ElementsService, Application, Notifications) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._application = Application;
            this.instance._notifications = Notifications;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Picker', PickerObject);
}());

Picker.onOauthResponse = function(pagequery) {
    var me = this;
    console.log(pagequery);
    angular.element('body').injector().get('Picker').onOauthResponse(pagequery);
};

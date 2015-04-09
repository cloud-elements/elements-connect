/**
 * Picker factor class as an helper to picker controller.
 *
 *
 * @author Ramana
 */


bulkloader.events.ELEMENT_INSTANCES_LOAD = 'ELEMENT_INSTANCES_LOAD';
bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED = 'NEW_ELEMENT_INSTANCE_CREATED';
bulkloader.events.SHOW_SCHEDULER = 'SHOW_SCHEDULER';

namespace('bulkloader.Picker').oauth_elementkey = null;

//TODO Handle this in getting from server ? or BETTER PLACE
namespace('bulkloader.Picker').element_config = {
//    'sfdcmarketingcloud': {
//        'apiKey': '3MVG9A2kN3Bn17huqpbZ.99EPdg6iSfUR6FDLPLdNNvH7GR4VwtTxeXp5lwZ0d0T2VvCONC9.9IAoK.AhQ1z5',
//        'apiSecret': '195234918550961596',
//        //'callbackUrl': 'http://localhost:5050/elements/bulkloader/src/main/webapp/callback.html'
//        'callbackUrl': 'http://localhost:8080/elements/jsp/home.jsp'
//    },
    'sfdcmarketingcloud': {
        'apiKey': '3MVG9A2kN3Bn17huqpbZ.99EPdnzcp5leL0mj3PVpla3.O4Og_EXtlXB5mqHLu2AfxEddiEePAZeLJnVtPOCt',
        'apiSecret': '6296652270040031879',
        'callbackUrl': 'http://localhost:63342/bulkloader.io/src/main/webapp/callback.html'
    },
    'hubspot': {
        'apiKey': 'b3cfc27a-c1eb-11e4-bfd2-dfe79242b34f',
        'apiSecret': '437644',
        'callbackUrl': 'http://localhost:63342/bulkloader.io/src/main/webapp/callback.html'
    },
    'eloqua': {
        'apiKey': '5f372670-c31f-42d4-a2d6-a28d09ec9cf1',
        'apiSecret': '1~Aix3X30ZkqqL6qxgp00hCg1NEcBVCPtsR7VE3WtgyPeDdg9fwzqw9g8Qb~c0iwICOI0S7~6ff72vVcw-bJ7KO7hJhkkFkM9-wB',
        'callbackUrl': 'https://eloqua.ngrok.com/bulkloader.io/src/main/webapp/callback.html'
    },
    'marketo' : {
        'apiKey': '282923532784-mkr3pp81hpg3haqac31ki6fosbs66npk.apps.googleusercontent.com',
        'apiSecret': 'uBdvo1WM2jTu2H33utjDd5v0',
        'callbackUrl': 'http://localhost:63342/bulkloader.io/src/main/webapp/callback.html'
    },
    'zendesk' : {
        'apiKey': 'cloud_elements_dev',
        'apiSecret': '3faac7d75a836174d3de00b5c0274be6585ccb82b1540d0d486918756d6e3576',
        'callbackUrl': 'http://localhost:63342/bulkloader.io/src/main/webapp/callback.html'
    }
};

var Picker = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,
    _elementInstances: null,
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

        //Filtering out only for Marketing
        this._elementInstances = new Object;
        for(var i=0; i <result.data.length; i++){
            var inst = result.data[i];
            if(inst.element.hub == 'marketing' || inst.element.key == 'zendesk') { //TODO Hardcoding for zendesk, but need a better approach
                this._elementInstances[inst.element.key] = inst;
            }
        }
        this._notifications.notify(bulkloader.events.ELEMENT_INSTANCES_LOAD);

        return this._elementInstances;
    },

    getOAuthUrl: function(elementKey) {
        var me = this;

        namespace('bulkloader.Picker').oauth_elementkey = elementKey;

        var elementConfigs = bulkloader.Picker.element_config[elementKey];
        return me._elementsService.getOAuthUrl(
                elementKey,
                elementConfigs.apiKey,
                elementConfigs.apiSecret,
                elementConfigs.callbackUrl)
            .then(
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

        var elementKey  = bulkloader.Picker.oauth_elementkey;
        var elementConfigs = bulkloader.Picker.element_config[elementKey];

        return me._elementsService.createInstance(
                elementKey,
                pageParameters.code,
                elementConfigs.apiKey,
                elementConfigs.apiSecret,
                elementConfigs.callbackUrl)
            .then(
            me._handleOnCreateInstance.bind(me),
            me._handleLoadError.bind(me) );
    },

    _handleOnCreateInstance: function(response) {
        var me = this;

        //Adding the newly created instance to _elementInstances
        me._elementInstances[bulkloader.Picker.oauth_elementkey] = response.data;

        //Notifying for new element instance creation
        me._notifications.notify(bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED);

        return response.data;
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

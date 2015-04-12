/**
 * Elements service, bridge the gap between Elements API and application.
 *
 * @author Ramana
 */
var ElementsService = Class.extend({

    instanceId: null,
    _cloudElementsUtils:null,
    _environment: null,
    selectedObjectName: null,
    newobject: false,
    configuration: null,

    /**
     * Initialize Service Properties
     */
    init: function(){
    },

    populateServiceDetails: function() {


        //Read the URL arguments for Orgnaization and User secrets and selected element instanceId
        var pageParameters = this._cloudElementsUtils.pageParameters();
        if(!this._cloudElementsUtils.isEmpty(pageParameters.configuration)) {
            this.configuration = angular.fromJson(pageParameters.configuration);
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.user)) {
            this.configuration.user = pageParameters.user;
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.company)) {
            this.configuration.company = pageParameters.company;
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.defaultAccount)) {
            this.configuration.defaultAccount = pageParameters.defaultAccount;
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.accountName)) {
            this.configuration.accountName = decodeURI(pageParameters.accountName);
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.accountId)) {
            this.configuration.accountId = pageParameters.accountId;
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.instanceId)) {
            this.instanceId = pageParameters.instanceId;
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.objectName)) {
            this.selectedObjectName = pageParameters.objectName;
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.env)) {
            this.ENV_URL = pageParameters.env;
        }

        if(this._cloudElementsUtils.isEmpty(this.ENV_URL)) {
            this.ENV_URL = '/elements/api-v2/';
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.newobject)) {
            this.newobject = pageParameters.newobject;
        }
    },

    loadOrgConfiguration: function() {
        var me = this;

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + me._environment.apiKey
        }

        var url = me._environment.elementsUrl + '/applications';

        return me._httpGet(url, headers);
    },

    loadUserConfiguration: function() {

        var me = this;

        var headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Organization ' + me.configuration.company + ', UserId ' + me._environment.userId
        }

        var url = me._environment.elementsUrl + '/applications/users';

        return me._httpGet(url, headers);
    },


    _getHeaders: function(token) {
        var headers = null;

        if(token == null || token== undefined)
        {
            headers = {
                'Authorization' : 'User '+this.configuration.user+', Organization '+ this.configuration.company,
                'Content-Type'  : 'application/json'
            }
        }
        else
        {
            headers = {
                'Authorization' : 'Element '+token+', User '+this.configuration.user+', Organization '+ this.configuration.company,
                'Content-Type'  : 'application/json'
            }
        }
        return headers;
    },

    /**
     * Query server and returns element instances
     * @return Service handler
     */
    loadElementInstances:function(){
        var url = this._environment.elementsUrl + '/instances';
        return this._httpGet(url,this._getHeaders());
    },

    getOAuthUrl: function(elementKey, apiKey, apiSec, callbackUrl) {
        var me = this;

        var parameters = {
            'elementKeyOrId': elementKey,
            'apiKey' : apiKey,
            'apiSecret': apiSec,
            'callbackUrl': callbackUrl
        };

        if (!me._cloudElementsUtils.isEmpty(me.configuration.siteAddress)) {
            parameters['siteAddress'] = me.configuration.siteAddress;
        }

        var url = this._environment.elementsUrl + '/elements/' + elementKey + '/oauth/url';

        return this._httpGet(url,this._getHeaders(), parameters);
    },

    createInstance: function(elementKey, code, apiKey, apiSec, callbackUrl) {
        var me = this;

        var elementProvision = {
            'configuration': {
                'oauth.api.key' : apiKey,
                'oauth.api.secret' : apiSec,
                'oauth.callback.url': callbackUrl
            },
            'providerData': {
                'code': code
            },
            'element': {
                "key" : elementKey
            },
            'name': elementKey
        };

        if(!me._cloudElementsUtils.isEmpty(me.configuration.siteAddress)) {
            elementProvision.configuration['zendesk.subdomain'] = me.configuration.siteAddress; //TODO Hardcoded for zendesk
        }

        return this._httpPost(this._environment.elementsUrl + '/instances/', this._getHeaders(), elementProvision);
    },

    loadElementDefaultTransformations:function(elementInstance){
        var url = this._environment.elementsUrl + '/elements/' + elementInstance.element.key + '/transformations';
        return this._httpGet(url,this._getHeaders());
    },


    /**
     * Query server and returns element instance Objects
     * @return Service handler
     */
    loadInstanceObjects:function(elementInstance){

        var url = this._environment.elementsUrl + '/hubs/' + elementInstance.element.hub + '/objects';
        return this._httpGet(url,this._getHeaders(elementInstance.token));
    },

    loadInstanceObjectDefinitions: function(elementInstance) {
        var url = this._environment.elementsUrl + '/instances/' + elementInstance.id + '/objects/definitions';
        return this._httpGet(url, this._getHeaders());
    },

    loadAccountObjectDefinitions: function() {
        var url = this._environment.elementsUrl + '/accounts/objects/definitions';
        return this._httpGet(url,this._getHeaders());
    },

    loadOrganizationsObjectDefinitions: function() {
        var url = this._environment.elementsUrl + '/organizations/objects/definitions';
        return this._httpGet(url,this._getHeaders());
    },

    loadAccounts: function() {
        var url = this._environment.elementsUrl + '/accounts?where=type=\'CompanyAccount\'';
        return this._httpGet(url,this._getHeaders());
    },

    /**
     * Query server and returns Object metadata
     * @return Service handler
     */
    loadObjectMetaData:function(elementInstance, objectName){

        var url = this._environment.elementsUrl + '/hubs/' + elementInstance.element.hub + '/objects/' + objectName + '/metadata';

        return this._httpGet(url,this._getHeaders(elementInstance.token));
    },

    loadInstanceTransformations:function(elementInstance){

        // /instances/{id}/transformations
        var url = this._environment.elementsUrl + '/instances/{id}/transformations';
        url = url.replace('{id}', elementInstance.id);

        return this._httpGet(url,this._getHeaders());
    },

    loadAccountTransformations:function(elementInstance, account){

        //  /accounts/{id}/elements/{key}/transformations
        var url = this._environment.elementsUrl + '/accounts/{id}/elements/{key}/transformations';
        url = url.replace('{id}', account.id);
        url = url.replace('{key}', elementInstance.element.key);
        return this._httpGet(url,this._getHeaders());
    },

    loadOrganizationTransformations:function(elementInstance){
        //  /organizations/elements/{key}/transformations
        var url = this._environment.elementsUrl + '/organizations/elements/{key}/transformations';
        url = url.replace('{key}', elementInstance.element.key);

        return this._httpGet(url,this._getHeaders());
    },

    findAllObjectTransformations: function(objectName, scope, account) {

        var url = this._environment.elementsUrl + '/organizations/objects/{objectName}/transformations';

        if (scope !='organization') {
            url = this._environment.elementsUrl + '/accounts/{id}/objects/{objectName}/transformations';
            url = url.replace('{id}', account.id);
        }

        url = url.replace('{objectName}', objectName);

        return this._httpGet(url,this._getHeaders());
    },

    saveObjectDefinition: function(selectedInstance, objectName, objectDefinition, scope, methodType) {

        // /organizations/objects/{objectName}/definitions
        // /accounts/{id}/objects/{objectName}/definitions

        var url;

        if (scope == 'organization') {
            url = this._environment.elementsUrl + '/organizations/objects/{objectName}/definitions';
        }
        else if (scope == 'account') {
            url = this._environment.elementsUrl + '/accounts/objects/{objectName}/definitions';
        }
        else if (scope == 'instance') {
            url = this._environment.elementsUrl + '/instances/' + selectedInstance.id + '/objects/{objectName}/definitions';
        }

        url = url.replace('{objectName}', objectName);

        if(methodType == 'POST') {
            return this._httpPost(url, this._getHeaders(), objectDefinition);
        }
        else {
            return this._httpPut(url, this._getHeaders(), objectDefinition);
        }
    },

    saveObjectTransformation: function(elementInstance, objectName, objectTransformation, scope, methodType) {

        //  /organizations/elements/{key}/transformations
        //  /accounts/{id}/elements/{key}/transformations
        // /instances/{id}/transformations

        var url = null;
        if(scope == 'organization') {
            url = this._environment.elementsUrl + '/organizations/elements/{key}/transformations/{objectName}';
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        }
        else if(scope == 'instance') {
            url = this._environment.elementsUrl + '/instances/{id}/transformations/{objectName}';
            url = url.replace('{id}', elementInstance.id);
            url = url.replace('{objectName}', objectName);
        }
        else {
            url = this._environment.elementsUrl + '/accounts/{id}/elements/{key}/transformations/{objectName}';
            url = url.replace('{id}', scope); //The scope that comes is account id
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        }

        if(methodType == 'POST') {
            return this._httpPost(url, this._getHeaders(), objectTransformation);
        }
        else {
            return this._httpPut(url, this._getHeaders(), objectTransformation);
        }
    },

    deleteObjectTransformation: function(elementInstance, account, objectName, scope) {

        //DELETE /organizations/elements/{key}/transformations/{objectName}
        //DELETE /accounts/{id}/elements/{key}/transformations/{objectName}
        //DELETE /instances/{id}/transformations/{objectName}

        var url = null;
        if(scope == 'organization') {
            url = this._environment.elementsUrl + '/organizations/elements/{key}/transformations/{objectName}';
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        }
        else if(scope == 'instance') {
            url = this._environment.elementsUrl + '/instances/{id}/transformations/{objectName}';
            url = url.replace('{id}', elementInstance.id);
            url = url.replace('{objectName}', objectName);
        }
        else {
            url = this._environment.elementsUrl + '/accounts/{id}/elements/{key}/transformations/{objectName}';
            url = url.replace('{id}', scope); //The scope that comes is account id
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        }

        return this._httpDelete(url, this._getHeaders());
    },

	  /**
	   * Query server and returns Object metadata
	   * @return Service handler
	   */
	  scheduleJob: function(elementInstance, job){

        var url = this._environment.elementsUrl + '/hubs/' + elementInstance.element.hub + '/bulk/workflows';

		    return this._httpPost(url, this._getHeaders(elementInstance.token), job);
	  },

    _httpGet: function(url, headers, data) {

        return this.$http({
            url: url,
            method: 'GET',
            headers: headers,
            params: data
        });
    },

    _httpPost: function(url, headers, data) {

        return this.$http({
            url: url,
            method: 'POST',
            headers: headers,
            data: data
        });
    },

    _httpPut: function(url, headers, data) {

        return this.$http({
            url: url,
            method: 'PUT',
            headers: headers,
            data: data
        });
    },

    _httpDelete: function(url, headers) {

        return this.$http({
            url: url,
            method: 'DELETE',
            headers: headers
        });
    }
});



/**
 * Datamappers Service object creation
 *
 */
(function (){

	var ElementsServiceObject = Class.extend({

		instance: new ElementsService(),

		/**
    	 * Initialize and configure
     	*/
		$get:['$http', 'ENV', 'CloudElementsUtils', function($http, ENV, CloudElementsUtils){
			this.instance.$http = $http;
      this.instance._cloudElementsUtils = CloudElementsUtils;
      this.instance._environment = ENV;

			return this.instance;
		}]
	})

	angular.module('bulkloaderApp')
		.provider('ElementsService',ElementsServiceObject);
}());

/**
 * Elements service, bridge the gap between Elements API and application.
 *
 * @author Ramana
 */
var ElementsService = Class.extend({

    instanceId: null,
    _cloudElementsUtils:null,
    selectedObjectName: null,
    newobject: false,

//    ENV_URL: 'https://staging.cloud-elements.com/elements/api-v2/',
//    secrets:{
//        'user' : 'd40be3adf0245cfda60ec696ffd95338',
//        'company': '98c89f16608df03b0248b74ecaf6a79b'
//    },

    //ENV_URL: 'https://qa.cloud-elements.com/elements/api-v2/',
    //secrets:{
    //    'user' : '846708bb4a1da71d70286bc5bb0c51bf',
    //    'company': '98c89f16608df03b0248b74ecaf6a79b'
    //},

  ENV_URL: 'http://localhost:4040/elements/api-v2/',
  secrets:{
      'user' : '73dc58d0c8e5230dc4f59384ba0ead3e',
      'company': '672aa88bb4e3235091de77900e3e299b'
  },


//    ENV_URL: 'http://localhost:5050/elements/api-v2/',
//    secrets:{
//        'user' : 'CtRMK6ISlVJ0LH8pL8DX6I1lRVTDhMtF2Ofk7CTJuy8=',
//        'company': 'e8f910e423f9c34306027dfd147047e8'
//    },

//    ENV_URL:null,
//    secrets:null,

    /**
     * Initialize Service Properties
     */
    init:function(){

    },

    populateServiceDetails: function() {

        //Read the URL arguments for Orgnaization and User secrets and selected element instanceId
        var pageParameters = this._cloudElementsUtils.pageParameters();
        if(!this._cloudElementsUtils.isEmpty(pageParameters.secrets)) {
            this.secrets = angular.fromJson(pageParameters.secrets);
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.user)) {
            this.secrets.user = pageParameters.user;
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.company)) {
            this.secrets.company = pageParameters.company;
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.defaultAccount)) {
            this.secrets.defaultAccount = pageParameters.defaultAccount;
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.accountName)) {
            this.secrets.accountName = decodeURI(pageParameters.accountName);
        }

        if(!this._cloudElementsUtils.isEmpty(pageParameters.accountId)) {
            this.secrets.accountId = pageParameters.accountId;
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

    _getHeaders: function(token) {
        var headers = null;

        if(token == null || token== undefined)
        {
            headers = {
                'Authorization' : 'User '+this.secrets.user+', Organization '+ this.secrets.company,
                'Content-Type'  : 'application/json'
            }
        }
        else
        {
            headers = {
                'Authorization' : 'Element '+token+', User '+this.secrets.user+', Organization '+ this.secrets.company,
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
        var url = this.ENV_URL+'instances';
        return this._httpGet(url,this._getHeaders());
    },

    getOAuthUrl: function(elementKey, apiKey, apiSec, callbackUrl) {

        var parameters = {
            'elementKeyOrId': elementKey,
            'apiKey' : apiKey,
            'apiSecret': apiSec,
            'callbackUrl': callbackUrl
        };

        var url = this.ENV_URL+'elements/'+elementKey+'/oauth/url';

        return this._httpGet(url,this._getHeaders(), parameters);
    },

    createInstance: function(elementKey, code, apiKey, apiSec, callbackUrl) {

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

        return this._httpPost(this.ENV_URL+'instances/', this._getHeaders(), elementProvision);
    },

    loadElementDefaultTransformations:function(elementInstance){
        var url = this.ENV_URL+'elements/'+elementInstance.element.key+'/transformations';
        return this._httpGet(url,this._getHeaders());
    },


    /**
     * Query server and returns element instance Objects
     * @return Service handler
     */
    loadInstanceObjects:function(elementInstance){

        var url = this.ENV_URL+'hubs/'+elementInstance.element.hub+'/objects';
        return this._httpGet(url,this._getHeaders(elementInstance.token));
    },

    loadAccountObjectDefinitions: function() {
        var url = this.ENV_URL+'accounts/objects/definitions';
        return this._httpGet(url,this._getHeaders());
    },

    loadOrganizationsObjectDefinitions: function() {
        var url = this.ENV_URL+'organizations/objects/definitions';
        return this._httpGet(url,this._getHeaders());
    },

    loadAccounts: function() {
        var url = this.ENV_URL+'accounts?where=type=\'CompanyAccount\'';
        return this._httpGet(url,this._getHeaders());
    },

    /**
     * Query server and returns Object metadata
     * @return Service handler
     */
    loadObjectMetaData:function(elementInstance, objectName){

        var url = this.ENV_URL+'hubs/'+elementInstance.element.hub+'/objects/'+objectName+'/metadata';

        return this._httpGet(url,this._getHeaders(elementInstance.token));
    },

    loadInstanceTransformations:function(elementInstance){

        // /instances/{id}/transformations
        var url = this.ENV_URL+'instances/{id}/transformations';
        url = url.replace('{id}', elementInstance.id);

        return this._httpGet(url,this._getHeaders());
    },

    loadAccountTransformations:function(elementInstance, account){

        //  /accounts/{id}/elements/{key}/transformations
        var url = this.ENV_URL+'accounts/{id}/elements/{key}/transformations';
        url = url.replace('{id}', account.id);
        url = url.replace('{key}', elementInstance.element.key);
        return this._httpGet(url,this._getHeaders());
    },

    loadOrganizationTransformations:function(elementInstance){
        //  /organizations/elements/{key}/transformations
        var url = this.ENV_URL+'organizations/elements/{key}/transformations';
        url = url.replace('{key}', elementInstance.element.key);

        return this._httpGet(url,this._getHeaders());
    },

    findAllObjectTransformations: function(objectName, scope, account) {

        var url = this.ENV_URL+'organizations/objects/{objectName}/transformations';
        if(scope !='organization') {
            url = this.ENV_URL+'accounts/{id}/objects/{objectName}/transformations';
            url = url.replace('{id}', account.id);
        }
        url = url.replace('{objectName}', objectName);

        return this._httpGet(url,this._getHeaders());
    },

    saveObjectDefinition: function(objectName, objectDefinition, scope, methodType) {

        // /organizations/objects/{objectName}/definitions
        // /accounts/{id}/objects/{objectName}/definitions

        var url;
        if(scope == 'organization') {
            url = this.ENV_URL+'organizations/objects/{objectName}/definitions';
        }
        else {
            url = this.ENV_URL+'accounts/objects/{objectName}/definitions';
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
            url = this.ENV_URL+'organizations/elements/{key}/transformations/{objectName}';
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        }
        else if(scope == 'instance') {
            url = this.ENV_URL+'instances/{id}/transformations/{objectName}';
            url = url.replace('{id}', elementInstance.id);
            url = url.replace('{objectName}', objectName);
        }
        else {
            url = this.ENV_URL+'accounts/{id}/elements/{key}/transformations/{objectName}';
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
            url = this.ENV_URL+'organizations/elements/{key}/transformations/{objectName}';
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        }
        else if(scope == 'instance') {
            url = this.ENV_URL+'instances/{id}/transformations/{objectName}';
            url = url.replace('{id}', elementInstance.id);
            url = url.replace('{objectName}', objectName);
        }
        else {
            url = this.ENV_URL+'accounts/{id}/elements/{key}/transformations/{objectName}';
            url = url.replace('{id}', scope); //The scope that comes is account id
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        }

        return this._httpDelete(url, this._getHeaders());
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
		$get:['$http', 'CloudElementsUtils', function($http, CloudElementsUtils){
			this.instance.$http = $http;
            this.instance._cloudElementsUtils = CloudElementsUtils;

            this.instance.populateServiceDetails();
			return this.instance;
		}]
	})

	angular.module('bulkloaderApp')
		.provider('ElementsService',ElementsServiceObject);
}());

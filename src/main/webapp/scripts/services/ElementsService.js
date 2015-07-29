/**
 * Elements service, bridge the gap between Elements API and application.
 *
 * @author Ramana
 */
var ElementsService = Class.extend({

    _cloudElementsUtils: null,
    _application: null,

    /**
     * Initialize Service Properties
     */
    init: function() {
    },

    loadOrgConfiguration: function() {
        var me = this;

        var headers = {
            'Content-Type': 'application/json', 'Authorization': 'Bearer ' + me._application.environment.apiKey
        }

        var url = me._application.environment.elementsUrl + '/applications';

        return me._httpGet(url, headers);
    },

    loadUserConfiguration: function() {

        var me = this;

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Organization ' + me._application.configuration.company + ', UserId ' + me._application.environment.userId
        }

        var url = me._application.environment.elementsUrl + '/applications/users';

        return me._httpGet(url, headers);
    },

    loginAndloadConfiguration: function(email, password) {

        var me = this;

        if(me._cloudElementsUtils.isEmpty(password)) {
            password = email;
        }

        var headers = {
            'Content-Type': 'application/json',
            'Elements-User-Password': password
        }

        var url = me._application.environment.elementsUrl + '/applications/users/' + email;

        return me._httpGet(url, headers);
    },

    updatePassword: function(email, password, newpassword) {

        var me = this;

        var headers = {
            'Content-Type': 'application/json',
            'Elements-User-Password': password,
            'Elements-User-NewPassword': newpassword
        }

        var url = me._application.environment.elementsUrl + '/applications/users/' + email + '/updatepassword';
        return me._httpPatch(url, headers);
    },

    resetPassword: function(user) {
        var me = this;
        var headers = {
            'Content-Type': 'application/json'
        }

        var url = me._application.environment.elementsUrl + '/applications/users/' + user.email + '/reset';

        return me._httpPost(url, headers, user);
    },

    signup: function(user) {
        var me = this;
        var headers = {
            'Content-Type': 'application/json',
            'Elements-User-Password': user.password
        }

        var url = me._application.environment.elementsUrl + '/applications/users';
        return this._httpPost(url, headers, user);
    },

    _getHeaders: function(token) {
        var me = this;
        var headers = null;
        if(token == null || token == undefined) {
            headers = {
                'Authorization': 'User ' + me._application.configuration.user + ', Organization ' + me._application.configuration.company,
                'Content-Type': 'application/json'
            }
        } else {
            headers = {
                'Authorization': 'Element ' + token + ', User ' + me._application.configuration.user + ', Organization ' +
                    me._application.configuration.company, 'Content-Type': 'application/json'
            }
        }
        return headers;
    },

    /**
     * Query server and returns element instances
     * @return Service handler
     */
    loadElementInstances: function() {
        var url = this._application.environment.elementsUrl + '/instances';
        return this._httpGet(url, this._getHeaders());
    },

    getOAuthRequestToken: function(elementConfig) {
        var me = this;

        var parameters = {
            'elementKeyOrId': elementConfig.elementKey,
            'apiKey': elementConfig.apiKey,
            'apiSecret': elementConfig.apiSecret,
            'callbackUrl': elementConfig.callbackUrl
        };

        if(!me._cloudElementsUtils.isEmpty(elementConfig.siteAddress)){
            parameters.siteAddress = elementConfig.siteAddress;
        }

        if(me._cloudElementsUtils.isEmpty(elementConfig.other) == false) {
            for(key in elementConfig.other) {
                if(elementConfig.other.hasOwnProperty(key)) {
                    parameters[key] = elementConfig.other[key];
                }
            }
        }

        var url = this._application.environment.elementsUrl + '/elements/' + elementConfig.elementKey + '/oauth/token';

        return this._httpGet(url, this._getHeaders(), parameters);
    },

    getOAuthUrl: function(elementConfig) {
        var me = this;

        var parameters = {
            'elementKeyOrId': elementConfig.elementKey,
            'apiKey': elementConfig.apiKey,
            'apiSecret': elementConfig.apiSecret,
            'callbackUrl': elementConfig.callbackUrl
        };

        if(!me._cloudElementsUtils.isEmpty(elementConfig.siteAddress)){
            parameters.siteAddress = elementConfig.siteAddress;
        }

        if(me._cloudElementsUtils.isEmpty(elementConfig.other) == false) {
            for(key in elementConfig.other) {
                if(elementConfig.other.hasOwnProperty(key)) {
                    parameters[key] = elementConfig.other[key];
                }
            }
        }

        var url = this._application.environment.elementsUrl + '/elements/' + elementConfig.elementKey + '/oauth/url';

        return this._httpGet(url, this._getHeaders(), parameters);
    },

    createInstance: function(elementConfig, providerData, instanceId, methodType) {
        var me = this;

        var elementProvision = {
            'configuration': {
                'oauth.api.key': elementConfig.apiKey,
                'oauth.api.secret': elementConfig.apiSecret,
                'oauth.callback.url': elementConfig.callbackUrl
            },
            'providerData': providerData,
            'element': {
                'key': elementConfig.elementKey
            }, 'name': elementConfig.elementKey
        };

        if(me._cloudElementsUtils.isEmpty(elementConfig.other) == false) {
            for(key in elementConfig.other) {
                if(elementConfig.other.hasOwnProperty(key)) {
                    elementProvision.configuration[key] = elementConfig.other[key];
                }
            }
        }
        if(me._cloudElementsUtils.isEmpty(methodType) || methodType == 'POST') {
            return this._httpPost(this._application.environment.elementsUrl + '/instances/', this._getHeaders(), elementProvision);
        } else {
            return this._httpPut(this._application.environment.elementsUrl + '/instances/' + instanceId, this._getHeaders(), elementProvision);
        }
    },

    createNonOathInstance: function(elementProvision, instanceId, methodType) {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(methodType) || methodType == 'POST') {
            return this._httpPost(this._application.environment.elementsUrl + '/instances/', this._getHeaders(), elementProvision);
        } else {
            return this._httpPut(this._application.environment.elementsUrl + '/instances/' + instanceId, this._getHeaders(), elementProvision);
        }

    },

    deleteInstance: function(elementInstance) {
        var me = this;
        return this._httpDelete(this._application.environment.elementsUrl + '/instances/' + elementInstance.id, this._getHeaders());
    },

    loadElementDefaultTransformations: function(elementInstance) {
        var url = this._application.environment.elementsUrl + '/elements/' + elementInstance.element.key + '/transformations';
        return this._httpGet(url, this._getHeaders());
    },

    /**
     * Query server and returns element instance Objects
     * @return Service handler
     */
    loadInstanceObjects: function(elementInstance) {

        var url = this._application.environment.elementsUrl + '/hubs/' + elementInstance.element.hub + '/objects';
        return this._httpGet(url, this._getHeaders(elementInstance.token));
    },

    loadInstanceObjectDefinitions: function(elementInstance) {
        var url = this._application.environment.elementsUrl + '/instances/' + elementInstance.id + '/objects/definitions';
        return this._httpGet(url, this._getHeaders());
    },

    loadAccountObjectDefinitions: function() {
        var url = this._application.environment.elementsUrl + '/accounts/objects/definitions';
        return this._httpGet(url, this._getHeaders());
    },

    loadOrganizationsObjectDefinitions: function() {
        var url = this._application.environment.elementsUrl + '/organizations/objects/definitions';
        return this._httpGet(url, this._getHeaders());
    },

    loadAccounts: function() {
        var url = this._application.environment.elementsUrl + '/accounts?where=type=\'CompanyAccount\'';
        return this._httpGet(url, this._getHeaders());
    },

    /**
     * Loads the workflow templates that are configured for this user's CE account
     * @returns {*} The list of workflow templates or an empty list, if there are none
     */
    loadWorkflowTemplates: function() {
        var url = this._application.environment.elementsUrl + '/workflows';
        return this._httpGet(url, this._getHeaders());
    },

    /**
     * Query server and returns Object metadata
     * @return Service handler
     */
    loadObjectMetaData: function(elementInstance, objectName, discoveryId) {
        var me = this;
        var url = this._application.environment.elementsUrl + '/hubs/' + elementInstance.element.hub + '/objects/' + objectName +
            '/metadata';

        if(!me._cloudElementsUtils.isEmpty(discoveryId)) {
            url += '?discoveryId=' + discoveryId;
        }

        return this._httpGet(url, this._getHeaders(elementInstance.token));
    },

    loadInstanceTransformations: function(elementInstance) {

        // /instances/{id}/transformations
        var url = this._application.environment.elementsUrl + '/instances/{id}/transformations';
        url = url.replace('{id}', elementInstance.id);

        return this._httpGet(url, this._getHeaders());
    },

    loadAccountTransformations: function(elementInstance, account) {

        //  /accounts/{id}/elements/{key}/transformations
        var url = this._application.environment.elementsUrl + '/accounts/{id}/elements/{key}/transformations';
        url = url.replace('{id}', account.id);
        url = url.replace('{key}', elementInstance.element.key);
        return this._httpGet(url, this._getHeaders());
    },

    loadOrganizationTransformations: function(elementInstance) {
        //  /organizations/elements/{key}/transformations
        var url = this._application.environment.elementsUrl + '/organizations/elements/{key}/transformations';
        url = url.replace('{key}', elementInstance.element.key);

        return this._httpGet(url, this._getHeaders());
    },

    findAllObjectTransformations: function(objectName, scope, account) {

        var url = this._application.environment.elementsUrl + '/organizations/objects/{objectName}/transformations';

        if(scope != 'organization') {
            url = this._application.environment.elementsUrl + '/accounts/{id}/objects/{objectName}/transformations';
            url = url.replace('{id}', account.id);
        }

        url = url.replace('{objectName}', objectName);

        return this._httpGet(url, this._getHeaders());
    },

    saveObjectDefinition: function(selectedInstance, objectName, objectDefinition, scope, methodType) {

        // /organizations/objects/{objectName}/definitions
        // /accounts/{id}/objects/{objectName}/definitions

        var url;

        if(scope == 'organization') {
            url = this._application.environment.elementsUrl + '/organizations/objects/{objectName}/definitions';
        } else if(scope == 'account') {
            url = this._application.environment.elementsUrl + '/accounts/objects/{objectName}/definitions';
        } else if(scope == 'instance') {
            url = this._application.environment.elementsUrl + '/instances/' + selectedInstance.id +
                '/objects/{objectName}/definitions';
        }

        url = url.replace('{objectName}', objectName);

        if(methodType == 'POST') {
            return this._httpPost(url, this._getHeaders(), objectDefinition);
        } else {
            return this._httpPut(url, this._getHeaders(), objectDefinition);
        }
    },

    saveObjectTransformation: function(elementInstance, objectName, objectTransformation, scope, methodType) {

        //  /organizations/elements/{key}/transformations
        //  /accounts/{id}/elements/{key}/transformations
        // /instances/{id}/transformations

        var url = null;
        if(scope == 'organization') {
            url = this._application.environment.elementsUrl + '/organizations/elements/{key}/transformations/{objectName}';
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        } else if(scope == 'instance') {
            url = this._application.environment.elementsUrl + '/instances/{id}/transformations/{objectName}';
            url = url.replace('{id}', elementInstance.id);
            url = url.replace('{objectName}', objectName);
        } else {
            url = this._application.environment.elementsUrl + '/accounts/{id}/elements/{key}/transformations/{objectName}';
            url = url.replace('{id}', scope); //The scope that comes is account id
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        }

        if(methodType == 'POST') {
            return this._httpPost(url, this._getHeaders(), objectTransformation);
        } else {
            return this._httpPut(url, this._getHeaders(), objectTransformation);
        }
    },

    deleteObjectTransformation: function(elementInstance, account, objectName, scope) {

        //DELETE /organizations/elements/{key}/transformations/{objectName}
        //DELETE /accounts/{id}/elements/{key}/transformations/{objectName}
        //DELETE /instances/{id}/transformations/{objectName}

        var url = null;
        if(scope == 'organization') {
            url = this._application.environment.elementsUrl + '/organizations/elements/{key}/transformations/{objectName}';
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        } else if(scope == 'instance') {
            url = this._application.environment.elementsUrl + '/instances/{id}/transformations/{objectName}';
            url = url.replace('{id}', elementInstance.id);
            url = url.replace('{objectName}', objectName);
        } else {
            url = this._application.environment.elementsUrl + '/accounts/{id}/elements/{key}/transformations/{objectName}';
            url = url.replace('{id}', scope); //The scope that comes is account id
            url = url.replace('{key}', elementInstance.element.key);
            url = url.replace('{objectName}', objectName);
        }

        return this._httpDelete(url, this._getHeaders());
    },

    getHistory: function(jobId) {

        var parameters = {
            'page': 1,
            'pageSize': 50
        };

        if(!this._cloudElementsUtils.isEmpty(jobId)) {
            parameters.jobId = jobId;
        }

        var url = this._application.environment.elementsUrl + '/bulkloader';
        return this._httpGet(url, this._getHeaders(), parameters);
    },

    getJobErrors: function(elementInstance, jobId) {

        var url = this._application.environment.elementsUrl + '/hubs/' + elementInstance.element.hub + '/bulk/' + jobId + '/errors';

        return this._httpGet(url, this._getHeaders(elementInstance.token));
    },

    /**
     * Query server and returns Object metadata
     * @return Service handler
     */
    scheduleJob: function(elementInstance, job, cronVal) {

        var url = this._application.environment.elementsUrl + '/hubs/' + elementInstance.element.hub + '/bulk/workflows';

        console.log(JSON.stringify(job));
        var headers = this._getHeaders(elementInstance.token);
        if(!this._cloudElementsUtils.isEmpty(cronVal)) {
            headers['Elements-Schedule-Request'] = cronVal;
        }

        return this._httpPost(url, headers, job);
    },

    createWorkflowInstance: function(workflowId, name, configuration) {
        var me = this;
        console.log('Attempting to create an instance of workflow: ' + workflowId + ' with name: ' + name);
        var url = me._application.environment.elementsUrl + '/workflows/{id}/instances';
        url = url.replace('{id}', workflowId);

        var workflowInstance = {
            'name': name,
            'configuration': configuration
        };

        var headers = me._getHeaders();
        return me._httpPost(url, headers, workflowInstance);
    },

    deleteWorkflowInstance: function(workflowId, workflowInstanceId) {
        var me = this;
        console.log('Attempting to delete workflow instance ' + workflowInstanceId);
        var url = me._application.environment.elementsUrl + '/workflows/{id}/instances/{workflowInstanceId}';
        url = url.replace('{id}', workflowId);
        url = url.replace('{workflowInstanceId}', workflowInstanceId);

        var headers = me._getHeaders();
        return me._httpDelete(url, headers);
    },

    findWorkflowInstances: function(workflowId) {
        var me = this;
        console.log('Attempting to find instances of workflow: ' + workflowId);
        var url = me._application.environment.elementsUrl + '/workflows/{id}/instances';
        url = url.replace('{id}', workflowId);

        var headers = me._getHeaders();
        return me._httpGet(url, headers);
    },

    getJobs: function() {
        var me = this;

        var url = me._application.environment.elementsUrl + '/jobs';
        return this._httpGet(url, this._getHeaders());
    },

    deleteJob: function(jobId) {
        var me = this;
        var url = me._application.environment.elementsUrl + '/jobs/' + jobId;
        return this._httpDelete(url, this._getHeaders());
    },

    disableJob: function(jobId) {
        var me = this;
        var url = me._application.environment.elementsUrl + '/jobs/' + jobId + '/disable';
        return this._httpPut(url, this._getHeaders());
    },

    enableJob: function(jobId) {
        var me = this;
        var url = me._application.environment.elementsUrl + '/jobs/' + jobId + '/enable';
        return this._httpPut(url, this._getHeaders());
    },

    _httpGet: function(url, headers, data) {

        return this.$http({
            url: url, method: 'GET', headers: headers, params: data
        });
    },

    _httpPost: function(url, headers, data) {

        return this.$http({
            url: url, method: 'POST', headers: headers, data: data
        });
    },

    _httpPut: function(url, headers, data) {

        return this.$http({
            url: url, method: 'PUT', headers: headers, data: data
        });
    },

    _httpPatch: function(url, headers, data) {

        return this.$http({
            url: url, method: 'PATCH', headers: headers, data: data
        });
    },

    _httpDelete: function(url, headers) {

        return this.$http({
            url: url, method: 'DELETE', headers: headers
        });
    }
});

/**
 * Datamappers Service object creation
 *
 */
(function() {

    var ElementsServiceObject = Class.extend({

        instance: new ElementsService(),

        /**
         * Initialize and configure
         */
        $get: [
            '$http', 'Application', 'CloudElementsUtils', function($http, Application, CloudElementsUtils) {
                this.instance.$http = $http;
                this.instance._cloudElementsUtils = CloudElementsUtils;
                this.instance._application = Application;
                return this.instance;
            }
        ]
    })

    angular.module('bulkloaderApp').provider('ElementsService', ElementsServiceObject);
}());

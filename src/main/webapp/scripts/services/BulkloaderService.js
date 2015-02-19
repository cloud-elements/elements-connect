/**
 * Bulkloader service, bridges the gap between Bulkloader API and application.
 *
 * @author Ramana
 */
var BulkloaderService = Class.extend({


    /**
     * Initialize Service Properties
     */
    init:function(){

    },

    populateServiceDetails: function() {

    },


    _httpGet: function(url, headers) {

        return this.$http({
            url: url,
            method: 'GET',
            headers: headers
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

	var BulkloaderServiceObject = Class.extend({

		instance: new BulkloaderService(),

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
		.service('BulkloaderService',BulkloaderServiceObject);
}());
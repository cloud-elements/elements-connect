/**
 * Bulkloader service, bridges the gap between Bulkloader API and application.
 *
 * @author Ramana
 */

/** Creating a empty event namespace for use of all notifications
 */
namespace('bulkloader.events');

var Service = Class.extend({


    /**
     * Initialize Service Properties
     */
    init:function(){

    }


});



/**
 * Datamappers Service object creation
 *
 */
(function (){

	var ServiceObject = Class.extend({

		instance: new Service(),

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
		.factory('Service',ServiceObject);
}());
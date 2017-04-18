/**
 * This is Utils class used for common/generic/utils functions
 * that will be used across the board
 *
 * Created by Ramana on 11/3/14.
 */
var CloudElementsUtils = Class.extend({

    /**
     * Check if passed in value is undefined or null
     *
     * @param obj
     * @returns {boolean}
     */
    isEmpty: function(obj) {
        return !angular.isDefined(obj) || obj===null || obj.length === 0;
    },

    /**
     * Reads the URL for search string and returns an object with key/value pair
     *
     * @returns {{}}
     */
    pageParameters: function () {
        var me = this;
        var locationString = window.location.search.substring(1);
        if(!me.isEmpty(locationString) && locationString.length > 0
            && me.$cookies.cebulkparams == null
            && (locationString.indexOf('apiKey') > -1
                || locationString.indexOf('email') > -1)) {
            me.$cookies.cebulkparams = locationString;
            window.location.href = window.location.origin + window.location.pathname;
            return;
        } else if (!me.isEmpty(locationString) && locationString.length > 0
            && (locationString.indexOf('token') > -1
            || locationString.indexOf('appName') > -1)) {
            //In this scenario just extract the token and refresh the window with out token
            me.$cookies.cebulkparams = locationString;
            var params = this.getParamsFromURI(locationString);
            if(!me.isEmpty(params.key)) {
                window.location.href = window.location.origin + window.location.pathname+'?key='+params.key;
            } else {
                window.location.href = window.location.origin + window.location.pathname;
            }
            return;
        }

        locationString = me.$cookies.cebulkparams;
        me.$cookies.cebulkparams = null;

        if(me.isEmpty(locationString) || locationString == "null") {
            locationString = window.location.search.substring(1);
        }

        if(!me.isEmpty(locationString) && locationString.length > 0) {
            return this.getParamsFromURI(locationString);
        }
        return {};
    },

    getParamsFromURI: function(query) {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
        var query_string = {};
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");

            if(pair.length > 2) {
                var extendedVal = '';
                for(var j=2; j< pair.length; j++) {
                    if(pair[j]=="") {
                        extendedVal += '=';
                    } else {
                        extendedVal += pair[j];
                    }
                }

                pair[1] = pair[1]+extendedVal;
            }

            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]], pair[1] ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    },

    orderObjects: function(dataStore, sortBy) {
        dataStore = this.orderBy(dataStore, sortBy);

        if(!this.isEmpty(dataStore)) {
            for(var i=0; i< dataStore.length; i++) {
                var dObj = dataStore[i];

                if(!this.isEmpty(dObj.fields) && dObj.fields.length > 0) {
                    dObj.fields = this.orderObjects(dObj.fields, sortBy);
                }
            }
        }

        return dataStore;
    }

});

/**
 * Utils object creation
 *
 */
(function (){

    var utils = Class.extend({

        instance: new CloudElementsUtils(),

        /**
         * Initialize and configure
         */
        $get:['$http', '$filter', '$cookies', function($http, $filter, $cookies){
            this.instance.$http = $http;
            this.instance.orderBy= $filter('orderBy');
            this.instance.$cookies = $cookies
            return this.instance;
        }]
    })

    angular.module('CloudElementsUtils',[])
        .provider('CloudElementsUtils',utils);
}());
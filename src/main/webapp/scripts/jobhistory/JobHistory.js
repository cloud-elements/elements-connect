/**
 * JobHistory factor class as an helper to JobHistory controller.
 *
 *
 * @author Paris
 */

var JobHistory = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _allElements: null,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    _createAllElements: function() {
        var me = this;

        me._allElements = new Object();
        for (var i in me._picker._sources) {
            var src = me._picker._sources[i];
            me._allElements[src.elementKey] = src;
        }

        for (var i in me._picker._targets) {
            var src = me._picker._targets[i];
            me._allElements[src.elementKey] = src;
        }
    },

    getHistoryForParent: function(parentJob) {
        var me = this;
        return me._elementsService.getHistory(null, parentJob.bulkLoaderId).then(
            me._handleGetHistorySucceeded.bind(me),
            me._handleGetHistoryFailed.bind(me));
    },

    getHistory: function() {
        var me = this;
        return me._elementsService.getHistory().then(
            me._handleGetHistorySucceeded.bind(me),
            me._handleGetHistoryFailed.bind(me));
    },

    _handleGetHistorySucceeded: function(result) {
        var me = this;

        //Modify the result to add the Element Name and Logo using Picker
        if (me._cloudElementsUtils.isEmpty(me._allElements)) {
            me._createAllElements();
        }

        if (!me._cloudElementsUtils.isEmpty(result.data)
            && result.data.length > 0) {

            for (var i in result.data) {
                var res = result.data[i];
                var src = me._allElements[res.sourceElementKey];
                res['sourceLogo'] = src.image;
                res['source'] = src.name;
                var tar = me._allElements[res.targetElementKey];
                if (!me._cloudElementsUtils.isEmpty(tar)) {
                    res['targetLogo'] = tar.image;
                    res['target'] = tar.name;
                }
            }

            return result.data;
        }

        return null;
    },

    _handleGetHistoryFailed: function(result) {
        var me = this;

    },

    getJobErrors: function(elementKey, jobId) {
        var me = this;
        var instance = me._picker._elementInstances[elementKey];
        return me._elementsService.getJobErrors(instance, jobId).then(
            me._handleGetJobErrors.bind(me),
            me._handleGetJobErrorsFailed.bind(me));
    },

    _handleGetJobErrors: function(results) {
        var me = this;
        return results.data;
    },

    _handleGetJobErrorsFailed: function(results) {
        var me = this;
    }

});


/**
 * JobHistory Factory object creation
 *
 */
(function (){

    var JobHistoryObject = Class.extend({

        instance: new JobHistory(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications', 'Picker', function(CloudElementsUtils, ElementsService, Notifications, Picker){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._picker = Picker;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('JobHistory',JobHistoryObject);
}());
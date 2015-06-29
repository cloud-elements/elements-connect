/**
 * Jobs factor class as an helper to Jobs controller.
 *
 *
 * @author Paris
 */

var Jobs = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _allElements: null,

    _handleLoadError: function(error) {
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    getJobs: function() {
        var me = this;
        return me._elementsService.getJobs().then(
            me._handleGetJobSucceeded.bind(me),
            me._handleGetJobFailed.bind(me));
    },

    _handleGetJobSucceeded: function(result) {
        var me = this;

        //Create a new Json to from the result to support UI
        if(me._cloudElementsUtils.isEmpty(result.data)
            || result.data.length == 0) {
            return null;
        }

        var jobsArray = new Array();
        for(var i in result.data) {
            var res = result.data[i];
            var body = res.data.body;
            body = angular.fromJson(body);

            var jobItem = null;
            for(var j in body) {
                var bodyItem = body[j];
                if(jobItem == null) {
                    var srcElement = me._picker.getSourceElement(bodyItem.elementKey);
                    var targetElement = me._picker.getTargetElement(bodyItem.targetConfiguration.elementKey);
                    jobItem = {
                        source: srcElement.name,
                        sourceKey: srcElement.elementKey,
                        sourceLogo: srcElement.image,
                        target: targetElement.name,
                        targetKey: targetElement.elementKey,
                        targetLogo: targetElement.image,
                        transformations: [],
                        jobId: res.id,
                        scheduleType: res.description,
                        scheduleState: res.trigger.state,
                        scheduleTypeDetail: '1'
                    };
                }

                jobItem.transformations.push({
                    sourceObject: bodyItem.objectName,
                    targetObject: bodyItem.targetConfiguration.objectName.split('_')[2]
                });
            }

            jobsArray.push(jobItem);
        }

        return jobsArray;
    },

    _handleGetJobFailed: function(result) {
        var me = this;

    },

    getHistory: function(jobId) {
        var me = this;
        return me._elementsService.getHistory(jobId).then(
            me._handleGetHistorySucceeded.bind(me),
            me._handleGetHistoryFailed.bind(me));
    },

    _handleGetHistorySucceeded: function(result) {
        var me = this;

        //Modify the result to add the Element Name and Logo using Picker
        if (!me._cloudElementsUtils.isEmpty(result.data)
            && result.data.length > 0) {
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
    },

    deleteJob: function(jobId) {
        var me = this;
        return me._elementsService.deleteJob(jobId).then(
            me._handleDeleteJob.bind(me),
            me._handleDeleteJobFailed.bind(me));
    },

    _handleDeleteJob: function(results) {
        var me = this;
        return true;
    },

    _handleDeleteJobFailed: function(error) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, 'Deleted failed. ' + error.data.message);
    },

    enableJob: function(jobId) {
        var me = this;
        return me._elementsService.enableJob(jobId).then(
            me._handleEnableJob.bind(me),
            me._handleEnableJobFailed.bind(me));
    },

    _handleEnableJob: function(results) {
        var me = this;
        return true;
    },

    _handleEnableJobFailed: function(error) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, 'Enabling the job failed. ' + error.data.message);
    },

    disableJob: function(jobId) {
        var me = this;
        return me._elementsService.disableJob(jobId).then(
            me._handleDisableJob.bind(me),
            me._handleDisableJobFailed.bind(me));
    },

    _handleDisableJob: function(results) {
        var me = this;
        return true;
    },

    _handleDisableJobFailed: function(error) {
        var me = this;
        me._notifications.notify(bulkloader.events.ERROR, 'Disabling the job failed. ' + error.data.message);
    }


});

/**
 * JobHistory Factory object creation
 *
 */
(function() {

    var JobsObject = Class.extend({

        instance: new Jobs(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Notifications', 'Picker', function(CloudElementsUtils, ElementsService, Notifications, Picker) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._picker = Picker;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Jobs', JobsObject);
}());
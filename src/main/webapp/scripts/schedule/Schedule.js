/**
 * Schedule factor class as an helper to picker controller.
 *
 *
 * @author Paris
 */

var Schedule = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _mapper: null,
    _application: null,
    _navigation: null,

    _objectMetadata: null,
    _objectMetadataFlat: null,

    _openedModal: null,
    _mdDialog: null,
    _jobs: new Array(),

    _handleLoadError: function(error) {
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    _scheduledConfirmation: function(ev) {
        var me = this;

        var msg = me._application.getTransferNowMessage();
        if(me._cloudElementsUtils.isEmpty(msg)) {
            msg = 'You will receive an email when the job is completed.';
        }

        var confirm = me.$mdDialog.alert()
            .title('Your job has been scheduled')
            .content(msg)
            .ariaLabel('Password notification')
            .ok('OK')
            .targetEvent(ev);

        me.$mdDialog.show(confirm);
    },

    openSchedule: function() {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me._openedModal)) {
            me._openedModal = me.$modal.open({
                templateUrl: 'schedule.html',
                controller: 'ScheduleController',
                windowClass: 'bulkloaderModalWindow',
                backdropClass: 'bulkloaderModalbackdropOpac',
                backdrop: 'static',
                size: 'lg'
//                windowTemplateUrl: 'schedule.html'
            });
        }
    },

    closeSchedule: function() {
        var me = this;
        me._openedModal.close();
        me._openedModal = null;
    },

    _wrapSelectField: function(field) {
        var me = this;

        if(field.split(" ").length > 1) {
            field = "`" + field + "`";
        }

        return field;
    },

    _buildFieldList: function(fields, allObjects, targetInstance, objectName) {
        var me = this;

        var fieldList = '';
        var selectedFieldCount = 0;

        //Get transformation of the object and loop through to get the path value and construct fieldlist
        var transformation = allObjects[targetInstance.element.key].transformations[objectName];
        for(var i = 0; i < transformation.fields.length; i++) {
            var f = transformation.fields[i];

            if(me._cloudElementsUtils.isEmpty(f.path)) {
                continue;
            }

            if(selectedFieldCount > 0) {
                fieldList = fieldList + ', '
            }

            fieldList = fieldList + me._wrapSelectField(f.path);
            selectedFieldCount++;
        }
        return fieldList;
    },

    _buildWhereClause: function(selectedInstance, allObjects, objectName) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(allObjects[selectedInstance.element.key].objectsWhere)) {
            return null;
        }

        var mapperwhere = allObjects[selectedInstance.element.key].objectsWhere[objectName];
        if(me._cloudElementsUtils.isEmpty(mapperwhere)) {
            return null;
        }

        var where = '';
        for(var i = 0; i < mapperwhere.length; i++) {
            var mw = mapperwhere[i];

            if(!me._cloudElementsUtils.isEmpty(mw.value)) {
                if(where == '') {
                    where = ' where ';
                } else {
                    where += ' and '
                }
                where += mw.key + ' = ' + mw.value;
            } else if(me._cloudElementsUtils.isEmpty(mw.value) && mw.required == true) {
                me._notifications.notify(bulkloader.events.SCHEDULE_ERROR, "The value for " + mw.name + " for object " + objectName + " is empty which is required. Please close the window and provide the value.");
                return false;
            }
        }
        return where;
    },

    _getScheduleObjectJob: function(selectedInstance, targetInstance, objectName, fields, allObjects, startDate, statusCheckInterval) {
        var me = this;
        var query = null;
        var selectObjectName = null;
        var composite = me._application.isCompositeMetadata();
        if(me._application.getView() == 'datalist') {
            var fieldsList = me._buildFieldList(fields, allObjects, selectedInstance, objectName);
            if(me._cloudElementsUtils.isEmpty(fieldsList) || fieldsList.length == 0) {
                // No transformations setup, so ignore
                return;
            }
            query = "select " + fieldsList + " from " + objectName;
            selectObjectName = objectName;
        } else {
            selectObjectName = objectName.split('_')[1]; // Second field in the objectname is source objectname
            query = "select * from " + selectObjectName;

            //Construct the where clause if has and append it to the query
            var where = me._buildWhereClause(selectedInstance, allObjects, selectObjectName);
            if(!me._cloudElementsUtils.isEmpty(where) && where == false) {
                // If where is returned false, then its missing required value to be sent for the Object
                return false;
            }

            if(!me._cloudElementsUtils.isEmpty(where)) {
                query += where;
            }
        }

        var job = new Object();

        var objectDetails = {};
        if(!me._cloudElementsUtils.isEmpty(allObjects[selectedInstance.element.key].objectDetails)) {
            objectDetails = allObjects[selectedInstance.element.key].objectDetails[selectObjectName];
        }

        job.query = query;
        job.from = startDate;
        job.objectName = selectObjectName;
        job.elementKey = selectedInstance.element.key;
        job.statusCheckInterval = statusCheckInterval;
        job.fileUpload = objectDetails.fileUpload;
        job.composite = composite;
        job.jobId = objectDetails.jobId;
        job.parentObjectName = objectDetails.parentObjectName;

        var target = me._picker.getTarget();
        //Check if the multiUpload is true for Target as well
        if(!me._cloudElementsUtils.isEmpty(objectDetails.multipleUpload) && objectDetails.multipleUpload
            && !me._cloudElementsUtils.isEmpty(target.multipleUpload) && target.multipleUpload) {
            job.multipleUpload = objectDetails.multipleUpload;
        } else {
            job.multipleUpload = false;
        }

        var source = me._picker.getSourceElement(selectedInstance.element.key);
        if(!me._cloudElementsUtils.isEmpty(source.path)) {
            job.path = source.path;
        }
        if(!me._cloudElementsUtils.isEmpty(source.method)) {
            job.method = source.method;
        }

        var targetConfiguration = new Object();

        if(me._cloudElementsUtils.isEmpty(target.appendObjectName) ||
            target.appendObjectName == false) {
            targetConfiguration.path = target.path;
        } else {
            if (target.path.indexOf('{objectName}') != -1) {
                targetConfiguration.path = target.path.replace("{objectName}", objectName);
            } else {
                targetConfiguration.path = target.path + '/' + objectName;
            }
        }

        targetConfiguration.method = target.method;
        if (target.addToCampaign){
            targetConfiguration.addToCampaign=true;
        }

        if(me._cloudElementsUtils.isEmpty(target.elementToken) == false) {
            targetConfiguration.token = target.elementToken;
        } else if(me._cloudElementsUtils.isEmpty(target.token) == false) {
            targetConfiguration.token = target.token;
        } else if(!me._cloudElementsUtils.isEmpty(targetInstance)) {
            targetConfiguration.token = targetInstance.token;
        }

        var parameters = new Object();



        if(me._cloudElementsUtils.isEmpty(target.other) == false) {
            for(key in target.other) {
                if(target.other.hasOwnProperty(key)) {
                    parameters[key] = target.other[key];
                }
            }
        }

        targetConfiguration.parameters = parameters;
        if(me._cloudElementsUtils.isEmpty(targetInstance) == false) {
            targetConfiguration.elementKey = targetInstance.element.key;
        }

        targetConfiguration.objectName = objectName;

        //Check if the Target elements has any bulkMetadata to be sent as part of the target configuration
        if(!me._cloudElementsUtils.isEmpty(target.bulkMetadata)) {

            if(!me._cloudElementsUtils.isEmpty(target.bulkMetadata[objectName])) {
                targetConfiguration.metaData = target.bulkMetadata[objectName];
            } else {
                //Check if the metadata is for the custom Objects
                var split = objectName.split('_');
                var customObjectName = split[0]+'_'+split[1]+'_'+'*';

                if(!me._cloudElementsUtils.isEmpty(target.bulkMetadata[customObjectName])) {
                    targetConfiguration.metaData = target.bulkMetadata[customObjectName];
                }
            }
        }

        job.targetConfiguration = targetConfiguration;

        if(!me._cloudElementsUtils.isEmpty(me._application.configuration.notificationToken)) {
            var notificationConfiguration = new Object();

            notificationConfiguration.token = me._application.configuration.notificationToken;
            notificationConfiguration.to = me._application.configuration.notificationEmail;

            job.notificationConfiguration = notificationConfiguration;
        }

        return job;
    },

    getMappingTransformations: function(selectedInstance, targetInstance, allObjects) {
        var me = this;

        var targetmappings = allObjects[targetInstance.element.key].metamapping;

        //filter out mappings for targetInstance
        var objects = Object.keys(targetmappings);
        if(!me._cloudElementsUtils.isEmpty(objects)) {
            mappings = new Object();
            for(var i = 0; i < objects.length; i++) {
                if(objects[i].indexOf(selectedInstance.element.key) > -1) {
                    mappings[objects[i]] = targetmappings[objects[i]];
                }
            }
        }

        var objects = Object.keys(mappings);
        var schedulemappings = new Array();
        if(!me._cloudElementsUtils.isEmpty(objects)) {
            for(var i = 0; i < objects.length; i++) {
                var fields = mappings[objects[i]].fields;
                if(me._cloudElementsUtils.isEmpty(fields) || fields.length <= 0) {
                    continue;
                }

                var sourceObjectDetails = allObjects[selectedInstance.element.key].objectDetails;
                var targetObjectDetails = allObjects[targetInstance.element.key].objectDetails;

                var o = objects[i].split('_');
                var mapping = new Object();
                var sourceName = o[1];
                var targetName = o[2];
                //If length is > 3 that means object has '_' in it, append the remaining objects to get the target
                if(o.length > 3) {
                    var ar2 = o.slice(2, o.length);
                    targetName = ar2.join('_');
                }

                var file = me._mapper.all[me._picker.selectedElementInstance.element.key].files[sourceName];
                var fileUpload = false;
                var sourceDisplayName = null;
                if(!me._cloudElementsUtils.isEmpty(sourceObjectDetails) && !me._cloudElementsUtils.isEmpty(sourceObjectDetails[sourceName])) {
                    fileUpload = sourceObjectDetails[sourceName].fileUpload;
                    sourceDisplayName = sourceObjectDetails[sourceName].displayName;
                }

                var targetDisplayName = null;
                if(!me._cloudElementsUtils.isEmpty(targetObjectDetails) && !me._cloudElementsUtils.isEmpty(targetObjectDetails[targetName])) {
                    targetDisplayName = targetObjectDetails[targetName].displayName;
                }

                if (!targetDisplayName) {targetDisplayName = targetName}
                if (!sourceDisplayName) {sourceDisplayName = sourceName}
                mapping.transformed = fileUpload ? file ? true : false : true;
                mapping.fileUploadReady = fileUpload ? file ? true : false : true;
                mapping.sourceObject = sourceDisplayName;
                mapping.targetObject = targetDisplayName;
                mapping.name = objects[i];
                schedulemappings.push(mapping);

            }
        }
        return schedulemappings;
    },

    _anyFieldSelected: function(object) {

        var me = this;

        if(me._cloudElementsUtils.isEmpty(object)) {
            return false;
        }

        if(me._cloudElementsUtils.isEmpty(object.fields)) {
            return false;
        }

        if(object.fields.length <= 0) {
            return false;
        }

        for(var i = 0; i < object.fields.length; i++) {
            var field = object.fields[i];

            if((field instanceof Object) == false) {
                continue;
            }

            if('fields' in field) {
                if(me._anyFieldSelected(field) == false) {
                    continue;
                } else {
                    return true;
                }
            } else {
                if('transform' in field) {
                    if(field.transform == true) {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    getDatalistTransformations: function(selectedInstance, targetInstance, allObjects, startDate) {
        var me = this;

        var transformations = allObjects[selectedInstance.element.key].metadata;
        var schedulemappings = new Array();

        if(me._cloudElementsUtils.isEmpty(transformations)) {
            return schedulemappings;
        }

        var objects = Object.keys(transformations);

        if(me._cloudElementsUtils.isEmpty(objects)) {
            me._notifications.notify(bulkloader.events.ERROR, "There are no Object mappings defined to schedule");
            return;
        }

        var objectsAndTrans = allObjects[selectedInstance.element.key].objectsAndTrans;

        if(me._cloudElementsUtils.isEmpty(objectsAndTrans)) {
            me._notifications.notify(bulkloader.events.ERROR, "There are no Object mappings defined to schedule");
            return;
        }

        for(var i = 0; i < objects.length; i++) {
            if(me._cloudElementsUtils.isEmpty(objectsAndTrans[objects[i]]) || objectsAndTrans[objects[i]] == false) {
                continue;
            }

            if(!me._anyFieldSelected(transformations[objects[i]])) {
                continue;
            }

            var mapping = new Object();
            mapping.transformed = true;
            mapping.sourceObject = objects[i];
            schedulemappings.push(mapping);
        }

        return schedulemappings;
    },

    runMapperScheduledJob: function(selectedInstance, targetInstance, allObjects, startDate, schedulemappings, cronVal) {
        var me = this;
        if(me._cloudElementsUtils.isEmpty(schedulemappings)) {
            me._notifications.notify(bulkloader.events.ERROR, "There are no Object mappings defined to schedule");
            return;
        }

        var objects = Object.keys(schedulemappings);

        if(me._cloudElementsUtils.isEmpty(objects)) {
            me._notifications.notify(bulkloader.events.ERROR, "There are no Object mappings defined to schedule");
            return;
        }

        var targetmappings = allObjects[targetInstance.element.key].metamapping;

        var allGoodForSave = true;
        var jobs = new Array();
        for(var i = 0; i < objects.length; i++) {
            var m = schedulemappings[objects[i]];
            if(m.transformed == false) {
                continue;
            }

            if(me._cloudElementsUtils.isEmpty(targetmappings[m.name])) {
                continue;
            }

            var fields = targetmappings[m.name].fields;
            if(me._cloudElementsUtils.isEmpty(fields) || fields.length <= 0) {
                continue;
            }
            var jo = me._getScheduleObjectJob(selectedInstance, targetInstance, m.name, fields, allObjects, startDate, 20000);
            if(jo == false) {
                //Something broke, stopping doing other stuff
                allGoodForSave = false;
                break;
            }
            jobs.push(jo);
        }

        if(allGoodForSave == true) {
            return jobs;
        } else {
            return false;
        }

    },

    runDatalistScheduledJob: function(selectedInstance, targetInstance, allObjects, startDate, schedulemappings, cronVal) {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(schedulemappings)) {
            me._notifications.notify(bulkloader.events.ERROR, "There are no Object mappings defined to schedule");
            return;
        }

        var objects = Object.keys(schedulemappings);

        if(me._cloudElementsUtils.isEmpty(objects)) {
            me._notifications.notify(bulkloader.events.ERROR, "There are no Object mappings defined to schedule");
            return;
        }

        var objectsAndTrans = allObjects[selectedInstance.element.key].objectsAndTrans;

        if(me._cloudElementsUtils.isEmpty(objectsAndTrans)) {
            me._notifications.notify(bulkloader.events.ERROR, "There are no Object mappings defined to schedule");
            return;
        }
        var transformations = allObjects[selectedInstance.element.key].metadata;
        if(me._cloudElementsUtils.isEmpty(transformations)) {
            return;
        }

        var allGoodForSave = true;
        var jobs = new Array();
        for(var i = 0; i < objects.length; i++) {
            var m = schedulemappings[objects[i]];
            if(m.transformed == false) {
                continue;
            }

            var fields = transformations[m.sourceObject].fields;

            if(me._cloudElementsUtils.isEmpty(fields) || fields.length <= 0) {
                continue;
            }

            var jo = me._getScheduleObjectJob(selectedInstance, targetInstance, m.sourceObject, fields, allObjects, startDate, 60000);
            if(jo == false) {
                allGoodForSave = false;
                //Something broke, stopping doing other stuff
                break;
            }
            jobs.push(jo);
        }

        if(allGoodForSave == true) {
            return jobs;
        } else {
            return false;
        }
    },

    _handleJobScheduled: function(selectedInstance, job) {
        var me = this;

        me._jobs.push(job);
    },

    _handleJobSchedulingError: function(selectedInstance, error) {
        var me = this;
    },

    getScheduleHeaders: function() {
        var me = this;
        var scheduleDisplay = me._application.getSchedule();
        if(!me._cloudElementsUtils.isEmpty(scheduleDisplay)
            && !me._cloudElementsUtils.isEmpty(scheduleDisplay['Elements-Async-Callback-Url'])) {

            var headers = new Object();
            headers['Elements-Async-Callback-Url'] = scheduleDisplay['Elements-Async-Callback-Url'];
            return headers;
        }

        return null;
    },

    scheduleJobs: function(selectedInstance, targetInstance, jobs, cronVal) {
        var me = this;

        var sequence = null;
        if(!me._cloudElementsUtils.isEmpty(targetInstance)) {
            sequence = me._picker.getTargetElementBulkSequence(targetInstance.element.key);
        }
        var sourceSequence = me._picker.getSourceElementBulkSequence(selectedInstance.element.key);

        if(me._cloudElementsUtils.isEmpty(sequence) && me._cloudElementsUtils.isEmpty(sourceSequence)) {
            for(key in jobs) {
                var js = new Array();
                js.push(jobs[key]);

                me._elementsService.scheduleJob(selectedInstance, js, cronVal, me.getScheduleHeaders())
                    .then(me._handleJobScheduled.bind(me, selectedInstance),
                    me._handleJobSchedulingError.bind(me, selectedInstance));
            }

        } else {

            //Create a sequence for the Jobs in the JS array
            var js = new Array();

            //Check for target sequence if not then go for source sequence
            if(!me._cloudElementsUtils.isEmpty(sequence)) {
                //Loop through the sequence and also loop through the jobs to create the sequence of jobs to be sent
                for(field in sequence) {
                    for(key in jobs) {
                        var j = jobs[key];
                        var targetObj = j.targetConfiguration.objectName;
                        var targetObjectName = targetObj.split('_')[2];

                        if(targetObjectName === sequence[field]) {
                            js.push(j);
                        }
                    }
                }
            } else {
                for(field in sourceSequence) {
                    for(key in jobs) {
                        var j = jobs[key];
                        var targetObj = j.targetConfiguration.objectName;
                        var sourceObjectName = targetObj.split('_')[1];

                        if(sourceObjectName === sourceSequence[field]) {
                            js.push(j);
                        }
                    }
                }
            }

            me._elementsService.scheduleJob(selectedInstance, js, cronVal, me.getScheduleHeaders())
                .then(me._handleJobScheduled.bind(me, selectedInstance),
                me._handleJobSchedulingError.bind(me, selectedInstance));
        }

        me._scheduledConfirmation();
    },

    constructCronExpression: function(selectedScheduleType) {
        var me = this;
        var cronStr = null;
        if(selectedScheduleType.value === 'hourly') {
            cronStr = '0 0 0/1 1/1 * ? *';
        } else if(selectedScheduleType.value === 'daily') {
            cronStr = '0 0 12 1/1 * ? *';
        } else if(selectedScheduleType.value === 'weekly') {
            cronStr = '0 0 12 ? * ';
            cronStr += selectedScheduleType.typeValue;
            cronStr += ' *';
        } else if(selectedScheduleType.value === 'monthly') {
            cronStr = '0 0 12 ';
            cronStr += selectedScheduleType.typeValue;
            cronStr += ' 1/1 ? *';
        }

        return cronStr;
    }
});

/**runMapperScheduledJob
 * Schedule Factory object creation
 *
 */
(function() {

    var ScheduleObject = Class.extend({

        instance: new Schedule(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Notifications', 'Picker', 'Application', 'Navigation', '$modal', '$mdDialog', 'Mapper', function(CloudElementsUtils, ElementsService, Notifications, Picker, Application, Navigation, $modal, $mdDialog, Mapper) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance.$modal = $modal;
            this.instance.$mdDialog = $mdDialog;
            this.instance._picker = Picker;
            this.instance._application = Application;
            this.instance._navigation = Navigation;
            this.instance._mapper = Mapper;

            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Schedule', ScheduleObject);
}());



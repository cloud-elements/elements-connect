angular.module('bulkloaderApp')
    .directive('maskLoader', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                message: '@'
            },
            template: '<div class="mask-loader" style="height:'+ window.innerHeight +'px;"><span class="loader-animation">{{message}}</span><span class="text">{{message}}</span></div>'
//            template: '<div style="background-color: #000777; position: absolute; top: 0; left: 0; z-index: 999999999;" class="mask-loader" ><span class="text">{{message}}</span></div>'
        }
    });

/**
 * MaskLoader factor class as an helper for masking the screens
 *
 *
 * @author Ramana
 */

var MaskLoader = Class.extend({

    _modalDomEl: null,
    _cloudElementsUtils: null,

    _createMaskingElement:function (scope, message) {
        var me = this;

        var body = me.$document.find('body').eq(0);

        var angularDomEl = angular.element('<mask-loader message ="'+message+'"></mask-loader>');
        me._modalDomEl = me.$compile(angularDomEl)(scope);
        body.append(me._modalDomEl);
    },

    show:function(scope, message){
        var me  = this;
//        me._createMaskingElement(scope, message);
        if(me._cloudElementsUtils.isEmpty(me._modalDomEl)) {
            me._createMaskingElement(scope, message);
        }
    },

    hide:function(){
        var me  = this;
        if(!me._cloudElementsUtils.isEmpty(me._modalDomEl)) {
            me._modalDomEl.remove();
            me._modalDomEl = null;
        }
    }
});

/**
 * Picker Factory object creation
 *
 */
(function (){

    var MaskLoaderObject = Class.extend({

        instance: new MaskLoader(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', '$document', '$compile', '$rootScope',function(CloudElementsUtils, $document, $compile, $rootScope){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance.$document = $document;
            this.instance.$compile = $compile;
            this.instance.$rootScope = $rootScope;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('MaskLoader',MaskLoaderObject);
}());
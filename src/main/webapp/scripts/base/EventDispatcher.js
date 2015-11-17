/**
* Event dispatcher class,
* add ability to dispatch event
* on native classes.
*
* Use of Class.js
*
*/
var EventDispatcher = Class.extend({
    _listeners:{},
    _listenersCallbacks:{},

    /**
    * Add a listener on the object
    * @param type : Event type
    * @param listener : Listener callback
    */
    addEventListener:function(type, listener, scopeId){
        if(!this._listeners[type]){
            this._listeners[type] = [];
        }

        this._listeners[type].push(scopeId);

        var callbacks = type+'_'+scopeId;
        if(!this._listenersCallbacks[callbacks]){
            this._listenersCallbacks[callbacks] = [];
        }
        this._listenersCallbacks[callbacks].push(listener);
    },


    /**
       * Remove a listener on the object
       * @param type : Event type
       * @param listener : Listener callback
       */
    removeEventListener:function(type, listener, scopeId){
      if(this._listeners[type]){
        var index = this._listeners[type].indexOf(scopeId);

        if(index!==-1){
            this._listeners[type].splice(index,1);
            //Now remove from callbacks
            var callbacks = type+'_'+scopeId;
            if(this._listenersCallbacks[callbacks] != null){
                delete this._listenersCallbacks[callbacks];
            }
        }
      }
    },


    /**
    * Dispatch an event to all registered listener
    * @param Mutiple params available, first must be string
    */
    dispatchEvent:function(){
        var listeners;

        if(typeof arguments[0] !== 'string'){
            console.warn('EventDispatcher','First params must be an event type (String)')
        }else{
            var type = arguments[0];
            listeners = this._listeners[type];

            for(var key in listeners){
                var scopeId = listeners[key]
                var callbacks = this._listenersCallbacks[type+'_'+scopeId];
                for(var callbackkey in callbacks){
                    //This could use .apply(arguments) instead, but there is currently a bug with it.
                    callbacks[callbackkey](arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);
                }
            }
        }
    }
});




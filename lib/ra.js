(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports = new RaProto();
    else
        global.ra = new RaProto();
    
    function RaProto() {
        var Events = {};
        
        function ra(generator) {
            var gen = generator(requirebind, ajaxbind);
            
            function nextItem(error, result) {
                var item = gen.next(result);
                
                if (error)
                    emit('error', error);
                else if (!item.done)
                    item.value(nextItem);
                
                if (item.done)
                    emit('end');
              }
        
          nextItem();
          
          return ra;
        }
        
        ra.on = function(event, callback) {
            var funcs = Events[event];
            
            if (funcs)
                funcs.push(callback);
            else
                Events[event] = [callback];
            
            return ra;
        };
        
        function emit(event, data) {
            var funcs = Events[event];
            
            if (funcs)
                funcs.forEach(function(fn) {
                    fn(data);
                });
            else if (event === 'error')
                throw data;
        }
        
        function ajaxbind(url) {
            return ajax.bind(null, url);
        }
        
        function requirebind(url) {
            return require.bind(null, url);
        }
        
        function require(url, callback) {
            ajax(url, function(error, data) {
                if (error)
                    callback(error);
                else
                    evaluate(url, data, callback);
            });
        }
        
        function ajax(url, callback) {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            
            request.addEventListener('load', function() {
                var data    = this.response,
                    status  = this.status;
                
                if (status >= 200 && status < 400)
                    callback(null, data);
                else
                    callback(this.response);
            });
            
            request.addEventListener('error', function(error) {
                callback(error);
            });
            
            request.send();
        }
        
        function evaluate(url, data, callback) {
            var error,
                result,
                js        = /js$/.test(url),
                begin       = 'var module = { exports:{} };' +
                            '(function(exports, require, module) {',
                end         = '})(module.exports, null, module);' +
                            'return module.exports;';
            
            if (!js)
                error = tryCatch(function() {
                    result = JSON.parse(data);
                });
            else
                error = tryCatch(function() {
                    result = Function(begin + data + end)();
                });
            
            callback(error, result);
        }
        
        function tryCatch(fn) {
            var error;
            
            try {
                fn();
            } catch(err) {
                error = err;
            }
            
            return error;
        }
    
        return ra;
    }
})(this);

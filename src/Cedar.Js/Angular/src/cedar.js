'use strict';

var cedarJs = angular.module("cedar.js", [])
    
    .provider('commandApi', function() {

        var _http, _q, _rootScope, _options;

        return {
            configure: function(options) {
                
                if(!options.namespace) throw new Error("No namespace defined in the options");
                
                _options = options;
            },
            $get: function($http, $q, $rootScope) {
                _q = $q;
                _http = $http;
                _rootScope = $rootScope;

                function execute(command, dependingResource) {

                    var deferred = _q.defer();

                    sendCommand(command, function(data){
                        deferred.resolve(data);
                    });
                    
                    return deferred.promise;
                }

                return {
                    execute: execute
                };
            }
        };

        function sendCommand(command, callback) {
            _rootScope.$broadcast('commandSending', command);
            _http.put(
                'commands/' + command.commandId,
                command, {
                    headers: {
                        'content-type': 'application/vnd.' + _options.namespace + '.' +
                            command.commandName + '+json',
                        'Accept': 'application/problem+json'
                    }
                })
            .success(function(data) {
                
                callback(data);

                _rootScope.$broadcast('commandSent', command);
            })
            .error(function() {
                deferred.reject();
            });
        }
    });

// Use amd loading if available
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = cedarJs;
  }
  exports.cedarJs = cedarJs;
}
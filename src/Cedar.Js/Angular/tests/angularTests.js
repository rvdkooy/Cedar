describe('The command Api tests', function() {
    'use strict';

    describe('When configured with a prefix', function() {
        var $httpBackend, $http, $q, $timeout, $rootScope, _commandApiProvider;

        beforeEach(function() {

            angular.module('testmodule', ['cedar.js'])
                .config(function(commandApiProvider) {
                    _commandApiProvider = commandApiProvider;
                });

            module('testmodule');

            inject(function(_$httpBackend_, _$http_, _$q_, _$rootScope_) {
                $httpBackend = _$httpBackend_;
                $http = _$http_;
                $q = _$q_;
                $rootScope = _$rootScope_;
            });

            $httpBackend.expectPUT(/\/prefix\/commands\/*/).respond(200);

            _commandApiProvider.configure('prefix');
            _commandApiProvider.$get($http, $q, $rootScope).execute({});

            $httpBackend.flush();
        });

        it('should use the prefix in the url', function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    describe('When successfully executed', function() {
        var $httpBackend, $http, $q, $rootScope, _commandApiProvider;
        var command = { commandId: '1234', commandName: 'commandA', domainVersion: '4' };

        beforeEach(function() {

            angular.module('testmodule', ['cedar.js'])
                .config(function(commandApiProvider) {
                    _commandApiProvider = commandApiProvider;
            });

            module('testmodule');

            inject(function(_$httpBackend_, _$http_, _$q_, _$rootScope_) {
                $httpBackend = _$httpBackend_;
                $http = _$http_;
                $q = _$q_;
                $rootScope = _$rootScope_;
            });
        });

        it('should set content type header', function() {

            var expectedData = { "commandId": "1234", "commandName": "commandA", "domainVersion": "4" };

            var expectedHeaders = {
                "content-type": 'application/vnd.thenamespace.commandA+json',
                "Accept": "application/problem+json"
            };

            $httpBackend.expect('PUT', '//commands/1234', expectedData,
                expectedHeaders).respond(200);

            _commandApiProvider.$get($http, $q, $rootScope, {}).execute(command);

            $httpBackend.flush();

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should return a resolved promise', function() {

            var successHandler = jasmine.createSpy('success');

            $httpBackend.expectPUT(/\/\/commands\/1234/).respond(200);
            _commandApiProvider.$get($http, $q, $timeout, $rootScope).execute(command).then(successHandler);
            $httpBackend.flush();
            expect(successHandler).toHaveBeenCalled();
        });
    });

    describe('When unsuccessfully executed', function() {
        var $httpBackend, $http, $q, $rootScope, _commandApiProvider;

        var command = { commandId: '1234', commandName: 'commandA', domainVersion: '4' };

        beforeEach(function() {

            angular.module('testmodule', ['cedar.js'])
                .config(function(commandApiProvider) {
                    _commandApiProvider = commandApiProvider;
                });

            module('testmodule');

            inject(function(_$httpBackend_, _$http_, _$q_, _$rootScope_) {
                $httpBackend = _$httpBackend_;
                $http = _$http_;
                $q = _$q_;
                $rootScope = _$rootScope_;
            });
        });

        it('should return a rejected promise', function() {
            var errorHandler = jasmine.createSpy('error');

            $httpBackend.expectPUT(/\/\/commands\/1234/).respond(500);
            _commandApiProvider.$get($http, $q, {}, $rootScope).execute(command).then(function() {}, errorHandler);
            $httpBackend.flush();
            expect(errorHandler).toHaveBeenCalled();
        });
    });
});
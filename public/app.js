angular.module('usbApp', [])
    .factory('socket', function($rootScope) {
        var socket = io.connect();
        return {
            on: function(eventName, callback) {
                socket.on(eventName, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function(eventName, data, callback) {
                socket.emit(eventName, data, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    })
    .controller('mainController', ['$scope','socket', function($scope,socket) {
        socket.on('usb:attach', function(data) {
            console.log(data);
        });
        socket.on('usb:detach', function(data) {
            console.log(data);
        });
        $scope.ledControl = function(ledId, enabled) {
            socket.emit('ledControl', { ledId: ledId, enabled: enabled });
        }
    }]);
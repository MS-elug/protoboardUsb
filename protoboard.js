
'use strict'

const usb = require('usb');
const clc = require('cli-color');
const EventEmitter = require('events');
const protoDeviceVendorId = 0x1234;
const protoDeviceProductId = 0x0001;

class ProtoboardEmitter extends EventEmitter { };

const protoboardEmitter = new ProtoboardEmitter();

var protoDevice = usb.findByIds(protoDeviceVendorId, protoDeviceProductId);
var protoDeviceOutEndpoint = null;

if (protoDevice) {
    console.log(clc.green('Periphérique USB trouvé'));
    initProtoDevice();
    protoboardEmitter.emit('usb:protoDevice');
    //socket.emit('usb:protoDevice', { device: JSON.parse(JSON.stringify(protoDevice)) });
}

usb.on('attach', function(device) {
    //Si le périphérique n'était pas encore trouvé, on vérifie si le nouveau périphérique usb
    //est le protoDevice
    if (!protoDevice) {
        protoDevice = usb.findByIds(protoDeviceVendorId, protoDeviceProductId);
        if (protoDevice) {
            console.log(clc.green('Periphérique USB attaché'));
            initProtoDevice();
            protoboardEmitter.emit('attach');
            //socket.emit('usb:attach', { device: JSON.parse(JSON.stringify(device)) });
        }
    }
});

usb.on('detach', function(device) {
    //Vérifie si le périphérique enlevé est le protoDevice
    if (device.deviceDescriptor.idProduct === protoDeviceProductId &&
        device.deviceDescriptor.idVendor === protoDeviceVendorId) {
        console.log(clc.red('Periphérique USB détaché'));
        //socket.emit('usb:detach', { device: JSON.parse(JSON.stringify(device)) });
        //Supprime la référence au device qui n'existe plus
        protoDevice = null;
        protoDeviceOutEndpoint = null
        protoboardEmitter.emit('detach');
    }
});

protoboardEmitter.sendData = function(data, callback) {
    if (protoDeviceOutEndpoint) {
        console.log(clc.yellow('Sending data...'));
        protoDeviceOutEndpoint.transfer(data, function(error) {
            if (error) {
                console.log(clc.red('Data transfer error\t') + ' ' + error);
            } else {
                console.log(clc.green('Data transfered\t') + data);
            }
            if (callback) {
                callback(error);
            }
        });
    } else {
        console.log(clc.red('Le périphérique n\'est pas prêt à recevoir une commande'));
        if (callback) {
            callback(new Error('Device not ready'));
        }

    }
};

function initProtoDevice() {
    if (protoDevice) {
        console.log(clc.yellow('Periphérique USB initialisation...'));
        protoDevice.open();
        var protoDeviceInterface = protoDevice.interface(0);
        if (protoDeviceInterface) {
            console.log(clc.yellow('Periphérique USB prise de controle...'));
            protoDeviceInterface.claim();
            protoDeviceOutEndpoint = protoDeviceInterface.endpoint(0x01);
            if (protoDeviceOutEndpoint) {
                console.log(clc.green('Periphérique USB initialisé'));
            } else {
                console.log(clc.red('Periphérique OutEndpoint introuvable'));
            }

        } else {
            console.log(clc.red('Periphérique interface non trouvé'));
        }
    }
}


module.exports = protoboardEmitter;
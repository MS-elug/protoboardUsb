'use strict'

//Pre-requis
//Installer Nodejs
//Installer libusb sinon il y aura des erreurs: LIBUSB_ERROR_NOT_FOUND
//   =>https://github.com/libusb/libusb/wiki/Windows#How_to_use_libusb_on_Windows

var usb = require('usb');
var clc = require('cli-color');

var stephanDevice = usb.findByIds(0x1234, 0x0001);
if (!stephanDevice) {
    console.log(clc.red('Periphérique USB non trouvé'));
    return;
}
console.log(clc.green('Periphérique USB trouvé:'));
console.log(stephanDevice)

//Open the device. All methods below require the device to be open before use.
console.log(clc.green('Initialization du périphérique'));
stephanDevice.open();

//List of Interface objects for the interfaces of the default configuration of the device.
console.log(clc.green('Interfaces du périphérique:'));
console.log(stephanDevice.interfaces)

console.log(clc.green('Récupération de l\'interface 0'));
var interface_0 = stephanDevice.interface(0);

//Claims the interface. This method must be called before using any endpoints of this interface.
interface_0.claim();

//List of endpoints on this interface: InEndpoint and OutEndpoint objects.
console.log(clc.green('Liste des endpoints:'));
console.log(interface_0.endpoints);

console.log(clc.green('Récupération de l\'outEndpoint 1'));
var outEndpoint = interface_0.endpoint(0x01);

console.log(clc.green('Récupération de l\'inEndpoint 129'));
var inEndpoint = interface_0.endpoint(0x01 | 0x80);

//---------------------------------
// Lecture continue du pic et affichage de la data recue
//---------------------------------
inEndpoint.startPoll();
inEndpoint.on('data',function(data){
    console.log(clc.blue('data\t') + ' ' + data.toString());
});
inEndpoint.on('error',function(error){
    console.log(clc.red('error\t') + ' ' + error);
});


//---------------------------------
// Clignotement continue du pic et affichage de la commande envoyée
//---------------------------------
blinkLed(outEndpoint,1);
function blinkLed(outEndpoint,ledId) {
    LEDCtrl(outEndpoint, 1, true);
    LEDCtrl(outEndpoint, 2, false);
    setTimeout(function() {
        LEDCtrl(outEndpoint, 1, false);
        LEDCtrl(outEndpoint, 2, true);
        
        setTimeout(function(){blinkLed(outEndpoint,ledId)}, 100);
    }, 100);
};


function LEDCtrl(outEndpoint, ledId, enabled) {
    var command = enabled ? 'M' : 'A';
    command += ledId;

    outEndpoint.transfer(command, function callback(error) {
        if (error) {
            console.log(error);
        } else {
            console.log(clc.green('Command\t') + command);
        }
    });
}
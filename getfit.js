#!/usr/bin/env node

var channel = 0,
    net = 0,
    devices,
    hostname = 'getfit',
    argv = require('minimist')(process.argv.slice(2)),
    host = new(require('libantjs'))({
      log: argv.v,
      debugLevel: argv.L || 0 // 0 - 4 enables libusb debug info.
    }),
    deviceNumber = argv.n || 0, // 0 for any device
    port = argv.p || 0;

function onError(error) {

  console.trace();
  console.error('Error', error);
}

function onConnect(error) {

  if (error) {
    console.log('Failed connect', error);
    return;
  }
}

function onExited(error) {
    if (error)
      console.error('Failed exit',error);
}

function onInited(error, notificationStartup) {

  if (error) {
    console.error('Failed init', error);
    return;
  }

  host.on('transport_end', function() {
    host.exit(onExited);
  });

  host.on('open', function(ch) {
    var msg = hostname + ' connecting to device';

    if (argv.v)
    {
      msg += ' ' + deviceNumber + ' channel ' + ch;

      host.deviceToString(devices[port], function _onDeviceInfo(e,m) { console.log(msg + ' - port ' + port + ' ' + m);});
    }
    //else
    //  console.log(msg);
  });

  host.connectANTFS(channel, net, deviceNumber, hostname, argv.d, argv.e, argv.l, argv.s, argv.b, onConnect);

}

if (argv.h) {
  
  console.log('Usage: getfit -d {index} -e {index} -l\n');
  console.log(' -d {index} or -d {index1,...,indexn} download');
  console.log(' -e {index} or -d {index1,...,indexn} erase');
  console.log(' -l list device directory');
  console.log(' -b ignore client busy state during transfer (send request immediately after response)');
  console.log(' -p {port} use usb port other than default 0');
  console.log(' -v verbose logging');
  console.log(' -s skip download of new files');
  console.log(' -L {level} libusb logging, level 0 - 4');
  console.log(' -h usage');
  process.exit(0);
}

devices = host.getDevices();

if (!devices || !devices.length)
  console.error('No ANT devices found');

else if (argv.u) {
  console.log(host.listDevices());
} else {

  try {

    host.init(port, onInited);

  } catch (err) {
    onError(err);
  }
}

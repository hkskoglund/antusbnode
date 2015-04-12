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
    console.log('Host ' + hostname + ' connecting to device ' + deviceNumber + ' on channel ' + ch);
  });

  host.connectANTFS(channel, net, deviceNumber, hostname, argv.d, argv.e, argv.l, onConnect);

}

if (argv.h) {
  console.log('Usage: getfit -d {index} -e {index} -l -p {port} -v -L {level} -h'+'\n');
  console.log(' -h usage');
  console.log(' -d {index} or -d {index1,..,indexn} download');
  console.log(' -e {index} or -d {index1,..,indexn} erase');
  console.log(' -l list device directory');
  console.log(' -p {port} use usb port other than default 0');
  console.log(' -v verbose logging');
  console.log(' -L {level} libusb logging, level 0 - 4');
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

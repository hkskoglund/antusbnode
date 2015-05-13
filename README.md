# getfit
A utility to get FIT files from an antfs device. By default new files are downloaded to current directory.

## install

```
npm install [-g] getfit

```

## download

Download new files, if any
```
node getfit

```

Download file at index 10
```
node getfit -d 10

```
Download file at index 10,11,12
```
node getfit -d 10,11,12

```


## ls
List directory on device
```
node getfit -l
totals 4290
--w-rw--- 1 getfit antfs     1900544 Dec 31  1989 Manufacturer-1
----rw--- 1 getfit antfs      262144 Dec 31  1989 Manufacturer-2
-r--rw--- 1 getfit antfs         574 Dec 31  1989 DeviceCapabilities-3.fit
-rw-rw--- 1 getfit antfs         680 Dec 31  1989 Settings-4.fit
-rw-rw--- 1 getfit antfs        1159 Dec 31  1989 SportSettings-5.fit
-rw-rw--- 1 getfit antfs         317 Dec 31  1989 SportSettings-6.fit
-rw-rw--- 1 getfit antfs        1159 Dec 31  1989 SportSettings-7.fit
-rw-rw--- 1 getfit antfs         317 Dec 31  1989 SportSettings-8.fit
-rw-rw--- 1 getfit antfs        1197 Dec 31  1989 SportSettings-9.fit
-r--rw--- 1 getfit antfs       26135 Apr 21 18:23 Activity-10.fit
-r--rw--- 1 getfit antfs        1180 Apr 23 10:24 Activity-11.fit
-rw-rw--- 1 getfit antfs          72 Dec 31  1989 Schedule-12.fit
-rw-rw--- 1 getfit antfs         627 Dec 31  1989 Locations-13.fit
-r--rw--- 1 getfit antfs          72 Dec 31  1989 Weight-14.fit
-r--rw--- 1 getfit antfs         168 Dec 31  1989 Totals-15.fit
-rw-rw--- 1 getfit antfs          72 Dec 31  1989 Goals-16.fit
```

## erase
Erase file at index 10
```
node getfit -e 10

```

## ignore client busy state optimization
After each burst from client the state is busy and the host must wait at least 125 ms (if 8Hz channel period) for a new beacon.This optimization will ignore the busy state and assume that the client is ready for a new request (not recommended, but faster).
```
node getfit -b

```

## authorization
When a new device is discovered it will pair with it if necessary and save the key in a authorication file authorization-{client serial number}.key in current working directory.

## skip new files
```
node getfit -s

```

## usbport

By default the first available ant device found during scanning is used. All channels are reset/terminated  on the device.

Use usb port 1
```
node getfit -p 1

```

## device number
By default any device is searched for, i.e 0 is used for device number.
Search for device 1
```
node getfit -n 1
```

## list ant devices
```
node getfit -u
0 Bus 1 Number 7: ID fcf:1008
1 Bus 4 Number 2: ID fcf:1009
```

## logging

Show detailed logging of protocol negotiation as well as usb traffic
```
node getfit -v

```

## libusb debug
Specify libusb log level 0 - 4
```
node getfit -L {loglevel}

```

## troubleshoot
### linux
#### fedora
Installs libusb dependencies

    npm run fedora

#### ubuntu
Installs libusb dependencies

    npm run ubuntu

#### udev access
Sets up the permission for accessing usb sticks from userland

    npm run udev

### windows
#### LIBUSB_ERROR_ACCESS ([winusbx_claim_interface] could not access interface 0:)

libusb0 (v1.2.40.201) default driver is not compatible

Zadig utility (http://zadig.akeo.ie) can be used to change drivers to

- libusb-win32 (v1.2.6.0)
- WinUSB (v6.1.7600.16385)

## testing/debugging

### Transfer in bad RF conditions

#### terminal 1 - filtered

    node getfit -l -v | tee dump.log | egrep 'TX_FAILED|RX_FAILED|RX_FAIL|burst response timeout'

#### terminal 2

    tail -f dump.log

## licence
MIT

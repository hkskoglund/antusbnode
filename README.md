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
Host getfit connecting to device 0 on channel 0
totals 4307
--w-rw--- 1 getfit antfs     1900544 Dec 31  1989 Manufacturer-1
----rw--- 1 getfit antfs      262144 Dec 31  1989 Manufacturer-2
-r--rw--- 1 getfit antfs         574 Dec 31  1989 DeviceCapabilities-3.fit
-rw-rw--- 1 getfit antfs         680 Dec 31  1989 Settings-4.fit
-rw-rw--- 1 getfit antfs        1159 Dec 31  1989 SportSettings-5.fit
-rw-rw--- 1 getfit antfs         317 Dec 31  1989 SportSettings-6.fit
-rw-rw--- 1 getfit antfs        1159 Dec 31  1989 SportSettings-7.fit
-rw-rw--- 1 getfit antfs         317 Dec 31  1989 SportSettings-8.fit
-rw-rw--- 1 getfit antfs        1197 Dec 31  1989 SportSettings-9.fit
-r--rw--- 1 getfit antfs       36056 Apr 09 17:57 Activity-10.fit
-rw-rw--- 1 getfit antfs          72 Dec 31  1989 Schedule-11.fit
-rw-rw--- 1 getfit antfs         627 Dec 31  1989 Locations-12.fit
-r--rw--- 1 getfit antfs          72 Dec 31  1989 Weight-13.fit
-r--rw--- 1 getfit antfs         168 Dec 31  1989 Totals-14.fit
-rw-rw--- 1 getfit antfs          72 Dec 31  1989 Goals-15.fit
```

## erase
Erase file at index 10
```
node getfit -e 10

```

## authorization
When a new device is discovered it will pair with it if necessary and save the key in a authorication file authorization-{client serial number}.key in current working directory.

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
On fedora its required that
    * sudo yum install systemd-devel
    * sudo yum install gcc-c++
is installed to compile libusb dependency

## licence
MIT

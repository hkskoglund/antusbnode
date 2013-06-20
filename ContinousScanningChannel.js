﻿"use strict";

var DeviceProfile = require('./deviceProfile.js');
var DeviceProfile_HRM = require('./deviceProfile_HRM.js');
var DeviceProfile_SDM = require('./deviceProfile_SDM.js');
var CRC = require('./crc.js');
var ANT = require('./ant-lib');
var fs = require('fs');
var Channel = require('./channel.js');
var Network = require('./network.js');


function ContinousScanningChannel(nodeInstance) {
    DeviceProfile.call(this);
    this.nodeInstance = nodeInstance;
    this.deviceProfile_HRM = new DeviceProfile_HRM(nodeInstance);
    this.deviceProfile_SDM = new DeviceProfile_SDM(nodeInstance);
}

ContinousScanningChannel.prototype = DeviceProfile.prototype;

ContinousScanningChannel.constructor = ContinousScanningChannel;

ContinousScanningChannel.prototype = {

    getSlaveChannelConfiguration: function (networkNr, channelNr, deviceNr, deviceType, transmissionType, lowPrioritySearchTimeout, startupDirectory, frequency, key) {
        // Setup channel parameters for background scanning
        //console.log("Low priority search timeout", lowPrioritySearchTimeout);
        this.channel = new Channel(channelNr, Channel.prototype.CHANNEL_TYPE.receive_only_channel, networkNr, key, startupDirectory); // Channel is an event emitter
      
       // this.channel.setExtendedAssignment(Channel.prototype.EXTENDED_ASSIGNMENT.BACKGROUND_SCANNING_ENABLE);
        this.channel.setChannelId(deviceNr, deviceType, transmissionType, false);
        //this.channel.setChannelPeriod(DeviceProfile_ANTFS.prototype.CHANNEL_PERIOD);
        //this.channel.setLowPrioritySearchTimeout(lowPrioritySearchTimeout);
        //this.channel.setChannelSearchTimeout(0); // Disable High priority search
        this.channel.setChannelFrequency(frequency);
        //this.channel.setChannelSearchWaveform(DeviceProfile_ANTFS.prototype.SEARCH_WAVEFORM);

        // Functions available as callbacks
        this.channel.broadCastDataParser = this.broadCastDataParser || DeviceProfile.prototype.broadCastDataParser;
        // this.channel.parseBurstData = this.parseBurstData || DeviceProfile.prototype.parseBurstData; // Called on a complete aggregation of burst packets
        this.channel.channelResponseEvent = this.channelResponseEvent || DeviceProfile.prototype.channelResponseEvent;

        this.channel.addListener(Channel.prototype.EVENT.CHANNEL_RESPONSE_EVENT, this.channel.channelResponseEvent);
        this.channel.addListener(Channel.prototype.EVENT.BROADCAST, this.channel.broadCastDataParser);
        //this.channel.addListener(Channel.prototype.EVENT.BURST, this.channel.parseBurstData);

        this.channel.nodeInstance = this.nodeInstance; // Attach channel to nodeInstance
        this.channel.deviceProfile = this; // Attach channel to device profile
        //console.log(this.channel);
        return this.channel;
    },

    broadCastDataParser: function (data) {
        
        //channelID:
        //    { channelNumber: 0,
        //        deviceNumber: 51144,
        //        deviceTypeID: 124,
        //        transmissionType: 1,
        // TO DO : open channel for  this.channelID device profile

        var deviceProfile,
            self = this; // Emitting channel


        switch (this.channelID.deviceTypeID) {

            case DeviceProfile_HRM.prototype.DEVICE_TYPE:
                this.deviceProfile.deviceProfile_HRM.broadCastDataParser(data);
                break;

            case DeviceProfile_SDM.prototype.DEVICE_TYPE:
                this.deviceProfile.deviceProfile_SDM.broadCastDataParser(data);
                break;

            default:
                console.log(Date.now(), "Continous scanning channel BROADCAST : ", data, this.channelID);
                break;
        }

    },

    channelResponseEvent: function (data) {
        //console.log(Date.now() + " Background scanning channel RESPONSE/EVENT : ", data);
    }
};

module.exports = ContinousScanningChannel;
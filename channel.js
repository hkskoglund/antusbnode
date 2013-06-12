var events = require('events');
var util = require('util');
var Network = require('./network.js');

function Channel(channelNr, channelType, networkNr, networkKey, startupDirectory) {
    //this.host = host;
    this.number = channelNr;
    this.channelType = channelType;
    this.network = new Network(networkNr, networkKey, startupDirectory);
    //this.ANTEngine = new ANT(host, this);
}

util.inherits(Channel, events.EventEmitter);

Channel.prototype.EVENT = {
    CHANNEL_RESPONSE_EVENT : "channelResponseEvent"
},

Channel.prototype.CHANNEL_TYPE = {
    // Bidirectional
    0x00: "Bidirectional Slave Channel",
    receive_channel: 0x00, // slave
    0x10: "Bidirectional Master Channel",
    transmit_channel: 0x10, // master
    // Unidirectional
    0x50: "Master Transmit Only Channel (legacy)",
    transmit_only_channel: 0x50,
    0x40: "Slave Receive Only Channel (diagnostic)",
    receive_only_channel: 0x40,
    // Shared channels
    0x20: "Shared bidirectional Slave channel",
    shared_bidirectional_receive_channel: 0x20,
    0x30: "Shared bidirectional Master channel",
    shared_bidirectional_transmit_channel: 0x30
};

Channel.prototype.setChannelId = function (usDeviceNum, ucDeviceType, ucTransmissionType, pairing) {
    if (typeof usDeviceNum === "undefined" || typeof ucDeviceType === "undefined" || typeof ucTransmissionType === "undefined")
        console.error("Undefined parameters ", usDeviceNum, ucDeviceType, ucTransmissionType);

    this.deviceNumber = usDeviceNum; // 16-bit
    this.deviceType = ucDeviceType; // i.e HRM = 0x78 = 120 dec. 8-bit ANTWare 0 - 127, 0 = wildcard, 7-bit pairing
    if (pairing)
        this.deviceType = ucDeviceType | 0x80; // Set bit 7 high;
    this.transmissionType = ucTransmissionType;
},

Channel.prototype.setChannelPeriod = function (usMessagePeriod) {
    var rate;
    this.period = usMessagePeriod;

    switch (usMessagePeriod) {
        case 65535: rate = "0.5 Hz (65535)"; break;
        case 32768: rate = "1 Hz (32768)"; break;
        case 16384: rate = "2 Hz (16384)"; break;
        case 8192: rate = "4 Hz (8192)"; break;
        case 8070: rate = (32768 / 8070).toFixed(2) + " Hz (8070)"; break; // HRM
        case 4096: rate = "8 Hz (4096)"; break;
        default: rate = usMessagePeriod + " " + (32768 / usMessagePeriod).toFixed(2) + " Hz"; break;
    }

    this.periodFriendly = rate;
};

Channel.prototype.setChannelSearchTimeout = function (ucSearchTimeout) {
    var friendlyFormat;

    this.searchTimeout = ucSearchTimeout;

    switch (ucSearchTimeout) {
        case 0:
            friendlyFormat = "Setting search timeout for channel " + this.number + " to " + ucSearchTimeout + " = Disable high priority search mode";
            break;
        case 255:
            friendlyFormat = "Setting search timeout for channel " + this.number + " to " + ucSearchTimeout + " = Infinite search";
            break;
        default:
            friendlyFormat = "Setting search timeout for channel " + this.number + " to " + ucSearchTimeout + " = " + ucSearchTimeout * 2.5 + "sec.";
            break;
    }

    this.searchTimeoutFriendly = friendlyFormat;
};

Channel.prototype.setChannelFrequency = function (ucRFFreq) {
    var freq = 2400 + ucRFFreq, friendlyFormat;

    friendlyFormat = "Setting RF frequency to " + freq + " MHz";

    this.RFfrequency = ucRFFreq;
    this.RFfrequencyFriendly = friendlyFormat;
};

Channel.prototype.setChannelSearchWaveform = function (waveform) {
    this.searchWaveform = waveform;
};

module.exports = Channel;

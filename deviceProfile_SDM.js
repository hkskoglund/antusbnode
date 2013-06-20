var DeviceProfile = require('./deviceProfile.js');
var Channel = require('./channel.js');
var Network = require('./network.js');
var ANT = require('./ant-lib');

function DeviceProfile_SDM(nodeInstance) {
    DeviceProfile.call(this); // Call parent
    this.nodeInstance = nodeInstance;
}

DeviceProfile_SDM.protype = DeviceProfile.prototype;  // Inherit properties/methods

DeviceProfile_SDM.constructor = DeviceProfile_SDM;  // Update constructor

DeviceProfile_SDM.prototype = {

    NAME: 'SDM',

    DEVICE_TYPE: 0x7C,

    CHANNEL_PERIOD: 8134, // 4 hz

    ALTERNATIVE_CHANNEL_PERIOD: 16268,  // 2 Hz

    // Override/"property shadowing"
    getSlaveChannelConfiguration: function (networkNr, channelNr, deviceNr, transmissionType, searchTimeout, lowPrioritySearchTimeout) {

        this.channel = new Channel(channelNr, Channel.prototype.CHANNEL_TYPE.receive_channel, networkNr, Network.prototype.NETWORK_KEY.ANT, this.nodeInstance.STARTUP_DIRECTORY);

        this.channel.setChannelId(deviceNr, DeviceProfile_SDM.prototype.DEVICE_TYPE, transmissionType, false);

        this.channel.setChannelPeriod(DeviceProfile_SDM.prototype.CHANNEL_PERIOD); // Ca. 4 messages pr. second
        this.channel.setChannelSearchTimeout(searchTimeout);
        this.channel.setLowPrioritySearchTimeout(lowPrioritySearchTimeout);

        this.channel.setChannelFrequency(ANT.prototype.ANT_FREQUENCY);

        this.channel.broadCastDataParser = this.broadCastDataParser || DeviceProfile.prototype.broadCastDataParser; // Called on received broadcast data

        this.channel.nodeInstance = this.nodeInstance; // Attach channel to nodeInstance
        this.channel.deviceProfile = this; // Attach deviceprofile to channel

        //this.channel = channel; // Attach channel to device profile
        this.channel.channelResponseEvent = this.channelResponseEvent || DeviceProfile.prototype.channelResponseEvent;

        this.channel.addListener(Channel.prototype.EVENT.CHANNEL_RESPONSE_EVENT, this.channel.channelResponseEvent);
        this.channel.addListener(Channel.prototype.EVENT.BROADCAST, this.channel.broadCastDataParser);

        //console.log(this.channel);

        return this.channel;

    },

    channelResponseEvent : function (data,channelResponseMessage)
    {
       
    },

    broadCastDataParser: function (data) {
        //console.log("THIS IN BROADCAST DATA PARSER", this);
        // console.log(Date.now() + " SDM broadcast data ", data);
        var receivedTimestamp = Date.now(),
          self = this,
           UNUSED = 0x00,
           msg;// Will be cannel configuration


        // 0 = SYNC, 1= Msg.length, 2 = Msg. id (broadcast), 3 = channel nr , 4= start of page  ...
        var startOfPageIndex = 4;

       // console.log("CHANNELID AS PROPERTY", this.channelID.toProperty);
      
        //this.channelIDCache[this.channelID.toProperty].testing = "Hello there property value";
        //console.log(this.channelIDCache[this.channelID.toProperty].testing);

        var page = {
            // Header
            dataPageNumber: data[startOfPageIndex] & 0x7F,
            channelID : this.channelID,

            timestamp: Date.now()
        };

        if (typeof this.channelID === "undefined") {
            console.log(Date.now(), "No channel ID found for this master, every master has a channel ID, verify that channel ID is set (should be set during parse_response in ANT lib.)");
            console.trace();
        }

        switch (page.dataPageNumber) {

            case 1: // Main page
                page.pageType = "Main";
                page.timeFractional = data[startOfPageIndex + 1] * (1 / 200); // s
                page.timeInteger = data[startOfPageIndex + 2];
                page.time = page.timeInteger + page.timeFractional;

                page.distanceInteger = data[startOfPageIndex + 3]; // m
                page.distanceFractional = (data[startOfPageIndex + 4] & 0xF0) * (1 / 16); // Upper 4 bit
                page.distance = page.distanceInteger + page.distanceFractional;

                page.speedInteger = data[startOfPageIndex + 4] & 0x0F; // lower 4 bit
                page.speedFractional = data[startOfPageIndex + 5] * (1 / 256);   // m/s
                page.speed = page.speedInteger + page.speedFractional;

                page.strideCount = data[startOfPageIndex + 6];
                page.updateLatency = data[startOfPageIndex + 7] * (1 / 32); // s

                // Time starts when SDM is powered ON
                msg = page.pageType+ " "+page.dataPageNumber+ " ";
                if (page.time !== UNUSED)
                    msg += "SDM Time : " + page.time + " s";
                else
                    msg += "SDM Time : 0";

                if (page.distance !== UNUSED)
                    msg += " Distance : " + page.distance + " m";
                else
                    msg += " Distance : 0";

                if (page.speed !== UNUSED)
                    msg += " Speed : " + page.speed.toFixed(1);
                else
                    msg += " Speed : 0";

                msg += " Stride count : " + page.strideCount;

                if (page.updateLatency !== UNUSED)
                    msg += " Update latency : " + page.updateLatency + " s";
                else
                    msg += " Update latency : 0";

                console.log(msg);

                break;

            case 2: // Base template 

                page.pageType = "Background";
                page.cadenceInteger = data[startOfPageIndex + 3] * (1 / 200); // s
                page.cadenceFractional = (data[startOfPageIndex + 4] & 0xF0) * (1 / 16);
                page.cadence = page.cadenceInteger + page.cadenceFractional;

                page.speedInteger = data[startOfPageIndex + 4] & 0x0F; // lower 4 bit
                page.speedFractional = data[startOfPageIndex + 5] * (1 / 256);   // m/s
                page.speed = page.speedInteger + page.speedFractional;

                page.status = {
                    SDMLocation: (data[startOfPageIndex + 7] & 0xC0) >> 7,
                    BatteryStatus: (data[startOfPageIndex + 7] & 0x30) >> 4,
                    SDMHealth: (data[startOfPageIndex + 7] & 0x0C) >> 2,
                    UseState: (data[startOfPageIndex + 7] & 0x03)
                };

                switch (page.status.SDMLocation) {
                    case 0x00: page.status.SDMLocationFriendly = "Laces"; break;
                    case 0x01: page.status.SDMLocationFriendly = "Midsole"; break;
                    case 0x02: page.status.SDMLocationFriendly = "Other"; break;
                    case 0x03: page.status.SDMLocationFriendly = "Ankle"; break;
                    default: page.status.SDMLocationFriendly = "? " + page.status.SDMLocation; break;
                }

                switch (page.status.BatteryStatus) {
                    case 0x00: page.status.BatteryStatusFriendly = "OK (new)"; break;
                    case 0x01: page.status.BatteryStatusFriendly = "OK (good)"; break;
                    case 0x02: page.status.BatteryStatusFriendly = "OK"; break;
                    case 0x03: page.status.BatteryStatusFriendly = "Low battery"; break;
                    default: page.status.BatteryStatusFriendly = "? " + page.status.BatteryStatus; break;
                }

                switch (page.status.SDMHealth) {
                    case 0x00: page.status.SDMHealthFriendly = "OK"; break;
                    case 0x01: page.status.SDMHealthFriendly = "Error"; break;
                    case 0x02: page.status.SDMHealthFriendly = "Warning"; break;
                    case 0x03: page.status.SDMHealthFriendly = "Reserved"; break;
                    default: page.status.SDMHealthFriendly = "? " + page.status.SDMHealth; break;
                }

                switch (page.status.UseState) {
                    case 0x00: page.status.UseStateFriendly = "IN-ACTIVE"; break;
                    case 0x01: page.status.UseStateFriendly = "ACTIVE"; break;
                    case 0x02: page.status.UseStateFriendly = "Reserved"; break;
                    case 0x03: page.status.UseStateFriendly = "Reserved"; break;
                    default: page.status.UseStateFriendly = "? " + page.status.UseState; break;
                }


                msg = page.pageType + " "+page.dataPageNumber+" ";
                if (page.cadence !== UNUSED)
                    msg += "Cadence : " + page.cadence.toFixed(1) + " strides/min ";
                else
                    msg += "Cadence : 0";

                if (page.speed !== UNUSED)
                    msg += " Speed : " + page.speed.toFixed(1);
                else
                    msg += " Speed : 0";


                msg += " Location: " + page.status.SDMLocationFriendly + " Battery: " + page.status.BatteryStatusFriendly + " Health: " + page.status.SDMHealthFriendly + " State: " + page.status.UseStateFriendly;

                console.log(msg);

                break;


            case 0x50: // 80 Common data page
                page.pageType = "Background";
                page.HWRevision = data[startOfPageIndex + 3];
                page.manufacturerID = data.readUInt16LE(4);
                page.modelNumber = data.readUInt16LE(6);

                console.log(page.pageType+" "+page.dataPageNumber+ " HW revision: " + page.HWRevision + " Manufacturer ID: " + page.manufacturerID + " Model : " + page.modelNumber);

                break;

            case 0x51: // 81 Common data page
                page.pageType = "Background";
                page.SWRevision = data[startOfPageIndex + 3];
                page.serialNumber = data.readUInt32LE(4);

                if (page.serialNumber === 0xFFFFFFFF)
                    console.log(page.pageType+" "+page.dataPageNumber+" SW revision : " + page.SWRevision + " No serial number");
                else
                    console.log(page.pageType+" "+page.dataPageNumber+" SW revision : " + page.SWRevision + " Serial number: " + page.serialNumber);

                break;

            case 0x52: // 82 Common data page - Battery Status
                //console.log("Battery status : ",data);
                page.pageType = "Background";
                page.descriptive = {
                    coarseVoltage: data[startOfPageIndex + 7] & 0x0F,        // Bit 0-3
                    batteryStatus: (data[startOfPageIndex + 7] & 0x70) >> 4, // Bit 4-6
                    resoultion: (data[startOfPageIndex + 7] & 0x80) >> 7 // Bit 7 0 = 16 s, 1 = 2 s
                };

                var divisor = (page.resolution === 1) ? 2 : 16;


                page.cumulativeOperatingTime = (data.readUInt32LE(startOfPageIndex + 3) & 0x00FFFFFF) / divisor; // 24 - bit only
                page.fractionalBatteryVoltage = data[startOfPageIndex + 6] / 256; // Volt
                if (page.descriptive.coarseVoltage === 0x0F)
                    page.batteryVoltage = "Invalid";
                else
                    page.batteryVoltage = page.fractionalBatteryVoltage + page.descriptive.coarseVoltage;

                msg = "";
                switch (page.descriptive.batteryStatus) {
                    case 0x00: msg += "Reserved"; break;
                    case 0x01: msg += "New"; break;
                    case 0x02: msg += "Good"; break;
                    case 0x03: msg += "OK"; break;
                    case 0x04: msg += "Low"; break;
                    case 0x05: msg += "Critical"; break;
                    case 0x06: msg += "Reserved"; break;
                    case 0x07: msg += "Invalid"; break;
                    default: msg += "? - " + page.descriptive.batteryStatus;
                }

                //console.log(page);

                var batteryVoltageToString = function (voltage) {
                    if (typeof voltage === "number")
                        return voltage.toFixed(1);
                    else
                        return ""+voltage;
                }

                console.log(page.pageType + " "+page.dataPageNumber+" Cumulative operating time (s): " + page.cumulativeOperatingTime + " Battery (V) " + batteryVoltageToString(page.batteryVoltage) + " Battery status: " + msg);
                break;

            default:

                console.log("Page ", page.dataPageNumber, " parsing not implemented.");
                break;
        }
    }
};

module.exports = DeviceProfile_SDM;
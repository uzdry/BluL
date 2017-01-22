function BLEScanner(){

    this.foundDevices = [];
    this.connectedDevices = [];

    this.startScanning = function(){
        /* Applying nice changes to the scan button */
        $$("#scanButton").addClass("disabled");
        $$("#scanButton").text('Scanning ...');
        setTimeout(function(){
            $$("#scanButton").removeClass("disabled");
            $$("#scanButton").text('Scan for devices');
        }, 10000);

        console.log("Started Scanning");

        ble.isEnabled(null, function(){
            myApp.alert("Bluetooth is not enabled", "Info");
            $$("#scanButton").removeClass("disabled");
            $$("#scanButton").text('Scan for devices');
        });

        $$("#deviceList").html("");

        /* Starting the scan */
        ble.scan([], 10, function(device) {
            console.log(JSON.stringify(device));
            $$('#deviceList').append(this.generateDeviceLink(device));
            this.foundDevices[device.id] = device;
        }.bind(this), function(err){
            console.log(JSON.stringify(err));

        });
    };

    this.connect = function(id){

        console.log("trying to connect to " + id);

        ble.connect(id, function(device){

            this.connectedDevices[device.id] = device;
            fman.saveDevice(device);
            console.log("connected to: " + device.id);

            //TODO Change the view

        }.bind(this), function(device){

            console.log("not worked: " + device.id);
            delete this.connectedDevices[device.id];

        }.bind(this));
    };

    /**
     * Generates the necessary html-text for the listview
     * @param device
     * @returns {string}
     */
    this.generateDeviceLink = function(device){
        return "<li>" +
            "<a href='#' class='item-link item-content' onclick='bleScanner.connect(\"" + device.id + "\")'>" +
            "<div class='item-inner'>" +
            "<div class='item-title-row'>" +
            "<div class='item-title'>" + device.name + "</div>" +
            "<div class='item-after'>" + device.id + "</div>" +
            "</div>" +
            "<div class='item-subtitle'>" + device.rssi + "dB</div>" +
            "</div>" +
            "</a>" +
            "</li>";

    }

}
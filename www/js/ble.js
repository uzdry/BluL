function BLEScanner() {

    this.foundDevices = [];
    this.connectedDevices = [];

    this.startScanning = function () {
        /* Applying nice changes to the scan button */
        $$("#scanButton").addClass("disabled");
        $$("#scanButton").text('Scanning ...');
        setTimeout(function () {
            $$("#scanButton").removeClass("disabled");
            $$("#scanButton").text('Scan for devices');
        }, 10000);

        console.log("Started Scanning");

        ble.isEnabled(null, function () {
            myApp.alert("Bluetooth is not enabled", "Info");
            $$("#scanButton").removeClass("disabled");
            $$("#scanButton").text('Scan for devices');
        });

        $$("#deviceList").html("");

        /* Starting the scan */
        ble.scan([], 10, function (device) {
            console.log(JSON.stringify(device));
            $$('#deviceList').append(this.generateDeviceLink(device));
            this.foundDevices[device.id] = device;
        }.bind(this), function (err) {
            console.log(JSON.stringify(err));
        });
    };

    this.connect = function (id) {

        if (this.connectedDevices[id]) console.log("CONNECTED DEVICE"); //TODO something when it is already connected

        var connecting = id;
        myApp.showPreloader('Connecting..');

        ble.connect(id, function (device) {

            var nDevice = this.addJsonInformation(device);

            this.connectedDevices[nDevice.id] = nDevice;

            if (fman.devices[id]) console.log("KNOWN DEVICE");
            fman.saveDevice(nDevice);
            console.log("connected to: " + nDevice.id);

            mainView.router.load({
                template: myApp.templates.deviceView,
                context: nDevice
            });

            connecting = "";

            myApp.hidePreloader();

        }.bind(this), function (device) {

            delete this.connectedDevices[device.id];

            if (device.id == connecting) {
                myApp.hidePreloader();
                myApp.alert("Connection to " + device.id + " failed");
            } else {
                myApp.alert("Device " + device.id + " disconnected");
            }

        }.bind(this));
    };


    /**
     * Generates the necessary html-text for the listview
     * @param device
     * @returns {string}
     */
    this.generateDeviceLink = function (device) {
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

    this.addJsonInformation = function (device) {
        var newDevice = device;
        for (var i = 0; i < newDevice.characteristics.length; i++) {
            newDevice.characteristics[i]['name'] = newDevice.characteristics[i].characteristic;
            newDevice.characteristics[i]['unit'] = '';
            newDevice.characteristics[i]['format'] = 'uint8';
            newDevice.characteristics[i]['formula'] = 'x';
        }

        return newDevice;
    };

    this.loadService = function (device_id, service_index) {
        var device = this.connectedDevices[device_id];
        var char = device.characteristics[service_index];

        if (char.properties.indexOf("Read") >= 0) {

            ble.read(device.id, char.service, char.characteristic, function (data) {

                var value = this.rawToValue(char, data);
                value = this.calculate(char, value);
                myApp.alert(value + "");

            }.bind(this));

        } else if (char.properties.indexOf("Write") >= 0) {

            myApp.prompt("Write:", function (value) {

                ble.write(device.id, char.service, char.characteristic, this.valueToRaw(char, value));  //TODO Callbacks

            });

        }

    };

    this.rawToValue = function (char, value) {
        var parsed;
        switch (char.format) {
            case "uint8":
                parsed = new Uint8Array(value);
                break;
            case "int8":
                parsed = new Int8Array(value);
                break;
            case "int16":
                parsed = new Int16Array(value);
                break;
            case "uint16":
                parsed = new Uint16Array(value);
                break;
            case "ASCII":
                parsed = String.fromCharCode.apply(null, new Uint8Array(buffer));
                break;
            case "uint32":
                parsed = new Uint32Array(value);
                break;
            case "int32":
                parsed = new Int32Array(value);
                break;
            case "float32":
                parsed = new Float32Array(value);
                break;
        }
        var x = parsed[0];

        return x;

    };

    this.valueToRaw = function (char, value) {
        var parsed;
        switch (char.format) {
            case "uint8":
                parsed = new Uint8Array(parseInt(value)).buffer;
                break;
            case "int8":
                parsed = new Int8Array(parseInt(value)).buffer;
                break;
            case "int16":
                parsed = new Int16Array(parseInt(value)).buffer;
                break;
            case "uint16":
                parsed = new Uint16Array(parseInt(value)).buffer;
                break;
            case "ASCII":
                parsed = String.fromCharCode.apply(null, new Uint8Array(buffer));
                break;
            case "uint32":
                parsed = new Uint32Array(parseInt(value)).buffer;
                break;
            case "int32":
                var array = new Uint8Array(string.length);
                for (var i = 0, l = string.length; i < l; i++) {
                    array[i] = string.charCodeAt(i);
                }
                parsed = array.buffer;
                break;
            case "float32":
                parsed = new Float32Array(parseFloat(value)).buffer;
                break;
            case "float64":
                parsed = new Float64Array(parseFloat(value)).buffer;
                break;
        }

        return parsed;
    };

    this.calculate = function (char, value) {
        var x = value;
        var result = eval(char.formula);
        return result;
    }

}
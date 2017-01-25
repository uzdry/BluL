function Recorder(){
    Chart.defaults.global.maintainAspectRatio = false;
    Chart.defaults.global.responsive = true;

    this.curRecordings = "";
    this.curDevice = "";
    this.recDevice = "";
    this.graph = "";
    this.curValues = "";



    this.showRecInitList = function(id) {
        console.log("Showing Recording Init List");
        var device = bleScanner.connectedDevices[id];

        var nDevice = {
            id: device.id,
            name: device.name,
            rssi: device.rssi,
            characteristics: []
        };

        for (var i = 0; i < device.characteristics.length; i++) {
            var properties = device.characteristics[i].properties;

            if (properties.indexOf("Notify") > -1 || properties.indexOf("Indicate") > -1)
                nDevice.characteristics.push(device.characteristics[i]);

        }

        mainView.router.load({
            template: myApp.templates.recInitList,
            context: nDevice
        });

        this.curDevice = nDevice;
    };


    this.startRecording = function (id){


        var device = this.curDevice;
        var formData = myApp.formToJSON('#recorder-select-form');

        var nDevice = {
            id: device.id,
            name: device.name,
            rssi: device.rssi,
            characteristics: []
        };

        for(var i = 0; i < device.characteristics.length; i++){
            var char = device.characteristics[i];

            if(formData[char.characteristic + "|" + char.service][0] === "on")
                nDevice.characteristics.push(char);
        }

        fman.initSavingValues(nDevice);

        this.recDevice = nDevice;
        myApp.onPageInit("recordingGraph", this.initRecording.bind(this));

        mainView.router.load({
            template: myApp.templates.recordingGraph
        });



    };

    this.initRecording = function(page){
        //Init the Chart
        this.initChart();

        var device = this.recDevice;

        //Start notifications for all devices
        for(var i = 0; i < device.characteristics.length; i++){
            var char = device.characteristics[i];

            if(char.properties.indexOf("Read") >= 0) {

                ble.read(device.id, char.service, char.characteristic, this.receive.bind(this, i),
                    function (err) {
                        console.log(JSON.stringify(err))
                    }
                );
            }

            // Start notification to update all other values
            ble.startNotification(device.id, char.service, char.characteristic, this.receive.bind(this, i),
                function (err){
                    console.log(JSON.stringify(err))
                }
            );
        }
    };

    this.initChart = function(){
        var device = this.recDevice;
        var datasets = [];


        $$('#myChart').attr('width', $$(window).height());
        $$('#myChart').attr('height', $$(window).width());


        for(var i = 0; i < device.characteristics.length; i++){
            datasets.push({
                label: device.characteristics[i]['name'],
                data: [],
                fill: false,
                borderColor:this.getRandomColor()
            });
        }

        this.graph = new Chart(document.getElementById("myChart").getContext("2d"), {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            format: "HH:mm:ss",
                            unit: 'minute',
                            unitStepSize: 1,
                            displayFormats: {
                                'seconds': 'HH:mm:ss',
                                'minute': 'HH:mm:ss',
                                'hour': 'HH:mm:ss',
                                min: moment(new Date()).format('HH:mm:ss')
                            }
                        }
                    }]
                }
            }
        });

        window.addEventListener('orientationchange', this.doOnOrientationChange.bind(this));

    };

    this.doOnOrientationChange = function(event){


        $$('#myChart').attr('width', $$(window).width());
        $$('#myChart').attr('height', $$(window).height());
        this.graph.resize();
        this.graph.update();


    };

    this.receive = function(charIndex, msg){
        var device = this.recDevice;
        var char = device.characteristics[charIndex];

        var value = bleScanner.rawToValue(char, msg);

        var time = moment(new Date()).format('HH:mm:ss');

        // Add the value to the file before calculating the exact value;
        fman.writeValueToFile(char, value, time);



        // Now calculate via the formula
        value = bleScanner.calculate(char, value);

        this.graph.data.datasets[charIndex].data.push({x: time, y:value});
        this.graph.update();

    };


    this.getRandomColor = function() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }


    /*-----------------------------------
     *  Saved Recordings
     -----------------------------------*/
    $$(document).on('click', '.panel .recordings-link', function openRecordingDevices(){

        var devices = [];

        for(var i in fman.devices){
            devices.push(fman.devices[i]);
        }

        mainView.router.load({
            template: myApp.templates.recordingsDevices,
            animatePages:false,
            context:{
                devices:devices
            }
        });

    });

    this.listRecordings = function(id){
        fman.readRecordings(id);
    };

    this.showRecordings = function(pkg){

        this.curRecordings = pkg.recordings;

        mainView.router.load({
            template: myApp.templates.recordings,
            animatePages:false,
            context:{
                recordings:pkg.recordings,
                id:pkg.id
            }
        });

    };

    this.showRecording = function(index){

        var recording = this.curRecordings[index];

        myApp.showPreloader("Loading Recording");

        fman.readRecording(recording);

    }

    this.showRecordingData = function(data){
        var splitted = data.split('\n');
        var device = JSON.parse(splitted[0]);
        var values = [];
        for(var i = 1; i < splitted.length-1; i++){
            values.push(JSON.parse(splitted[i]));
        }

        this.curValues = values;
        this.recDevice = device;

        myApp.hidePreloader();

        mainView.router.load({
            template: myApp.templates.recordedGraph,
            animatePages:false,
            context:{
                device:device,
                data: values
            }
        });

    };

    this.deleteRecording = function(index){
        var recording = this.curRecordings[index];

        fman.deleteRecording(recording);
    };

    this.showRecordedGraph = function(page){

        var datasets = [];
        var indizes = [];

        var device = this.recDevice;
        var values = this.curValues;

        for(var i = 0; i < device.characteristics.length; i++){

            var char = device.characteristics[i];
            indizes[char.service + char.characteristic] = i;

            datasets.push({
                label: device.characteristics[i]['name'],
                data: [],
                fill: false,
                borderColor:this.getRandomColor()
            });
        }

        $$('#recordedChart').attr('width', $$(window).height());
        $$('#recordedChart').attr('height', $$(window).width());

        this.graph = new Chart(document.getElementById("recordedChart").getContext("2d"), {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            format: "HH:mm:ss",
                            unit: 'minute',
                            unitStepSize: 1,
                            displayFormats: {
                                'seconds': 'HH:mm:ss',
                                'minute': 'HH:mm:ss',
                                'hour': 'HH:mm:ss',
                                min: moment(new Date()).format('HH:mm:ss')
                            }
                        }
                    }]
                }
            }
        });

        for(var i = 0; i < values.length; i++){
            var val = values[i];

            var index = indizes[val.service + val.characteristic];

            this.graph.data.datasets[index].data.push({x: val.time, y:val.value});
        }
        this.graph.update();


    };

    myApp.onPageInit("recordedGraph", this.showRecordedGraph.bind(this));


}
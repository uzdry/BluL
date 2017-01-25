/**
 * Created by soads on 21.01.2017.
 */
function FileManager() {

    this.devices = [];
    var self = this;

    /*-------------------------------
     * Reading in the Initial Config
     -------------------------------*/
    this.readConfigs = function () {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {
            directoryEntry.getDirectory('BluL', {create: true, exclusive: false}, this.readConfigDirectories.bind(this));
        }.bind(this));
    };

    this.readConfigDirectories = function (dirEntry) {
        var directoryReader = dirEntry.createReader();
        directoryReader.readEntries(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                entries[i].getFile("config.json", {create: true, exclusive: false}, this.readConfigFile.bind(this));
            }
        }.bind(this));
    };

    this.readConfigFile = function (fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function () {

                try{
                    var device = JSON.parse(this.result);

                    self.devices[device.id] = device;
                }catch (error){
                    console.log("error: " + JSON.stringify(error));
                }

            };

            reader.readAsText(file);

        }.bind(this));
    };

    /*----------------------------------------
     * Creating a folder with matching config
     ----------------------------------------*/

    this.saveDevice = function (device) {
        console.log("Saving device...");
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {
            directoryEntry.getDirectory('BluL', {create: true, exclusive:false}, function (dirEntry) {
                var dirName = device.id.replace(/:/g, '-');
                dirEntry.getDirectory(dirName, {create: true, exclusive:false}, function (dirEntry2) {
                    dirEntry2.getFile("config.json", {create: true, exclusive:false}, function (fileEntry) {
                        this.writeFile(fileEntry, JSON.stringify(device, null, 4));
                        this.devices[device.id] = device;
                    }.bind(this), function(e){console.error(e);});
                }.bind(this), function(e){console.error(e);});
            }.bind(this), function(e){console.error(e);});
        }.bind(this), function(e){console.error(e);});
    };

    this.writeFile = function(fileEntry, dataObj) {
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                //console.log("Successful file write...");
            };

            fileWriter.onerror = function (e) {
                console.log("Failed file write: " + JSON.stringify(e));
            };

            // If data object is not passed in,
            // create a new Blob instead.
            if (!dataObj) {
                dataObj = new Blob(['some file data'], { type: 'text/plain' });
            }

            fileWriter.write(dataObj);
        });
    };

    this.removeDevice = function(id){

        delete this.devices[id];

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {
            directoryEntry.getDirectory('BluL', {create: true, exclusive:false}, function (dirEntry) {
                var dirName = id.replace(/:/g, '-');
                dirEntry.getDirectory(dirName, {create: true, exclusive:false}, function (dirEntry2) {
                    dirEntry2.removeRecursively(function(){console.log("JEY")}, function(){console.log("oh")});
                }.bind(this), function(e){console.error(e);});
            }.bind(this), function(e){console.error(e);});
        }.bind(this), function(e){console.error(e);});
    }


    /*-----------------------------------
     *      Saving values to file
     -----------------------------------*/

    this.curValWriter = "NOT INITIATED";
    this.writeBuffer = [];

    this.initSavingValues = function(device){
        this.curValWriter = "NOT INITIATED";
        this.writeBuffer = [];


        var fileName = moment(new Date()).format('MM-DD-YYYY_HH-mm-ss') + ".txt";
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {

            directoryEntry.getDirectory('BluL', {create: true, exclusive:false}, function (dirEntry) {

                var dirName = device.id.replace(/:/g, '-');
                dirEntry.getDirectory(dirName, {create: true, exclusive:false}, function (dirEntry2) {

                    dirEntry2.getFile(fileName, {create: true, exclusive:false}, function (fileEntry) {

                        fileEntry.createWriter(function (fileWriter) {

                            fileWriter.onwriteend = function() {
                                //console.log("Successful file write...");
                            };

                            fileWriter.onerror = function (e) {
                                console.log("Failed file write: " + e.toString());
                            };

                            fileWriter.write(JSON.stringify(device) + "\n");

                            this.curValWriter = fileWriter;

                        }.bind(this), function(e){console.error(e);});

                    }.bind(this), function(e){console.error(e);});

                }.bind(this), function(e){console.error(e);});

            }.bind(this), function(e){console.error(e);});

        }.bind(this), function(e){console.error(e);});

    };

    this.writeValueToFile = function(char, value, time){

        var string = {
            name: char.name,
            service: char.service,
            characteristic: char.characteristic,
            value: value,
            time: time
        };

        if(this.curValWriter === "NOT INITIATED"){
            console.log("maybe");
            this.writeBuffer += JSON.stringify(string) + "\n";
        }else{
            try {
                this.curValWriter.write("" + this.writeBuffer + JSON.stringify(string) + "\n");
                this.writeBuffer = "";
            }catch(e){
                console.log("Error: " + JSON.stringify(e));
            }
        }
    };


    this.readRecordings = function (id) {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {

            directoryEntry.getDirectory('BluL', {create: true, exclusive: false}, function(dirEntry){

                var dirName = id.replace(/:/g, '-');
                dirEntry.getDirectory(dirName, {create: true, exclusive: false}, function(dirEntry2){

                    var directoryReader = dirEntry2.createReader();
                    directoryReader.readEntries(function (entries) {

                        recorder.showRecordings({recordings: entries, id: id});

                    }.bind(this), function(e){console.log(JSON.stringify(e))});
                }.bind(this), function(e){console.log(JSON.stringify(e))});
            }.bind(this), function(e){console.log(JSON.stringify(e))});
        }.bind(this), function(e){console.log(JSON.stringify(e))});
    };

    this.readRecording = function(entry){

        entry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function() {
                recorder.showRecordingData(this.result);
            };

            reader.readAsText(file);

        }, function(e){console.log(JSON.stringify(e))});
    }

    this.deleteRecording = function(entry){
        entry.remove();
    }


};
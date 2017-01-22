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
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {
            directoryEntry.getDirectory('BluL', {create: true, exclusive:false}, function (dirEntry) {
                var dirName = device.id.replace(/:/g, '-');
                dirEntry.getDirectory(dirName, {create: true, exclusive:false}, function (dirEntry2) {
                    dirEntry2.getFile("config.json", {create: true, exclusive:false}, function (fileEntry) {
                        this.writeFile(fileEntry, JSON.stringify(device));
                    }.bind(this), function(e){console.error(e);});
                }.bind(this), function(e){console.error(e);});
            }.bind(this), function(e){console.error(e);});
        }.bind(this), function(e){console.error(e);});
    };

    this.writeFile = function(fileEntry, dataObj) {
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                console.log("Successful file write...");
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


};
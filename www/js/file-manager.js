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
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (directoryEntry) {
            directoryEntry.getDirectory('BlueL', {create: true}, this.readConfigDirectories.bind(this));
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
                console.log("Successful file read: " + this.result);
                console.log(fileEntry.fullPath + ": " + this.result);

                var device = JSON.parse(this.result);

                self.devices[device.id] = device;
            };

            reader.readAsText(file);

        }.bind(this));
    };

    /*----------------------------------------
     * Creating a folder with matching config
     ----------------------------------------*/

    this.saveDevice = function (device) {
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (directoryEntry) {
            directoryEntry.getDirectory('BlueL', {create: true}, function (dirEntry) {
                var dirName = device.id.replace(/:/g, '-');
                dirEntry.getDirectory(dirName, {create: true}, function (dirEntry) {
                    dirEntry.getFile("config.json", {create: true}, function (fileEntry) {
                        fileEntry.createWriter(function (fileWriter) {
                            fileWriter.write(JSON.stringify(device));
                        })
                    })
                });
            });
        });
    };


};
/**
 * Created by soads on 23.01.2017.
 */
function DeviceManager(){
    this.curDevice = "";
    this.serviceParamsChanged = false;
    this.savedContext = "";

    $$(document).on('click', '.panel .saved-devices-link', function searchSavedDevices(){

        var devices = [];

        for(var i in fman.devices){
            devices.push(fman.devices[i]);
        }

        mainView.router.load({
            template: myApp.templates.savedDevices,
            animatePages:false,
            context:{
                devices:devices
            }
        });

    });


    this.loadDevice = function(id){
        var device = fman.devices[id];
        this.curDevice = device;

        this.serviceParamsChanged = false;

        mainView.router.load({
            template: myApp.templates.savedDeviceServices,
            anitmatePages:true,
            context: device,
            reload: false
            }
        );
    };

    this.changeService = function(index){
        mainView.router.load({
            template: myApp.templates.savedDevServDetails,
            context:{
                service: this.curDevice.characteristics[index],
                index: index
            }
        });
    };

    myApp.onPageBack("savedDevServDetails", function(page){

        console.log("hi");
        console.log(this.serviceParamsChanged);

        // Check if the data has been changed
        if(!this.serviceParamsChanged) return;


        console.log("Updating service parameters");

        var formData = myApp.formToJSON('#service-form');
        var device = this.curDevice;
        var index = page.context.index;

        device.characteristics[index]['name'] = formData.name;
        device.characteristics[index]['unit'] = formData.unit;
        device.characteristics[index]['formula'] = formData.formula;
        device.characteristics[index]['format'] = formData.format;

        fman.saveDevice(device);
        fman.devices[device.id] = device;

        this.savedContext = device;

    }.bind(this));

    myApp.onPageAfterAnimation("savedDeviceServices", function(page){
        if(page.from === "left" && this.savedContext != "") {
            setTimeout(function(){
                mainView.router.load({
                    reload:true,
                    template: myApp.templates.savedDeviceServices,
                    context: this.savedContext
                });
            }.bind(this), 0);
        }
    }.bind(this));

    this.deleteSavedDevice = function(id){
        fman.removeDevice(id);
    }

}
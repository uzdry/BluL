# BluL
BluL is a BLE-Tools for Developers and Techies.

It makes it possible to scan for BLE-Devices, connect with them, see the
different available characteristics and services, read their values and
even record all signals with notify function.

## Discovery and Recording
The startup layout is quite simple. on top there is the button to search for near BLE-Devices.
All Devices will be added directly below showing the name, the mac-address and the rssi.

### Menu
You can access the menu either by swiping from the left boarder to the right or via the menu button on the upper left side.
    
### Device Details
After pushing a device on the startscreen. In this view you can see different general information and a list of all available services.
Each service includes the characteristic, the name and the properties (i.e. "Read", "Notify" ...)
Click on a service to either read or write it.

By clicking the floating round button on the lower left you get to the Record View.

### Record View
In this view you can select all notifiable services and start a recording those.
By clicking the start-recording button you get to the graph-view
    
### Graph View
Here it is possible to see the the current recording of services. Here it is to be mentioned that there are only new values when the app is notified by the BLE-Device

## Saved Devices
Over the menu you can reach the saved devices visible as the Name and MAC-Adress.
It is possible to remove a saved device by swiping it to the left and clicking on "delete".

### Saved Device Details
You reach the details of a saved device by pushing it on the saved devices view.
In here you see several general information about the device and all available services.

It is also possible to adjust the config of all services of that device.

### Service Adjusting
In the Service-View you can adjust a custom name, the unit, the formula to calculate the real value, and the format in which it is send.
The formula uses javascript eval with 'x' as value.

## Recordings
In the Recordings you can first see all saved devices. After a push you can see all recordings of this device.
After choosing a recording you can see the same chart which from the original recording.
You can remove a recording by swiping it into the left and clicking "delete".




  
/****************************************
 *    Initialisation
 ****************************************/

// Code for platform detection
var isMaterial = Framework7.prototype.device.ios === false;
var isIos = Framework7.prototype.device.ios === true;

// Add the above as global variables for templates
Template7.global = {
    material: isMaterial,
    ios: isIos
};

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;




// A stringify helper
// Need to replace any double quotes in the data with the HTML char
//  as it is being placed in the HTML attribute data-context
function stringifyHelper(context) {
    var str = JSON.stringify(context);
    return str.replace(/"/g, '&quot;');
}

Template7.registerHelper('stringify', stringifyHelper);


if (!isIos) {
    // Change class
    $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
    // And move Navbar into Page
    $$('.view .navbar').prependTo('.view .page');
}

// Initialize app
var myApp = new Framework7({
    material: isIos? false : true,
    template7Pages: true,
    precompileTemplates: true,
    swipePanel: 'left',
    swipePanelActiveArea: '30',
    swipeBackPage: true,
    animateNavBackIcon: true,
    pushState: !!Framework7.prototype.device.os,
    swipeout: true
});

// Other objects for usage
var bleScanner = new BLEScanner();
var fman = new FileManager();
var recorder = new Recorder();
var devMan = new DeviceManager();


// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
    domCache: true

});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

    //TODO file reading with saved devices
    fman.readConfigs();

});


// Load the discovery-view
$$(document).on('click', '.panel .discover-link', function discoverLink() {
    // Only change route if not already on the index
    //  It would be nice to have a better way of knowing this...
    var indexPage = $$('.page[data-page=index]');
    if (indexPage.hasClass('cached')) {
        mainView.router.load({
            pageName: 'index',
            animatePages: false,
            reload: true
        });
    }
});



/*** Z-Way Home Automation Engine main executable *****************************

Version: 0.1.2
(c) ZWave.Me, 2013

-------------------------------------------------------------------------------
Author: Gregory Sitnin <sitnin@z-wave.me>

Description:
  This is a main executable script which is loaded and executed solely
  by the z-way-server daemon. The very magic starts here.

******************************************************************************/

//--- Define global variables and helpers

var window = global = this;

var console = {
    log: debugPrint,
    warn: debugPrint,
    error: debugPrint,
    debug: debugPrint
};

function inherits (ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
}

// Array.prototype.has = function (value) {
//     return -1 != this.indexOf(value);
// };

function in_array (array, value) {
    return -1 != array.indexOf(value);
}

function has_key (obj, key) {
    return -1 != Object.keys(obj).indexOf(key);
}

function get_values (obj) {
    var res = [];

    Object.keys(obj).forEach(function (key) {
        res.push(obj[key]);
    });

    return res;
}

//--- Load configuration


var config;
try {
    config = loadJSON("config.json");
} catch (ex) {
    console.log("Error loading config.json:", ex.message);
}

if (!config) {
    console.log("Can't read config.json or it's broken.");
    console.log("Please, provide correct config.json (look at the config-sample.json for reference) and restart service.");
    console.log("ZAutomation engine not started.");
} else {
    config.libPath = "lib";
    config.classesPath = "classes";
    config.resourcesPath = "res";

    //--- Load constants & 3d-party dependencies

    executeFile("constants.js");
    executeFile(config.libPath + "/eventemitter2.js");

    //--- Load Automation subsystem classes

    executeFile(config.classesPath+"/AutomationController.js");
    executeFile(config.classesPath+"/AutomationModule.js");
    executeFile(config.classesPath+"/VirtualDevice.js");

    //--- Instantiate Automation Controller

    var controller = new AutomationController(config.controller, config["vdevInfo"] || {});

    controller.on('init', function () {
        controller.run();
    });

    controller.on('error', function (err) {
        console.log("--- ERROR:", err.message);
    });

    controller.on('run', function () {
        console.log('ZWay Automation Controller started');

        //--- Initialize webserver
        executeFile("webserver.js");
    });

    //--- main

    controller.init();
}


var sceneLastActive = 0;
var sceneCurrentActive = 0;

//console.log("STRINGIFIED>>>>>>>>>>>>>:" + JSON.stringify(zway.devices[5]));
//console.log("STRINGIFIED>>>>>>>>>>>>>:" + JSON.stringify(zway.devices[13]));

// The foolowing code block assumes:
// The Scene Controller has association with the Razberry device (#13).
// and it is set up via the Z-Way interface, so that Device shows up under Group 1...4 in "Device Configuration"

zway.devices[13].instances[0].SceneActivation.data.currentScene.bind(function() { 
  try {
	  sceneCurrentActive = this.value;
	  if (sceneCurrentActive != sceneLastActive) {
		  console.log("Handling scene change to " + sceneCurrentActive);
	      switch(sceneCurrentActive) {
			  
			 //Leviton Scene Controller 1st Left
			 case 2:
		        zway.devices[7].SwitchBinary.Set(255);
                zway.devices[8].SwitchBinary.Set(255);
                zway.devices[9].SwitchBinary.Set(255);
                zway.devices[10].SwitchMultilevel.Set(60);
                zway.devices[11].SwitchMultilevel.Set(60);
		     break;
             
			 //Leviton Scene Controller 2nd Left
			 case 3:
                zway.devices[10].SwitchMultilevel.Set(100);
                zway.devices[11].SwitchMultilevel.Set(60);
             break;
	     	 
			 //Leviton Scene Controller 3rd Left
			 case 4:
            	zway.devices[9].SwitchBinary.Set(255);
	     	 break;
		     
			 //Leviton Scene Controller 1st Right
			 case 5:
		        zway.devices[7].SwitchBinary.Set(0);
                zway.devices[8].SwitchBinary.Set(0);
                zway.devices[9].SwitchBinary.Set(0);
                zway.devices[10].SwitchMultilevel.Set(0);
                zway.devices[11].SwitchMultilevel.Set(0);
             break;
             
			 //Leviton Scene Controller 2nd Right
			 case 6:
                 setTimeout(function() {
                     zway.devices[10].SwitchMultilevel.Set(0);
                     zway.devices[11].SwitchMultilevel.Set(0); 
                 }, 2*60*1000);
		     break;
			 
			 //Leviton Scene Controller 3rd Right
		     case 7:
                zway.devices[9].SwitchBinary.Set(0); // Under Cabinet Lights
             break;
	      }
      }
      sceneLastActive = sceneCurrentActive;
  } catch (ex) {
	  console.log("Exception in scene activation callback: " + ex.message);
  } 
});


console.log(">>>>>>>>>>>>>>>>>>>End of main.js");

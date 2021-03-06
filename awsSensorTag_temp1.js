var iot = {};
//importing aws iot library


 


var awsIot = require('aws-iot-device-sdk');

var myThingName = 'Raspi3_2';

 
//create thing shadows with keys and certs

var thingShadows = awsIot.thingShadow({
    keyPath: '/home/pi/certs/private.pem.key',
    certPath: '/home/pi/certs/certificate.pem.crt',
    caPath: '/home/pi/certs/ca.pem',
    clientId: myThingName,
    region: 'ap-southeast-2'
});


var ledOff = {"state":{"reported":{"ledStatus":"OFF"}}}
var ledON = {"state":{"reported":{"ledStatus":"ON"}}}

var sensorRead = {"state":{"reported":{"analogRead":"343"}}}
var SensorTag = require('sensortag');       // sensortag library

//handle thingShadow events

thingShadows.on('connect', function() {

    console.log("Connected...");

    thingShadows.register( myThingName );

// An update right away causes a timeout error, so we wait about 2 seconds

    setTimeout( function() {

        console.log("Updating my IP address...");

        clientTokenIP = thingShadows.update(myThingName, ledOff);

        console.log("Update:" + clientTokenIP);

    }, 2500 );

 

// Code below just logs messages for info/debugging

    thingShadows.on('status',

        function(thingName, stat, clientToken, stateObject) {

            console.log('received '+stat+' on '+thingName+': '+

                JSON.stringify(stateObject));

        });

    thingShadows.on('update',

        function(thingName, stateObject) {

            console.log('received update '+' on '+thingName+': '+

                JSON.stringify(stateObject));

        });

    thingShadows.on('delta',

        function(thingName, stateObject) {


            console.log('received delta ::::'+' on '+thingName+': '+

                JSON.stringify(stateObject));
            //TOGGLE! AND REPORT!

            console.log("saldra");

 
    clientTokenIP = thingShadows.update(myThingName, sensorRead);


            //INCOMPLETE? 
            if (stateObject.state.ledStatus === "ON") {

                console.log("ledStatus ON");

                // clientTokenIP = thingShadows.update(myThingName, ledON);

 

            }else if (stateObject.state.ledStatus === "OFF") {
                
                 console.log("ledStatus OFF");

                // clientTokenIP = thingShadows.update(myThingName, ledOff);


            }

        });

    thingShadows.on('timeout',

        function(thingName, clientToken) {

            console.log('received timeout for '+ clientToken)

        });

    thingShadows

        .on('close', function() {

            console.log('close');

        });

    thingShadows

        .on('reconnect', function() {

            console.log('reconnect');

        });

    thingShadows

        .on('offline', function() {

            console.log('offline');

        });

    thingShadows

        .on('error', function(error) {

            console.log('error', error);

        });


//trigger, 
 

    var stdin = process.openStdin();

    stdin.addListener("data", function(d) {
            // note:  d is an object, and when converted to a string it will
            // end with a linefeed.  so we (rather crudely) account for that  
            // with toString() and then trim() 
            console.log("you entered: [" + 
            d.toString().trim() + "]");
               
            clientTokenIP = thingShadows.update(myThingName, {
        "state": {
            "reported": {
            "thingName":"ss9",
            "actuator_Laser":d.toString().trim(),
            "actuator_Vibratio":"ON",
            "sensorLight1":45,
            "sensorTemp1": 435
        }
    }
    });

            console.log("Update:" + clientTokenIP);

    });

//all of these on connect!
//extract!
// listen for tags:
SensorTag.discover(function(tag) {
    // when you disconnect from a tag, exit the program:
    tag.on('disconnect', function() {
        console.log('disconnected!');
        process.exit(0);
    });

    function connectAndSetUpMe() {          // attempt to connect to the tag
     console.log('connectAndSetUp');
     tag.connectAndSetUp(enableIrTempMe);       // when you connect, call enableIrTempMe
   }

   function enableIrTempMe() {      // attempt to enable the IR Temperature sensor
     console.log('enableIRTemperatureSensor');
     // when you enable the IR Temperature sensor, start notifications:
     tag.enableIrTemperature(notifyMe);
   }

    function notifyMe() {
    tag.notifyIrTemperature(listenForTempReading);      // start the accelerometer listener
        tag.notifySimpleKey(listenForButton);       // start the button listener
   }

    function listenForTempReading() {
        tag.on('irTemperatureChange', function(objectTemp, ambientTemp) {
         console.log('\tObject Temp = %d deg. C', objectTemp.toFixed(1));
         console.log('\tAmbient Temp = %d deg. C', ambientTemp.toFixed(1));



         clientTokenIP = thingShadows.update(myThingName, {
            "state": {
                "reported": {
                "thingName":myThingName,
                "sensor_objTemp":objectTemp.toFixed(1),
                "sensor_ambientTemp": ambientTemp.toFixed(1)
            }

                // "actuator_Laser":d.toString().trim(),
                // "actuator_Vibratio":"ON",
        }
        });

            console.log("Update:" + clientTokenIP);

       });
    }

    // when you get a button change, print it out:
    function listenForButton() {
        tag.on('simpleKeyChange', function(left, right) {
            if (left) {
                console.log('left: ' + left);
            }
            if (right) {
                console.log('right: ' + right);
            }
            // if both buttons are pressed, disconnect:
            if (left && right) {
                tag.disconnect();
            }
       });
    }

    // Now that you've defined all the functions, start the process:
    connectAndSetUpMe();
});

});

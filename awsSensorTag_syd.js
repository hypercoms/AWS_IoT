var iot = {};
//importing aws iot library


//update values with:
            //  clientTokenIP = thingShadows.update(myThingName, {
            //     "state": {
            //     "reported": {
            //         "thingName":"ss9",
            //         "actuator_Laser":d.toString().trim(),
            //         "actuator_Vibratio":"ON",
            //         "sensorLight1":45,
            //         "sensorTemp1": 435
            //         }
            //     }
            // });


var awsIot = require('aws-iot-device-sdk');

var myThingName = 'Raspi3_A1';

 
//create thing shadows with keys and certs

var thingShadows = awsIot.thingShadow({
    keyPath: 'private.pem.key',
    certPath: 'certificate.pem.crt',
    caPath: 'ca.pem',
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
     console.log('connectAndSetUp coonected');
     //tag.connectAndSetUp(enableIrTempMe);       // when you connect, call enableIrTempMe
     tag.connectAndSetUp(enableSensorMe);       // when you connect and device is setup, call enableAccelMe

   }



    function enableSensorMe() {       
     console.log('enableSensorMe');
     // start notifications:
     tag.enableAccelerometer(notifyMe);
     tag.enableIrTemperature(notifyMe);
     tag.enableHumidity(notifyMe);
     tag.enableMagnetometer(notifyMe);
     tag.enableBarometricPressure(notifyMe);
     tag.enableGyroscope(notifyMe);
     tag.enableLuxometer(notifyMe);
   }


    function notifyMe() {
        tag.notifyIrTemperature(listenForTempReading);      // start the accelerometer listener
        tag.notifySimpleKey(listenForButton);       // start the button listener
        tag.notifyAccelerometer(listenForAcc);      // start the accelerometer listener
        tag.notifyHumidity(listenForHumidity);
        tag.notifyMagnetometer(listenForMagnetometer);
        tag.notifyBarometricPressure(listenForBarometric);
        tag.notifyGyroscope(listenForGyro);
        tag.notifyLuxometer(listenForLux);
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
            }
        });

            console.log("Update:" + clientTokenIP);

       });
    }


   // When you get an accelermeter change, print it out:
    function listenForAcc() {
        tag.on('accelerometerChange', function(x, y, z) {
         // console.log('\tx = %d G', x.toFixed(1));
         // console.log('\ty = %d G', y.toFixed(1));
         // console.log('\tz = %d G', z.toFixed(1));

        clientTokenIP = thingShadows.update(myThingName, {
            "state": {
                "reported": {
                "thingName":myThingName,
                "sensor_accelerometerX":x.toFixed(1),
                "sensor_accelerometerY":y.toFixed(1),
                "sensor_accelerometerZ":z.toFixed(1),

                }
            }
        });

       });
    }

    function listenForHumidity() {
        tag.on('humidityChange', function(temperature, humidity){
            // console.log('temperature'+temperature);
            // console.log('humidity'+humidity);

        clientTokenIP = thingShadows.update(myThingName, {
            "state": {
                "reported": {
                "thingName":myThingName,
                "sensor_humidity":temperature.toFixed(1),
                "sensor_temperature": humidity.toFixed(1)
                }
            }
        });


        });
        
    }

    function listenForMagnetometer(){
        tag.on('magnetometerChange', function(x, y, z){
         // console.log('\tmag x = %d G', x.toFixed(1));
         // console.log('\tmag y = %d G', y.toFixed(1));
         // console.log('\tmag z = %d G', z.toFixed(1));


        clientTokenIP = thingShadows.update(myThingName, {
            "state": {
                "reported": {
                "thingName":myThingName,
                "sensor_magneticX":x.toFixed(1),
                "sensor_magneticY":y.toFixed(1),
                "sensor_magneticZ":z.toFixed(1),

                }
            }
        });

        });
    }

    function listenForBarometric(){
        tag.on('barometricPressureChange', function(pressure){
            // console.log('pressure'+pressure);


        clientTokenIP = thingShadows.update(pressure, {
            "state": {
                "reported": {
                "thingName":myThingName,
                "sensor_pressure":temperature.toFixed(1)
                }
            }
        });

        });
    }

    function listenForGyro(){
        tag.on('gyroscopeChange', function(x, y, z){
         // console.log('\tgyro x = %d G', x.toFixed(1));
         // console.log('\tgyro y = %d G', y.toFixed(1));
         // console.log('\tgyro z = %d G', z.toFixed(1));

        clientTokenIP = thingShadows.update(myThingName, {
            "state": {
                "reported": {
                "thingName":myThingName,
                "sensor_gyroX":x.toFixed(1),
                "sensor_gyroY":y.toFixed(1),
                "sensor_gyroZ":z.toFixed(1),

                }
            }
        });

        });
    }

    function listenForLux(){
        tag.on('luxometerChange',function(lux){
         // console.log('lux  = %d G', lux.toFixed(1));

        clientTokenIP = thingShadows.update(pressure, {
            "state": {
                "reported": {
                "thingName":myThingName,
                "sensor_lux":lux.toFixed(1)
                }
            }
        });

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

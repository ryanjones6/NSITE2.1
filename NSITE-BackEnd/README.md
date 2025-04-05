# NSITE 2.0

*  [Getting Started](#getting-started) 
*  [Server Settings](#server-settings) 
*  [Modbus Devices](#modbus-devices) 
	* [Register Parameters](#register-parameters) 
		* [PLC](#PLC)
		* [VIEW](#VIEW)
		* [MASK](#MASK)
		* [EVENTS](#EVENTS)
		* [TREND](#TREND)
*  [Readings Object ](#readings-object)
	* [Resource Methods](#resource-methods)
		* [MQTT](#MQTT)
		* [HTTP API](#http-api)
		* [Require](#Require)
*  [System Snapshot](#system-snapshot)
	*  [Resource Methods](#resource-methods-1) 
		* [MQTT](#MQTT-1)
		* [HTTP API](#http-api-1)
* [InfluxDB](#InfluxDB)

*  [Dependencies](#Dependencies) 
	* [jsmodbus](https://www.npmjs.com/package/jsmodbus) 
	* [aedes](https://www.npmjs.com/package/aedes) 
	* [mqtt](https://www.npmjs.com/package/mqtt) 
	* [express](https://www.npmjs.com/package/express) 
	* [mustache-express](https://www.npmjs.com/package/mustache-express) 
	* [request](https://www.npmjs.com/package/request) 
	* [ftp](https://www.npmjs.com/package/ftp) 
	* [influx](https://www.npmjs.com/package/influx)


## Getting Started
<div style="text-align: right"><a href="#nsite-20">Back to Top</a> </div>


**Step 1**  
Set the server hostname to the trucks name

```
sudo raspi-config
```
```
Network Options
```
```
N1 Hostname
```
```
SS9 would be SS9 / SS4A would be SS4-A
```
**Step 2a**  
Clone this repository
```
CAMMAND TO ACCESS LOCAL REPOSITORY GOES HERE!!
```
**Step 2b**
Install dependencies
```
sudo npm install
```
**Step 3**  
Create the systemSettings.json file using the examples and guides below. A complete systemSettings.json file example can be found [here](nsite_modules/settings/example/systemSettings.json) for reference. Once you have completed the systemSettings.json file then place it in the settings directory.

**Step 4**  
Create all of the object JSON files. Run the following command from the main NSITE app directory. 
```
npm run build 
```
This will create the following files and place them in nsite_modules/settings.
* server.json
* view.json
* events.json
* modbusDevice.json
* modbusRegisters.json
* about.json

If you wanted to just update a certain json file from the systemSettings.json file, then you can pass an argument along with the command.

**Arguments** 
* view - This will only update the view.json file.
* events - This will only update the events.json file.
* modbus - This will only update the modbus files (modbusDevice.json & modbusRegister.json).
* server - This will only update the server.json file.
```
npm run build -- view
npm run build -- events
npm run build -- modbus
npm run build -- server
```
# Starting NSITE

To start NSITE in production mode use this command. This will limit console logs along with other node.js benefits. 
```
npm run nsite
```
To start NSITE in development mode use this command. This will enable more console logs and other usefull troubleshooting items.
```
npm run dev
```

# Server Settings
<div style="text-align: right"><a href="#nsite-20">Back to Top</a> </div>

*[ required ]* / **object**  
The server object sets the following parameters.
* **facility** - This is the name of the truck/facility.
	* naming scheme => SS9 would be SS9 / SS4A would be SS4-A
* **webAppPort** - The port number that the NSITE web app is running on.
* **snapshotDays** - How long to keep system snapshots. See [System Snapshot](#system-snapshot) for more details.
* **influxDB** _[ optional ]_- Object parameters to connect to a influxDB. See [InfluxDB](#InfluxDB) for more details.
	* **host** - The IP address of the InfluxDB server.
	* **database** - The name of the database to store readings. If the database does not exist yet, NSITE will create it for you. 
	* **port** - The port that the InfluxDB is running on.

```javascript
"server": {
		"facility": "SS9",
		"webAppPort": 80,
		"snapshotDays":3,
		"influxDB":{
			"host": "localhost",
			"database": "NSITE",
			"port":8086
		}
	
```
# Modbus Devices
<div style="text-align: right"><a href="#nsite-20">Back to Top</a> </div>

*[ required ]* / **array**  
Each device will require the below fields. *Only 1 request per register range or modbusCommand. Otherwise you will have to add additional devices. This will increase the TCP socket count*
* **name** - device name. This must be unique from any other device and can only be used once. **NO spaces or special characters**
* **host** - IP address of the device.
* **port** - port to be used for modbus TCP. Defaults to **502** if omitted.
* **socketTimeout** - set socket timout in ms ( **max 4999** ). Defaults to **4000** if omitted.
* **onEndTimeout** - time it takes to reconnect to a device if the socket was disconnected (ms). Defaults to **1000** if omitted.
* **onErrorTimeout** - time it takes to reconnect to a device if the socket encounters an error (ms).Defaults to **3000** if omitted.
* **requestInterval** - how often to make a modbus TCP request in ms. Defaults to **1000** if omitted.
* **modbusCommand** - modbus function call. To use more than one modbusCommand you will have to add another device into the device array. This will also increase the TCP socket count per call/device.Defaults to **readHoldingRegisters** if omitted.
	* *readHoldingRegisters*
	* *readDiscreteInputs*
	* *readCoils*
	* *readInputRegisters*
* **regOffset** - modbus register offset. *Use zero if no offset is needed*. Defaults to **3000** if omitted.
* **zeroBase** - modbus registers start at 0. *(e.g. register 1000 would be 999)*. Defaults to **true** if omitted.
* **registers** - array of the registers to be used. Each register has (1) required and (4) optional parameter that can be used. The first register in the array **must be the first register** in your range of registers to be requested. Only 1 sequential range per device 
	* [PLC](#PLC) - **requried**
	* [VIEW](#VIEW)
	* [MASK](#MASK)
	* [EVENTS](#EVENTS)
	* [TREND](#TREND)
	
```javascript
// Example #1 with all parameters
"modbusDevice": [{
	"name": "XL7",
	"host": "10.212.10.201",
	"port": 502,
	"socketTimeout": 4000,
	"onEndTimeout": 1000,
	"onErrorTimeout": 3000,
	"requestInterval": 1000,
	"modbusCommand": "readHoldingRegisters",
	"regOffset": 3000,
	"zeroBase": true,
	"registers": [{ 
		// see Register Parameters for details
	}]
}]
```
```javascript
// Example #2 minimum parameters (using defult settings)
"modbusDevice": [{
	"name": "XL7",
	"host": "10.212.10.201",
	"registers": [{ 
		// see Register Parameters for details
	}]
}]
```

# Register Parameters
<div style="text-align: right"><a href="#nsite-20">Back to Top</a> </div> 

## PLC

*[ required ]* / **object**  
The PLC parameter is required and has 4 optional parameters.
* **name** - *[ optional ]* Name of the register, helps to stay organized.
* **register** - *[ required ]* The acutal PLC register number (no need to figure out the offset)
	* **registers must be sequential**
		* *Each register will be assigned a unique ID. The ID is the device name + register number. Using the name from the Modbus Device example above and the register number from the below example the register ID is XL71001*

#### Additional PLC parameters *[ optional ]*
* **math**
* **binary**
* **tag**
```javascript
//PLC without any optional parameters
"registers":[{
	"PLC": {
		"name": "ACM1c1_AB_Voltage", 
		"register": 1001, 
	}
}]
```
### math
*[optional]* / **object**  
 This will apply a math equation to the register's returned value. The math parameter is ignored if the binary parameter is being used.

**math operation include** 
* divide
* multiply
* add
* subtract

```javascript
//This will divide register 1001's value by 10
"registers":[{
	"PLC": {
		"name": "ACM1c1_AB_Voltage", 
		"register": 1001,
		"math": {
					"operation": "divide",
					"value": 10
				}
	}
}]
```
### tag
*[optional]* / **array**  
This gives you a means of searching for registers with a keyword/tag. It will be included with the readings object for each register. This is an array and you can have as many keywords as needed. If the register is a [binary](#binary) register (see next section) the tag will be applied to all of the bits being used for that register.
> The EVENTS function uses tags to be able to pull all registers that are associated with that event. *Example if there is a high temp alert, we can send an email with all registers that have the temp sensors tag*.


```javascript
//Example - There are 3 tags/keywords. 
"registers":[{
	"PLC": {
		"name": "ACM1c1_AB_Voltage", 
		"register": 1001,
		"tag": ["power temp", "power", "temp sensor"],
	}
}]
```
### binary

*[optional]* / **array**  
This will change the register type from a integer (word) to binary 16 LSB. The register value will now be in binary format (0000000000000001). The binary parameter will allow you to have up to 16 independent bits to use as coils (boolean). Bits do not need to be sequential. Each binary array object has 1 required and (3) optional parameters. 
> **binary is not compatible with modbusCommand: readCoils.**

* **bit** - **requried** the bit number to be used (1-16).
	* *each bit will be assigned a unique ID. The ID is the device name + register number + _bit number. Using the name from the Modbus Device example above and the register number from the below example the register ID is XL71030_1 & XL71030_2*.
	
#### Additional binary parameters
* MASK - see [MASK](#MASK) section for details
* EVENTS - see [EVENTS](#EVENTS) section for details
* VIEW - see [VIEW](#VIEW) section for details

```javascript
//PLC binary example including VIEW & MASK
"registers":[{
	"PLC": {
		"name": "closure sensors",
		"register": 1030,
		"binary": [{
			"bit": 1,
			"VIEW": {
				"group": "closure",
				"displayOrder": "01",
				"name": "Closure #1",
				"style": "infoBox A-Phase",
				"min": null,
				"max": null
			},
			"MASK": [{
				"value": 0,
				"comparison": "equal",
				"trueValue": "Closure Sensor 1 - Closed",
				"action": "replace"
			}, {
				"value": 1,
				"comparison": "equal",
				"trueValue": "Closure Sensor 1 - Opened",
				"action": "replace"
			}]
			
		},{
			"bit": 2,
			"VIEW": {
				"group": "closure",
				"displayOrder": "02",
				"name": "Closure #2",
				"style": "infoBox A-Phase",
				"min": null,
				"max": null
			},
			"MASK": [{
				"value": 0,
				"comparison": "equal",
				"trueValue": "Closure Sensor 2 - Closed",
				"action": "replace"
			}, {
				"value": 1,
				"comparison": "equal",
				"trueValue": "Closure Sensor 2 - Opened",
				"action": "replace"
			}]
		}
	}
}]
```
## VIEW

*[ optional ]* / **object**  
The VIEW parameter is for the front-end and the [InfluxDB](#InfluxDB). VIEW can be used on any register including binary bits. VIEW can have as many parameters as you need, but require (3) parameters for the NSITE web app and require (2) parameters for the InfluxDB.
* **group** - *[ required ]* The group this register or bit is associated with.
	* InfluxDB - Used for the measurement. 
* **displayOrder** - *[ required ]* The display order within the template group.
* **name** - *[ required ]* This is the name/title of the value being displayed on the web.
	* InfluxDB - Used as a tag value.
* **style** - *[ optional ]* This is to set the diffrent styles (inline) for all the values being displayed on the web. *If more than one style is needed seperate them with a space. The below example shows two diffrent styles being applied. The style(s) must be in the web app's source css file.*
* **alias** *[ optional ]* This is a more detailed name used on the front-end and in events. if omited it will defult to name.
* **rule** *[ optional ]* This will change the view for this object depending on its value.
    * **value** - The acutual value on the app
        * **readingsValue** - what readings value to use
        * **comparison** - comparison type
        * **value** - the true value 
        * **css** - CSS key:value goes here
     * **box** - The surrounding box (container) the value is in 
        * **readingsValue** - what readings value to use
        * **comparison** - comparison type
        * **value** - the true value 
        * **css** - CSS key:value goes here

```javascript
// VIEW with no rules
 "VIEW": {
    "group": "techPowerPriV",
    "displayOrder": "1",
    "name": "A/B Volts",
    "style": "boxtitle aphase-under",
    "alias":"Tech Primary A/B Volts"
}
```
```javascript
// VIEW with rules
"VIEW": {
    "group": "tempSensors",
    "displayOrder": "01",
    "name": "Audio Room",
    "style": "boxvalue temperature",
    "rule":{
        "value": [{
            "readingsValue": "mathValue",
            "comparison": "graterThanOrEqual",
            "value": 100,
            "css": {
                "color": "orange",
                "font-size": "30px"
            }
        }],
        "box": [{
            "readingsValue": "mathValue",
            "comparison": "lessThan",
            "value": 50,
            "css": {
                "background-color": "rgba(0, 147, 216, 0.4)"
            }
        },{
            "readingsValue": "mathValue",
            "comparison": "graterThanOrEqual",
            "value": 105,
            "css": {
                "background-color": "rgba(216, 43, 0, 0.4)"
            }
        }]
    }
}
```
## MASK

*[ optional ]* / **array**  
The MASK parameter overwrites the register value after the [math](#math) equation is applied. All parameters are required. MASK can be used on any register including binary bits.
* **value** - The register's current value (after the math equation).
* **comparison** - Type of comparison to be perform.
	* equal - If the MASK value equals the register value.
	* notEqual - If the MASK value does not equals the register value.
	* lessThan - If the MASK value is less than the register value.
	* lessThanOrEqual - If the MASK value is less than or equal to the register value.
	* graterThan - If the MASK value is grater than the register value.
	* graterThanOrEqual - If the MASK value is grater than or equal to the register value.
	* absolute - Always apply the MASK.
	* between - If the MASK value is between the register value.
		* Value must be a string and the numbers should be sperated by . or ! or ?
	* notBetween - If the MASK value is not between the register value.
		* Value must be a string and the numbers should be sperated by . or ! or ?
* **trueValue** - The new value if the comparison is true.
* **action** - What to do with the MASK trueValue.
	* replace - Replace the register value with the MASK trueValue.
	* before - Add the MASK trueValue before the register value.
	* after - Add the MASK trueValue after the register value.


```javascript
/*	Example - equal => replace
*	If the value is equal to 0 then replace the value with Normal
* 	or 
* 	If the value is equal to 1 then replace the value with BYPASS
*/
"MASK": [{
	"value": 0,
	"comparison": "equal",
	"trueValue": "Normal",
	"action": "replace"
}, {
	"value": 1,
	"comparison": "equal",
	"trueValue": "BYPASS",
	"action": "replace"
}]
```

```javascript
/*	Example - absolute => after
*	Absolutely add the degree symbol (alt+176) after the register value
*	** zero is just a place holder and has no influence on the function 
*/
"MASK": [{
	"value": 0,
	"comparison": "absolute",
	"trueValue": "°",
	"action": "after"
}]
```

```javascript
/*	Example - notBetween => before
*	If the value is not between the value then put ! infront of the value
*	** value must be a string and seperated by one of these . ! ?
*/
"MASK": [{
	"value": "75.100",
	"comparison": "notBetween",
	"trueValue": "!",
	"action": "before"
}]
```
## EVENTS

*[ optional ]* / **array**  
The EVENTS parameter tells the system to perform an action depending on the register's value. If there is a [MASK](#MASK) parameter then the EVENTS value must match the [MASK](#MASK) value
* **type** - *[ required ]*
	* email -
	* notification - 
	* log - 
* **comparison** - *[ required ]*
 	* equal - If the EVENTS value equals the register value.
	* notEqual - If the EVENTS value does not equals the register value.
	* lessThan - If the EVENTS value is less than the register value.
	* lessThanOrEqual - if the EVENTS value is less than or equal to the register value.
	* graterThan - If the EVENTS value is grater than the register value.
	* graterThanOrEqual - If the EVENTS value is grater than or equal to the register value.
* **value** - *[ required ]* The registers value after the MASK is applied.
* **readingsValue** - *[ required ]* Event value to use from the readings object. Defults to value if omitted
	* value 
	* rawValue 
	* mathValue 
* **clearDuration** - *[ required ]* How long in ms the event needs be false before it will trigger the event again. If not provided it will defult to 60000ms (10mins).
* **eventTag** - *[ optional ]* Capture the current values and VIEW names of every PLC register that has the same eventTag value within the [PLC tag](#tag) array.

```javascript
/* 	
*	if the register's value equals IN TRUCK HIGH TEMP ALERT
*	then
*	send an email and send a notification to NSITE Notify desktop app
*	the email will include a table of all PLC register values and VIEW name with the tag of temp sensor
*/
"EVENTS": [{
	"type": "notification",
	"comparison": "equal",
	"value": "IN TRUCK HIGH TEMP ALERT",
	"clearDuration": 600000
}, {
	"type": "email",
	"comparison": "equal",
	"value": "IN TRUCK HIGH TEMP ALERT",
	"clearDuration": 600000,
	"eventTag": "temp sensor"
}]
```
## TREND

*[ optional ]* / **object**  
The TREND parameter will enable the "ticker" parameter in the readings object. The "ticker" object value will consist of "up", "down", or "none" depending on the average reading for each sample rate. 
* **sampleRate** - How many readings to average before compairing the previous average readings to the offset. 
	* Defults to 50 if not provided.
* **offset** - The allowed diffrence between the last average and current average to determine if the ticker should be up, down, or none.
	* Defults to .5 if not provided.

> The defult settings will need tweeked once this is running in a truck.

```javascript
//Example #1 - Set custom parameters
"TREND": {
	"sampleRate": 50,
	"offset":".5"
}
```
```javascript
//Example #2 - Use defualt parameters
"TREND": true
```
# Readings Object  
<div style="text-align: right"><a href="#nsite-20">Back to Top</a> </div>
The readings object consist of all the register objects and can be accessed from a few difftent method types and likewise you can update the readings object with the same methods. *The front-end is subscribed to the readings MQTT topic to display all of the registers and values.*

Depending on how the system was setup, each register object might be a little diffrent. See some examples below.

### Object Details
* **value** - The value after [PLC math](#math) and [MASK](#mask) is applied.
* **mathValue** - The value after [PLC math](#math) is applied.
* **rawValue** - The value before any processing is done.
* **min** - object
	* **value** - The minimum value after [PLC math](#math) is applied. 
	* **timeStamp** - The timestamp when the value reached the minimum value.
* **max** - object
	* **value** - The maximum value after [PLC math](#math) is applied.
	* **timeStamp** - The timestamp when the value reached the maximum value.
* **tag** - An array of tags/keywords. See [PLC tag](#tag) for more details.
* **ticker** - This will consist of "up", "down", or "none" depending on the average reading for the givin sample rate. See [TREND](#TREND) for more details.
* **view** - object. See [VIEW](#VIEW) for more details.
	* **group** - The template group name.
	* **name** -  The template name of the register.


### Resource Methods
* **[MQTT](#MQTT)**
* [**HTTP API**](#HTTP-API)
* **[require( readings )](#Require)**

## Example of the diffrent types of register objects
```javascript
// readings object for register XL71001 (tech power reading)
XL71001:{
	mathValue: 0,
	max: {value: 0, timeStamp: "5/15/2020, 9:48:38 AM"},
	min: {value: 0, timeStamp: "5/15/2020, 9:48:38 AM"},
	rawValue: 0,
	tag: ["tech power", "power"],
	value: 0,
	view: {group: "techPowerPriV", name: "A>B Volts"}
}
```
```javascript
// readings object for register XL71031 (temp sensor with MASK and ticker)
XL71031:{
	mathValue: 62.6,
	max: {value: 62.6, timeStamp: "5/15/2020, 9:48:38 AM"},
	min: {value: 60.6, timeStamp: "5/15/2020, 9:44:21 AM"},
	rawValue: 626,
	tag: ["temp sensor"],
	ticker: "none",
	value: "62.6°",
	view: {group: "tempSensors", name: "Temp Sensor - 1"}
}
```

```javascript
// readings object for register XL71030 (binary)
XL71030:{
	value: 1101000000000000,
}

// readings object for register XL71030_13 (bit) with MASK
XL71030_13:{
	mathValue: null,
	rawValue: 1,
	value: "Closure Sensor 13 - Opened",
	view: {group: "closure", name: "Closure #13"}
}
```
## Require
To access the readings object from within the main app you will have to require the readings.js file and make sure your js file is required from the NSITE app.js file. Place your js file in the nsite_modules directory.

Query types
* Get - All Registers
* Get - Single Register
* Get - Multi Registers
* Get - Error Handling
* Get - Tag
* Update - Register Object
```javascript
var readings = require('./readings') // require the readings.js file
```
 To query the readings object, You need to pass an **object** to the readings get function. The **object** KEY is the register ID and the **object** VALUE is what you are requesting. Use dot notation to get the results of nested objects (_min.value_). See the below examples on how to query the readings object.
### Get - All Registers Query Example
```javascript
//Example - Get the entire readings object
readings.get({},function(err,res){
	console.log(err || res) // returns the entire readings object
})
```
### Get - Single Register Query Example
```javascript
//Example #1 - Get register XL71031 object
readings.get({XL71031:''},function(err,res){
		console.log(err || res)
/*		
res = {
	mathValue: 62.6,
	max: {value: 62.6, timeStamp: "5/15/2020, 9:48:38 AM"},
	min: {value: 60.6, timeStamp: "5/15/2020, 9:44:21 AM"},
	rawValue: 626,
	tag: ["temp sensor"],
	ticker: "none",
	value: "62.6°",
	view: {group: "tempSensors", name: "Temp Sensor - 1"}
}
*/
})

```
```javascript
//Example #2 - Get register XL71031 value
readings.get({XL71031:'value'},function(err,res){
		console.log(err || res)
// res = 62.6°
})
```
```javascript
//Example #3 - Get register XL71031 min timeStamp
readings.get({XL71031:'min.timeStamp'},function(err,res){
		console.log(err || res)
// res = 5/15/2020, 9:44:21 AM
})
```
### Get - Multi Register Query
```javascript
//Example #1 - Get XL71001 min timeStamp & get XL71031 viewName & get XL71068_1 value
readings.get({XL71001:'min.timeStamp',XL71031:'viewName',XL71068_1:"value"},function(err,res){
		console.log(err || res)
//res = [ '5/15/2020, 9:48:38 AM','Temp Sensor - 1','ACM  OFFLINE [ TECH ]' ]
})
```
### Get - Error Handling
> If ther is an error with the request you will receive a message in the err callback. For a single register query the returned results will be an empty object. For a multi register query the register with the error will have a null in the returned results array.


### Get - Tag
 The tag query returns a object of all registers that contains the queried tag. An empty object will be returned if no results are found. See examples below.
```javascript
// Example #1 - Get all register objects that contains tech power as a tag
readings.getTag('tech power',function(tags){
	console.log(tags)
})
```
```javascript
// Example #2 - Get all register objects that do NOT have any tags
readings.getTag('',function(tags){
	console.log(tags)
})
```
### Update - Register Object
If the register object that is being updated has a VIEW parameter, then it will also be added to the [InfluxDB](#InfluxDB) along with updating the readings object. If the register object does not exits then the register object will be added to the readings object.
> As of now you can only update the entire register object. You must send the entire register object to be replaced. The helper file helps manage the objects for modbus registers.
```javascript
//Example - This will update the register object "test" with a value of 212
readings.update({test:{value:212}})

//test: {value: 212}
```
## MQTT 
There are 2 ways to use [MQTT](http://mqtt.org/) to access the readings object.
* Subcribe to the readings topic (This is how the NSITE front end gets its data).
	* The readings object gets published every (1) second to the readings topic.
* Query the readings object directly.

### Query Types
* Get - All Registers
* Get - Single Register
* Get - Multi Registers
* Get - Error Handling
* Get - Tag
* Update - Register Object

 To query the readings object with MQTT. You need to publish an array with two **objects** to the readings/get topic. The first **object** KEY is the register ID and the **object** VALUE is what you are requesting. Use dot notation to get the results of nested objects (_min.value_). The second **object** tells the readings object where to publish the results and you must include a message ID. The message ID will become the KEY in the returned results object. See the below examples on how to query the readings object with MQTT.

```javascript
//subscribe to myTopic
client.subscribe('myTopic', function (err) {})
```
```javascript 
//Publish myMsg to the readings/get topic
client.publish('readings/get', JSON.stringify(myMsg))
```
```javascript 
// Example on how to hanle the returned results.
client.on('message', function (topic, message) {
	let msg = message.toString()
	msg = JSON.parse(msg)
	if('myID' in msg){
		if (msg.myID.error){
			console.log("there is an error!",msg.myID.error)
		} else {
			console.log(msg.myID)
		}
	}
})
```
### Get - Single / All Register(s) Query Example
You must publish the query to **readings/get**
```javascript 
//Example #1 - Get all register objects published on myTopic using myID as the message ID
const myMsg = [{},{replyBack:{topic:'myTopic',msgID:'myID'}}]
```
```javascript 
//Example #2 - Get register XL71031 object publilshed on myTopic using myID as the message ID
const myMsg = [{XL71031:''},{replyBack:{topic:'myTopic',msgID:'myID'}}]
/*

myID:{
	mathValue: 62.6,
	max: {value: 62.6, timeStamp: "5/15/2020, 9:48:38 AM"},
	min: {value: 60.6, timeStamp: "5/15/2020, 9:44:21 AM"},
	rawValue: 62076,
	tag: ["temp sensor"],
	ticker: "none",
	value: "62.6°",
	viewName: "Temp Sensor - 1" 
}

*/
```
```javascript 
//Example #3 - Get register XL71031 value published on myTopic using myID as the message ID
const myMsg = [{XL71031:'value'},{replyBack:{topic:'myTopic',msgID:'myID'}}]

// { myID:'62.6°' }
```
```javascript 
//Example #4 - Get register XL71001 min timeStamp published on myTopic using myID as the message ID
const myMsg = [{XL71031:'min.timeStamp'},{replyBack:{topic:'myTopic',msgID:'myID'}}]

// { myID:'5/15/2020, 9:44:21 AM' }
```
### Get - Multi Register Query
You must publish the query to **readings/get**
```javascript
//Example #1 - Get XL71001 min timeStamp & get XL71031 viewName & get XL71068_1 value published on myTopic using myID as the message ID
const myMsg = [{XL71001:'min.timeStamp',XL71031:'viewName',XL71068_1:"value"},{replyBack:{topic:'myTopic',msgID:'myID'}}

//myID: [ '5/15/2020, 9:48:38 AM','Temp Sensor - 1','ACM  OFFLINE [ TECH ]' ]
```
### Get - Error Handling
> If ther is an error with the request you will receive a message back on your replyBack topic along with a error message that gets published to the **error** topic. For a single register query the returned results will be an empty object. For a multi register query the register with the error will have a null in the returned results array.
### Get - Tag
You must publish the query to **readings/getTag**
> The tag query publishes a object of all registers that contains the queried tag. An empty object will be returned if no results are found. See examples below. The message ID will become the KEY in the returned results object. 
```javascript
client.publish('readings/getTag', JSON.stringify(tagMsg))
```

```javascript
// Example #1 - Get all register objects that contains tech power as a tag and publish it on myTopic using myID as the message ID
var tagMsg = ['tech power',{replyBack:{topic:'myTopic',msgID:'myID'}}]
```
```javascript
// Example #2 - Get all register objects that do NOT have any tags and publish it on myTopic using myID as the message ID
var tagMsg = ['',{replyBack:{topic:'myTopic',msgID:'myID'}}]
```
### Update - Register Object
You must publish the query to **readings/update**.
> As of now you can only update the entire register object. You must send the entire register object to be replaced. The helper file helps manage the objects for modbus registers.

```javascript
client.publish('readings/update', JSON.stringify(updateMsg))
```

```javascript
//Example - This will update the register object test with a value of 212
var updateMsg = {test:{value:212}}
```

## HTTP-API
You can query the readings object with HTTP. The results will be returned in json format. 

### Returned fields 
* **status** - success or error
	* success will have a status code of 200.
	* error will have a status code of 400.
* **errorMsg** - The error message. This is only returned with a status of error.
* **query** - The query you are requesting.
* **results** - The returned results or an empty object if an error occurs.

## Successful Query
```javascript
//Successful query response with a status code of 200
{
	status: "success",
	query: { XL71001: "value" },
	results: 0
}
```
## Error Query
```javascript
//Error query response with a status code of 400
{
	status: "error",
	errorMsg: "XL71001:test - BAD COMMAND",
	query: { XL71001: "test" },
	results: { }
}
```
### Query types
* Get - All Register (GET)
* Get - Single Register (GET)
* Get - Tag (GET)
* Update - Register Object (POST)

To query the readings object with HTTP GET request you must use /readings/ after the NSITE server IP address followed by the query type (get,tag). Then depending on the request you will input the register id followed by a - then command. Use dot notation to get the results of nested objects (_min.value_). See the below API and examples on how to query the readings object.

### GET API
```
# Get the entire readings object
	http://10.xxx.100.100/api/readings/get/

# Get the register object
	http://10.xxx.100.100/api/readings/get/[ register id ]

# Get the register object VALUES		
	http://10.xxx.100.100/api/readings/get/[ register id ]-[ command ]

# Get registers that contain a tag keyword
	http://10.xxx.100.100/api/readings/tag/[ tag keyword ]

# Get all register that do NOT have a tag
	http://10.xxx.100.100/api/readings/tag/
```
### POST API
```
# Update the register object
	http://10.xxx.100.100/api/readings/update/
	
Must be a JSON object that is sent
```

### Get - All Registers Query Example
Example #1 - Get the entire readings object
```
10.xxx.100.100/api/readings/get/
```
### Get - Single Register Query Example
Example #2 - Get register XL71031 object
```
http://10.xxx.100.100/api/readings/get/XL71031

{
	status: "success",
	query: { XL71031: "" },
	results: {
		mathValue: 62.6,
		max: {value: 62.6, timeStamp: "5/15/2020, 9:48:38 AM"},
		min: {value: 60.6, timeStamp: "5/15/2020, 9:44:21 AM"},
		rawValue: 62076,
		tag: ["temp sensor"],
		ticker: "none",
		value: "62.6°",
		viewName: "Temp Sensor - 1"
	}
}

```
Example #3 - Get register XL71031 value
```
http://10.xxx.100.100/api/readings/get/XL71031-value

{
	status: "success",
	query: { XL71031: "value" },
	results: "62.6°"	
}
```
Example #4 - Get register XL71031 min timeStamp
```
http://10.xxx.100.100/api/readings/get/XL71031-min.timeStamp

{
	status: "success",
	query: { XL71031: "min.timeStamp" },
	results: "5/15/2020, 9:44:21 AM"	
}
```
### Get - Tag
The tag query returns a object of all registers that contains the queried tag. An empty object will be returned if no results are found. See examples below. 

Example #1 - Get all register objects that contains tech power as a tag
```
http://10.xxx.100.100/api/readings/tag/tech power (whitespace is replaced with %20)

{
	status: "success",
	query: "tech power",
	results: {
		**ALL THE OBJECTS WITH TECH POWER AS A TAG**
	}	
}
```
Example #2 - Get all register objects that do **NOT** have any tags
```
http://10.xxx.100.100/api/readings/tag/

{
	status: "success",
	query: "",
	results: {
		**ALL THE OBJECTS THAT DO NOT HAVE A TAG**
	}	
}
```
### Update - Register Object
You must POST a JSON object.
> As of now you can only update the entire register object. You must send the entire register object to be replaced. The helper file helps manage the objects for modbus registers.
```
http://10.xxx.100.100/api/readings/update/

POST 
{
    "mytest":{
        "value":"myValue",
        "name": "this is my name"
    }
}

RETURNED
{
  "status": "success",
  "query": "update",
  "results": {
    "mytest": {
      "value": "myValue",
      "name": "this is my name"
    }
  }
}
```
# System Snapshot
<div style="text-align: right"><a href="#nsite-20">Back to Top</a> </div>
The System Snapshot is a snapshot of the entire [Readings Object ](#readings-object)  this happens on the 5th minute mark (min 5, min 10, min 15, etc) for the entire time the NSITE app is running. The snapshot database is erased at restart of the app.  Every snapshot document has (2) added fields for timestamp purpose, **_id** is the date & time in milliseconds elapsed since January 1, 1970 00:00:00 UTC (unique id) and **timeStampPretty** is a readable date & time. The snapshot database can be accessed from (2) diffrent method types.

### Resource Methods
* **[MQTT](#MQTT-1)**
* [**HTTP API**](#HTTP-API-1)

## MQTT
MQTT INfo GOes here

## HTTP API 

You can query the snapshot database with HTTP. The results will be returned in json format. When using this method with the Time Based Querys you must use the **_id** as your date parameter. The **_id** is date & time in milliseconds elapsed since January 1, 1970 00:00:00 UTC

### Returned fields 
* **status** - success or error
	* success will have a status code of 200.
	* error will have a status code of 400.
* **errorMsg** - The error message. This is only returned with a status of error.
* **query** - The query you are requesting.
* **resultsCount** - The number of objects returned.
* **results** - The returned results or an empty array if an error occurs.

```javascript
//Successful query response with a status code of 200
{
	status: "success",
	query: { 
		startDate: 1590676871306, 
		endDate: 1590682623878, 
		interval: 60, 
		tag:"test"
	},
	resultsCount: 2,
	results: [
		{
			/* readings objects */
			},
	]
}
```
```javascript
//Error query response with a status code of 400
{
	status: "error",
	errorMsg: "interval must be divisable by 5 and must not be greater than 60",
	query: {
		startDate: 1590676871306,
		endDate: 1590682623878,
		interval: 62,
		tag: "test"
	},
	resultsCount: 0,
	results: [ ]
}
```
### Query types
* Get - Entire System Snapshot (GET)
* Get - Timed Based Query (GET)
* Get - Tag Based Query (GET)

To query the snapshot database with HTTP GET request you must use /snapshot/ after the NSITE server IP address followed by the query parameters. See the below API and examples on how to query the snapshot database.


### Snapshot GET API
```
# Entire System Snapshot
	http://10.xxx.100.100/api/snapshot/

# Time Based Query
	http://10.xxx.100.100/api/snapshot/[ start date in ms ] - [ end date in ms ]/[ interval ]

# Tag/Keyword Based Query		
	http://10.xxx.100.100/api/snapshot/[ tag name ]/[ start date in ms ] - [ end date in ms ]/[ interval ]
```
### Entire System Snapshot
Example #1 - Get the entire snapshot database
```
10.xxx.100.100/snapshot/
```
Example #2 - Time Based Query
```
http://10.xxx.100.100/api/snapshot/1590781493008-1590781493008/60

1590781493008 is equal to 5/29/2020, 3:44:53 PM


RETURNED RESULTS
{
	status: "success",
	query: {
		startDate: 1590781493008,
		endDate: 1590781493008,
		interval: 60
	},
	resultsCount: 1,
	results: [{
		
			** ONE DOCUMENT ARRAY RETURNED **
			}
	]
}

```
Example #3 - Tag/Keyword Based Query
```
http://10.xxx.100.100/api/snapshot/test/1590781493008-1590781493008/60

1590781493008 is equal to 5/29/2020, 3:44:53 PM


RETURNED RESULTS
{
	status: "success",
	query: {
		startDate: 1590781493008,
		endDate: 1590781493008,
		interval: 60,
		tag: "test"
	},
	resultsCount: 1,
	results: [{
		
			** ONE DOCUMENT ARRAY RETURNED WITH ONLY TEST AS A TAG **
		}
	]
}
```

# InfluxDB
NSITE has the ability to push the readings object to a InfluxDB every second. 




# Dependencies			
  <div style="text-align: right"><a href="#nsite-20">Back to Top</a> </div>

Packages | Version | NSITE's Usage | License
---------|----------|---------|---------
 [jsmodbus](https://www.npmjs.com/package/jsmodbus) | 3.1.6 | Modbus TCP | [MIT](https://www.npmjs.com/package/jsmodbus#license-mit)
 [aedes](https://www.npmjs.com/package/aedes) | 0.41.0 | MQTT Broker | [MIT](https://github.com/moscajs/aedes/blob/master/LICENSE)
 [mqtt](https://www.npmjs.com/package/mqtt) | 3.0.0 | MQTT Client | [MIT](https://github.com/mqttjs/MQTT.js/blob/master/LICENSE.md)
 [express](https://www.npmjs.com/package/express) | 4.17.1 | HTTP & HTTP API | [MIT](https://github.com/expressjs/express/blob/HEAD/LICENSE)
 [mustache-express](https://www.npmjs.com/package/mustache-express) | 1.3.0 | Templating Engine | [MIT](https://github.com/bryanburgers/node-mustache-express/blob/master/LICENSE.md)
 [request](https://www.npmjs.com/package/request) | 2.88.0 | HTTP Request ( POST, GET, etc. ) | [Apache 2.0](https://github.com/request/request/blob/master/LICENSE)
 [ftp](https://www.npmjs.com/package/ftp) | 0.3.10 | FTP Client | [MIT](https://github.com/mscdex/node-ftp/blob/master/LICENSE)
 [influx](https://www.npmjs.com/package/influx) | 5.5.1| InfluxDB node API | [MIT](https://github.com/node-influx/node-influx/blob/master/LICENSE)


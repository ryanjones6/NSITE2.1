# Settings File Builder

**Step 1**  
Create the systemSettings.json file using the examples and guides below. Complete systemSettings.json file example [here](/settings/example/systemSettings.json) for reference. Place the systemSettings.json file in the settings directory.

**Step 2**  
Create all of the object databases. Run the following command from the root NSITE directory.
```
npm run systemBuilder.js 
```
This will create the following databases and place them in the db directory
* view.db
* events
    * email.db
    * log.db
    * notification.db
* modbus
    * modbusDevice.db
    * modbusRegisters.db

If you wanted to just update a certain database from the systemSettings.json file, then you can pass an argument along with the command.

**Arguments** 
* view - This will update only the view objects.
* events - this will update the events objects (email, log, & notification).
* modbus - This will update the modbus objects (devices & registers).

```
npm run systemBuilder.js view
npm run systemBuilder.js events
npm run systemBuilder.js modbus
```

# Server Settings
*[ required ]* / **object**  
These settings will set the name facility name and what port the NSITE web app is running on.

```javascript
"server": {
	"facility": "SS9",
	"port": 80
}
```

# Modbus Devices
*[ required ]* / **array**  
Each device will require the below fields. *Only 1 request per register range or modbusCommand. Otherwise you will have to add additional devices. This will increase the TCP socket count*
* **name** - device name. This must be unique from any other device and can only be used once.
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
#### math
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
#### tag
*[optional]* / **array**  
This gives you a means of searching for registers. It will be included to the readings object for each register. This is an array and you can have as many tags as needed. The EVENTS function uses tags to be able to pull all registers that are associated with that event. *Example if there is a high temp alert, we can send an email with all registers that have the temp sensors tag*.


```javascript
//There are 3 tags. 
"registers":[{
	"PLC": {
		"name": "ACM1c1_AB_Voltage", 
		"register": 1001,
		"tag": ["power temp", "power", "temp sensor"],
	}
}]
```


#### binary


*[optional]* / **array**  
This will change the register type from a integer (word) to binary 16. The register value will now be in binary format (0000000000000001). The binary parameter will allow you to have up to 16 independent bits to use as coils (boolean). Bits do not need to be sequential. Each binary array object has 1 required and two optional parameters. **binary is not compatible with modbusCommand: readCoils.**

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
				"prefix": "replace"
			}, {
				"value": 1,
				"comparison": "equal",
				"trueValue": "Closure Sensor 1 - Opened",
				"prefix": "replace"
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
				"prefix": "replace"
			}, {
				"value": 1,
				"comparison": "equal",
				"trueValue": "Closure Sensor 2 - Opened",
				"prefix": "replace"
			}]
		}
	}
}]
```

## VIEW

*[ optional ]* / **object**  
The VIEW parameter is for the template engine ( [mustache](http://mustache.github.io/) ). VIEW can be used on any register including binary bits. VIEW can have as many parameters as you need.
* **group** - *[ required ]* The group this register or bit is associated with.
* **displayOrder** - *[ required ]* The display order within the template group.
* **name** - *[ required ]* This is the name/title of the value being displayed on the web.
* **style** - *[ required ]* This is to set the diffrent styles (inline) for all the values being displayed on the web. *If more than one style is needed seperate them with a space. The below example shows two diffrent styles being applied. The style(s) must be in the web app's source css file.*
* **min** - **optional**
* **max** - **optional**

```javascript
 "VIEW": {
	"group": "techPowerPriV",
	"displayOrder": "1",
	"name": "A>B Volts",
	"style": "Box A-Phase",
	"format": "",
	"min": null,
	"max": null
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
* **trueValue** - The new value if the comparison is true.
* **prefix** - What to do with the MASK trueValue.
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
	"prefix": "replace"
}, {
	"value": 1,
	"comparison": "equal",
	"trueValue": "BYPASS",
	"prefix": "replace"
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
	"prefix": "after"
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
* **clearDuration** - *[ required ]* How long the event needs be false before it will trigger the event again.
* **eventTag** - *[ optional ]* Capture the current values and VIEW names of every PLC register that has the same eventTag value within the PLC tag array.

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
The TREND parameter will enable the "ticker" parameter in the readings object. The "ticker" object value will consist of up, down, or none depending on the average reading for each sample rate. 
* **sampleRate** - *[ required ]* How many readings to average before compairing the previous average readings to the offset. 
* **offset** - *[ required ]* The allowed diffrence between the last average and current average to determine if the ticker should be up, down, or none.

```javascript
"TREND": {
	"sampleRate": 50,
	"offset":".5"
}
```


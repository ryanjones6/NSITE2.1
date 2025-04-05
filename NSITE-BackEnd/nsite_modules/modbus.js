'use strict'
/* Do not forget to update the nsite_modules build version in package.json */

//node_modules
const modbus = require('jsmodbus')
const net = require('net')
const fs = require('fs')
const path = require("path");
const settingsFilePath = path.join(__dirname,'/settings')


//nsite_modules
const {_currentTime, _log,_copyObj, comparisonLookUp, mathOperation} = require('./helper')
const readings = require('./readings')
const emitter = require('./emitter');
const logger = require('./logger');

//nsite_settings
let devices = require(settingsFilePath+'/modbusDevice.json')
let registers = require(settingsFilePath+'/modbusRegisters.json')


let registerDetailObj ={}
let tickerArry = {}

let bits = (n,b) => [...Array(b)].map((x,i)=>(n>>i)&1)

let allBits = (n, width, z) => {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

// connect to modbus devices and update the readings function
const connect = (x) => {
    if(x.isConn) {
        logger.error("[ Socket Connect ]Device already connected",{device:x.name,module:"modbus.js"})
         return
    }
   
    const name = x.name
    const port = x.port
    const host = x.host
    const regAddrStart = x.regAddrStart
    const regAddrQty = x.regAddrQty
    const modbusCommand = x.modbusCommand
    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket)
    socket.connect(port, host)
    socket.setTimeout(x.socketTimeout)
    let deviceDetails = {name:name,
        protocol:{
            type:'modbusTCP'
        },
    }
    
    socket.on('timeout', () => {
        //readings.update({[name]:{value:`${name} Dissconnected from server`}})
        socket.destroy()
        x.isConn = false
        //console.log(name,"[ TIMEOUT ] - Trying to Reconnect (0sec)",_currentTime())
        logger.warn("[ Socket Timeout ] - Trying to Reconnect (0sec)",{device:name,module:"modbus.js"})
           connect(x)
            return
    });
    
    socket.on('error', () => {
        readings.update({[`${name}_Device`]:{
            value:`${name} Dissconnected from server`,
        }})
        socket.destroy()
        x.isConn = false
        socket.removeAllListeners()
        //console.log(name,"[ ERROR ] - Trying to Reconnect (3sec)",_currentTime())
        logger.error("[ Socket Error ] - Trying to Reconnect (3sec)",{device:name,module:"modbus.js"})
        setTimeout(function () {
               connect(x) 
                return
        },x.onErrorTimeout)
    });

    socket.on('end', () => {
        //readings.update({[name]:{value:`${name} Dissconnected from server`}})
        socket.destroy()
        x.isConn = false
        //console.log(name,"[ END ] - Trying to Reconnect (1sec)",_currentTime())
        logger.error("[ Socket End ] - Trying to Reconnect (1sec)",{device:name,module:"modbus.js"})
        setTimeout(function () {
                connect(x)
                return
        },x.onEndTimeout)
    });

    const help = (x) => {
        socket.destroy()
        //console.log("_help -",_currentTime())
        logger.warn("[ Socket Help ]",{device:name,module:"modbus.js"})
        
    }
    
    socket.on('drain', () => {

        //console.log(name,"[ drain ] - What is this?",_currentTime())
        logger.warn("[ Socket Drain ] - What is this?",{device:name,module:"modbus.js"})

    });
    
    socket.on('connect', function () {
       // readings.update({[name]:{value:'- - -'}})
        if(!x.hasOwnProperty("initialConnection")){
            deviceDetails.protocol.initialConnection = _currentTime() , x.initialConnection = _currentTime()
        } else {
            deviceDetails.protocol.initialConnection = x.initialConnection
        }
        deviceDetails.protocol.lastConnection = _currentTime()
        deviceDetails.protocol.settings = x
        deviceDetails.status = 'connected'
        let offlineBitObj = {}
        x.isConn = true
        x.regObjID = []
        var deviceSocket = socket.localPort
        //_log(name, "[ CONNECTED ] - Using Local Port", deviceSocket)
        logger.info(`[ Socket Connected ] - Using local port ${deviceSocket}`,{device:name,module:"modbus.js"})
                let initObj = {}
                var register = (x.regAddrStart - x.regOffset)
                for (var i=0, n=regAddrQty; i<n; i++){
                  register++
                  initObj[x.name+register] = {}
                  initObj[x.name+register].value = '--'
                }
                let modbusObject = _copyObj(initObj)
        const request = setInterval(function () {
            client[modbusCommand](regAddrStart,regAddrQty)
            .then(function (resp) {
                //console.log(resp)
                //console.log(name,resp.response._body._values)
                var results = resp.response._body.valuesAsArray
                var register = (x.regAddrStart - x.regOffset)
                for (var i=0, n=results.length; i<n; i++){
                  register++
                  //console.log(register)
                  var processedRegister = _registerProcessing(x.name+register,results[i])
                    //console.log(processedRegister)
                  if(processedRegister.hasOwnProperty("bitValues")){
                    modbusObject[x.name+register].value = processedRegister.value
                        processedRegister.bitValues.forEach(function(x){
                            let bitObj = {}
                            bitObj[x.bitId] = {}
                            bitObj[x.bitId].value = x.value
                            bitObj[x.bitId].rawValue = x.rawValue
                            bitObj[x.bitId].mathValue = x.mathValue
                            bitObj[x.bitId].device = name
                            //console.log(bitObj[x.bitId])
                            if(processedRegister.tag) bitObj[x.bitId].tag = processedRegister.tag
                            if(x.hasOwnProperty("view"))bitObj[x.bitId].view = x.view 
                        modbusObject = {...modbusObject, ...bitObj}  // combine bit object to register object  
                       // readings._update(bitObj) // send bits to be merged to the global results object 
                        offlineBitObj[x.bitId] = {} // prepare bit objects for offline
                        offlineBitObj[x.bitId].value = '--'
                        initObj = {...initObj, ...offlineBitObj} 
                        })
                  } else {
                  modbusObject[x.name+register].value = processedRegister.value
                  modbusObject[x.name+register].rawValue = processedRegister.rawValue
                  modbusObject[x.name+register].mathValue = processedRegister.mathValue
                  modbusObject[x.name+register].min = processedRegister.min
                  modbusObject[x.name+register].max = processedRegister.max
                  modbusObject[x.name+register].device = name
                  modbusObject[x.name+register].ticker = processedRegister.ticker
                  if(processedRegister.tag)modbusObject[x.name+register].tag = processedRegister.tag
                  
                  if(processedRegister.hasOwnProperty("view"))modbusObject[x.name+register].view = processedRegister.view
                  }
                }
                 
                readings.update(modbusObject,deviceDetails) // send words to be merged to the global results object 
                emitter.emit(name,modbusObject,deviceDetails)
                //console.log(modbusObject)

            }).catch(function (err) {
                err.deviceName = name
                err.deviceSocket = deviceSocket
                //console.error(err,_currentTime())
                logger.error(err,{device:name,module:"modbus.js"})
                deviceDetails.status = 'error'
                
                readings.update(initObj,deviceDetails) // send offline object values of --
                emitter.emit(name,initObj,deviceDetails)
                // readings._update(offlineBitObj) // send offline bit object values of --
                if (err.err === 'OutOfSync'){
                    //console.log("OUT OF SNYC ERROR PLEASE HELP! -",_currentTime())
                    logger.error("OUT OF SNYC ERROR PLEASE HELP!",{device:name,module:"modbus.js"})
                    clearInterval(request)
                    help(x)                   
                } else {
                    socket.destroy()
                    clearInterval(request)
                }
            })
        }, x.requestInterval)
    })
}

 function _registerProcessing (id,value) {
    if (registerDetailObj.hasOwnProperty(id)){
        registerDetailObj[id].rawValue = value
        if (registerDetailObj[id].hasOwnProperty("math")){
            var operation = registerDetailObj[id].math.operation
            var mathValue = registerDetailObj[id].math.value
            value = (mathOperation[operation](value,mathValue))
            registerDetailObj[id].mathValue = value
            registerDetailObj[id].value = value
        } else {
            registerDetailObj[id].value = value
        }
        if (value < registerDetailObj[id].min.value || !registerDetailObj[id].min.hasOwnProperty("value")){
            registerDetailObj[id].min.value = value
            registerDetailObj[id].min.timeStamp = _currentTime()
            
        }
        if (value > registerDetailObj[id].max.value || !registerDetailObj[id].max.hasOwnProperty("value")){
            registerDetailObj[id].max.value = value
            registerDetailObj[id].max.timeStamp = _currentTime()
        }
    } else {
        registerDetailObj[id] = {}
        registerDetailObj[id].min = {}
        registerDetailObj[id].max = {}
        registerDetailObj[id].min.value = value
        registerDetailObj[id].min.timeStamp = _currentTime()
        registerDetailObj[id].max.value = value
        registerDetailObj[id].max.timeStamp = _currentTime()
    }
    if(registerDetailObj[id].register.type === "word"){

        if (registerDetailObj[id].hasOwnProperty("ticker")){
            let tickerObj = {}
            tickerObj[id] = []
            tickerObj[id].push(registerDetailObj[id].value)

            if(id in tickerArry) {
                tickerArry[id].value.push(registerDetailObj[id].value)
            } else {
                tickerArry[id] =  {}
                tickerArry[id].value =  []
                tickerArry[id].value.push(registerDetailObj[id].value)
                
            }
            if(tickerArry[id].value.length === registerDetailObj[id].TREND.sampleRate){
                let sum = tickerArry[id].value.reduce((previous, current) => current += previous)
                tickerArry[id].avg = sum/tickerArry[id].value.length
                //let tickerCheck = (registerDetailObj[id].value - tickerArry[id].avg)
            }   
            if(tickerArry[id].hasOwnProperty('avg')){
                let tickerCheck = (registerDetailObj[id].value - tickerArry[id].avg)
                if(tickerCheck >= registerDetailObj[id].TREND.offset){
                    registerDetailObj[id].ticker = 'up'
                } else if(tickerCheck <= -registerDetailObj[id].TREND.offset){
                    registerDetailObj[id].ticker = 'down'
                } else {
                    registerDetailObj[id].ticker = 'none'
                }
                if(tickerArry[id].value.length === registerDetailObj[id].TREND.sampleRate){
                    tickerArry[id].value.length = 0
                }
            }
        }
        if(registerDetailObj[id].hasOwnProperty("mask")){

            registerDetailObj[id].mask.forEach(function(x){
                if(x.comparison.match(/^(equal|notEqual|lessThan|lessThanOrEqual|graterThan|graterThanOrEqual|absolute)$/)){
                       
                    const maskValue = comparisonLookUp[x.comparison](value, x.value)
                    if(maskValue){
                        
                        switch(x.action){
                            case "after":
                                registerDetailObj[id].value = value + x.trueValue
                                break 
                            case "replace":
                                registerDetailObj[id].value = x.trueValue
                                break
                            case "before":
                                registerDetailObj[id].value = x.trueValue + value
                                break
                            default:
                                registerDetailObj[id].value = value
                        }
                    }
                }
            })
        } 
        return(registerDetailObj[id])
    } else if(registerDetailObj[id].register.type === "binary") {
        registerDetailObj[id].value = (allBits((value).toString(2), 16))
        registerDetailObj[id].mathValue = null
        
        registerDetailObj[id].bitValues = []
        let bitArr = bits(value,16);
        registerDetailObj[id].register.bitArray.forEach(function(y){
            let bitObj = y
            bitObj.mathValue = null
            bitObj.rawValue = bitArr[(y.bit-1)]
            
            bitObj.value = bitArr[(y.bit-1)]
            if(y.hasOwnProperty("mask")){
                y.mask.forEach(function(x){
                    
                    if(x.comparison.match(/^(equal|notEqual|lessThan|lessThanOrEqual|graterThan|graterThanOrEqual|absolute)$/)){
                        const maskValue = comparisonLookUp[x.comparison](bitArr[(y.bit-1)], x.value)
                        
                        if(maskValue){ 
                            switch(x.action){
                                case "after":
                                    bitObj.value = bitArr[(y.bit-1)] + x.trueValue
                                    break 
                                case "replace":
                                    bitObj.value = x.trueValue
                                    break
                                case "before":
                                    bitObj.value = x.trueValue + bitArr[(y.bit-1)]
                                    break
                                default:
                                    bitObj.value = bitArr[(y.bit-1)]
                            }
                        } else {
                        }
                    }
                })
            } 
            registerDetailObj[id].bitValues.push(bitObj)
        })
        return(registerDetailObj[id])
    }
}

function _registerInit (obj) {
    registerDetailObj = obj
    //console.log(obj)
}


module.exports = {
    Device: class {
        constructor(){
            this.devices = devices
            this.registers = registers
            this.HELPER()
        }
        HELPER(){
           _registerInit(this.registers)
            //_registerProcessing(registers)
            this.CONNECT()
        }
        CONNECT(){
            this.devices.forEach(y => {
                //devices.forEach(y => {
                connect(y)
            });
        }

    },
    resetMin: function(id){
        registers[id].min.value = registers[id].mathValue
        registers[id].min.timeStamp = _currentTime()
    },
    resetMax: function(id){
        registers[id].max.value = registers[id].mathValue
        registers[id].max.timeStamp = _currentTime()
    },
    getTagByID: function(id,callback){
        if(id.includes('_')) id = id.split('_')[0]
            if(registers.hasOwnProperty(id)){
                let results = registers[id].tag
                callback(null,results)
                return
            } else {
                callback({error: "Error - This ID does not exist."})
                return
            }
    },
    updateTags: function(obj){
        //console.log(obj)
        let id = obj._id
        const tag = obj.tag
        if(id.includes('_')) id = id.split('_')[0]
       // registers[id].tag = registers[id][tag]
        registers[id].tag.splice(0,registers[id].tag.length, ...tag)

        fs.readFile(path.resolve(__dirname,'./settings/modbusRegisters.json'), (err,data) => {
            if(err){
                console.log(err)
                //throw err
               /*  callback({
                    status:"error",
                    query:"add",
                    errorMsg: "File System Error - Problem readings events.json file",
                    results:err
                }) */
                return
            }
            let registerCopy = JSON.parse(data)
            registerCopy[id].tag = tag
            fs.writeFile(path.resolve(__dirname,'./settings/modbusRegisters.json'),JSON.stringify(registerCopy,null,2), err => {
                if(err){
                    console.log(err)
                    //throw err
                    /* callback({
                        status:"error",
                        query:"add",
                        errorMsg: "File System Error - Problem writting to events.json file",
                        results:err})
                    return */
                } else {
                    /* callback(null,{
                        status:"success",
                        query:"add",
                        results: x
                    }) */
                
                }
               // adduuid(x)
            })
        }) 
    },
    updateViewRule: function(obj){
        let id = obj._id
        //console.log(id)
        const rule = obj.rule
        
        if(id.includes('_')){
            const bitID = id.split('_')[1]
            const register = id.split('_')[0]
            let results = registers[register].register.bitArray.filter(obj => {
                return obj.bitId === id
            })
            //console.log(registers[id].register.bitArray)
            //console.log(results)
            results[0].view.rule = rule
            fs.readFile(path.resolve(__dirname,'./settings/modbusRegisters.json'), (err,data) => {
                if(err){
                    console.log(err)
                    //throw err
                   /*  callback({
                        status:"error",
                        query:"add",
                        errorMsg: "File System Error - Problem readings events.json file",
                        results:err
                    }) */
                    return
                }
                let registerBitCopy = JSON.parse(data)
                let resultsCopy = registerBitCopy[register].register.bitArray.filter(obj =>{
                    return obj.bitId === id
                })
                resultsCopy[0].view.rule = rule
                fs.writeFile(path.resolve(__dirname,'./settings/modbusRegisters.json'),JSON.stringify(registerBitCopy,null,2), err => {
                    if(err){
                        console.log(err)
                        //throw err
                        /* callback({
                            status:"error",
                            query:"add",
                            errorMsg: "File System Error - Problem writting to events.json file",
                            results:err})
                        return */
                    } else {
                        /* callback(null,{
                            status:"success",
                            query:"add",
                            results: x
                        }) */
                    
                    }
                   // adduuid(x)
                })
            }) 

            //console.log(registers[register].register.bitArray)
        } else {
            registers[id].view.rule = rule
            fs.readFile(path.resolve(__dirname,'./settings/modbusRegisters.json'), (err,data) => {
                if(err){
                    console.log(err)
                    //throw err
                   /*  callback({
                        status:"error",
                        query:"add",
                        errorMsg: "File System Error - Problem readings events.json file",
                        results:err
                    }) */
                    return
                }
                let registerCopy = JSON.parse(data)
                registerCopy[id].view.rule = rule
                fs.writeFile(path.resolve(__dirname,'./settings/modbusRegisters.json'),JSON.stringify(registerCopy,null,2), err => {
                    if(err){
                        console.log(err)
                        //throw err
                        /* callback({
                            status:"error",
                            query:"add",
                            errorMsg: "File System Error - Problem writting to events.json file",
                            results:err})
                        return */
                    } else {
                        /* callback(null,{
                            status:"success",
                            query:"add",
                            results: x
                        }) */
                    
                    }
                   // adduuid(x)
                })
            }) 
        }
    }
}

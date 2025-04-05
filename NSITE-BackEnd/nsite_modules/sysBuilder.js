'use strict'
/* Do not forget to update the nsite_modules build version in package.json */

const fs = require('fs')
const settings = require("./settings/systemSettings.json")
const schema = require('./schema')
const { v4: uuidv4 } = require('uuid')
//const { inflateSync } = require('zlib') // <=== what is this?
const path = require('path')
//const { error } = require('console')
const settingsFilePath = path.join(__dirname,'/settings')
const logger = require('./logger')

const args = process.argv.slice(2)
let registerDetailObj = {}
//let aboutCounter = 0

logger.info("sysBuilder started",{module:"sysBuilder.js"})

/* function about(){
    const {build:eventsBuild} = require('./events')
    const {build:modbusBuild} = require('./modbus')
    const {build:readingsBuild} = require('./readings')
    const {build:helperBuild} = require('./helper')
    const {build:ftpBuild} = require('./ftp')
    //const {build:schema} = require('./schema')

    let obj ={
        modules:{
            modbus:modbusBuild,
            readings:readingsBuild,
            events:eventsBuild,
            helper:helperBuild,
            ftp:ftpBuild,
            schema:schema.build,
            sysBuilder:buildID,
        }
    }
    fs.writeFile(settingsFilePath+"/about.json",JSON.stringify(obj), err => {
        if(!err){
            console.log("about.json document added")
        } else {
            console.log(err)
        } 
    }) 



} */



function server(){
    schema.server(settings.server,function(err,valid){
        if(valid){
            let ftpObj = {}
            if(settings.server.hasOwnProperty('ftp')){
                Object.keys(settings.server.ftp).forEach(x => {
                   // console.log(x)
                    ftpObj[x]={}
                    settings.server.ftp[x].forEach(y => {
                        ftpObj[x][y.name] = {}
                        ftpObj[x][y.name].host = y.host
                        ftpObj[x][y.name].port = y.port || 21
                        ftpObj[x][y.name].user = y.user || ""
                        ftpObj[x][y.name].pass = y.pass || ""
                    })
                })
                settings.server.ftp = ftpObj
            }
            fs.writeFile(settingsFilePath+"/server.json",JSON.stringify(settings.server), err => {
                if(!err){
                    //console.log("server.json document added")
                    logger.info("server.json document added",{module:"sysBuilder.js"})
                    
                   // aboutCounter ++ 
                } else {
                    //console.log(err)
                    logger.error(err,{module:"sysBuilder.js"})
                } 
            })
        } else if(!valid){
            //console.log("Server object - ERROR")
            //console.log(err)
            logger.error(`Server object error ${err}`,{module:"sysBuilder.js"})
        }
    })  
}

function view(){
    let viewObj = {}
    let idObj= {}
    let deviceObj = {}
    settings.modbusDevice.forEach(function(x){
        const name = x.name
        deviceObj[`${name}_Device`] = {
            group:"alarm",
            displayOrder: 0,
            name: `${name} - Disconnected from server!`,
            style: "error",
            device: name,
            _id: `${name}_Device`,
            value: `- - -`
        } 
        
        x.registers.forEach(function(y){
            let id = name+y.PLC.register
            if(y.hasOwnProperty('VIEW')){
                idObj[id] = y.VIEW
                idObj[id].device = name
                idObj[id]._id = id
                let group = y.VIEW.group || "unknown"
                idObj[id].value = y.VIEW.value || "- - -"
                viewObj[group] = {}
                //console.log('Added', id, "VIEW Object")
            }
             if(y.PLC.hasOwnProperty("binary")){
                y.PLC.binary.forEach(function(z){
                    if(z.hasOwnProperty("VIEW")){
                       let bitId = id+'_'+z.bit
                        idObj[bitId] = z.VIEW
                        idObj[bitId].device = name 
                        idObj[bitId]._id = bitId
                        let bitGroup = z.VIEW.group || "unknown"
                        idObj[bitId].value = z.VIEW.value || "- - -"
                        viewObj[bitGroup] = {}
                       // console.log('Added', bitId, "VIEW[bit] Object")
                        
                    }
                })
            } 
        })
    })
    //console.log("lookhere",deviceObj)
    Object.keys(viewObj).forEach(x => {
        Object.keys(idObj).forEach(y => {
            if(idObj[y].group === x){
                viewObj[x][y] = idObj[y]
            } 

        })
       // viewObj.alarm = deviceObj
       
    })
    
    // add server view object
    let serverObj = {
        facility:{
            group:'facility',
            name: settings.server.facility,
            _id: settings.server.facility
        }
    }
    //console.log(viewObj.alarm)
    viewObj.alarm = {...viewObj.alarm, ...deviceObj}
    viewObj = {...viewObj, ...serverObj}
    fs.writeFile(settingsFilePath+"/view.json",JSON.stringify(viewObj), err => {
        if(!err){
            //console.log("view.json document added")
            logger.info("view.json document added",{module:"sysBuilder.js"})
            //aboutCounter ++
        } else {
            //console.log(err)
            logger.error(err,{module:"sysBuilder.js"})
        } 
    })
}




function events() {
    let eventsArray = []
    settings.modbusDevice.forEach(function(x){
        const name = x.name
        x.registers.forEach(function(y){
            let id = name+y.PLC.register
            let alias 
            if(y.hasOwnProperty("VIEW")){
                if(y.VIEW.hasOwnProperty("alias")){
                    alias = y.VIEW.alias
                } else {
                    alias = y.VIEW.name || ''
                }
            }
            
            if (y.hasOwnProperty("EVENTS")){
                for (var n = 0, x = y.EVENTS.length; n < x; n++) {
                    let obj = {}
                    obj.device = name
                    obj.register_id = id
                    if(alias)obj.alias = alias
                    obj.type = y.EVENTS[n].type
                    obj.group = y.EVENTS[n].group || 'default'
                    obj.uuid = y.EVENTS[n].uuid || uuidv4()
                    obj.event = {}
                   // if(y.EVENTS[n].type === "email")obj.event.subscribers = [{email:'rjones@nepgroup.com',active: true}]
                    obj.event.comparison = y.EVENTS[n].comparison 
                    obj.event.value = y.EVENTS[n].value
                    obj.event.readingsValue = y.EVENTS[n].readingsValue || 'value'
                    obj.event.clearDuration = y.EVENTS[n].clearDuration || 60000
                    if(y.EVENTS[n].hasOwnProperty('message'))obj.event.message = y.EVENTS[n].message
                    //obj.event.message = y.EVENTS[n].message || ''
                    //if(y.EVENTS[n].hasOwnProperty('options'))obj.event.options//, obj.event.options.parameters = {}
                    obj.event.source = y.EVENTS[n].source || 'emitter'
                    obj.event.options = y.EVENTS[n].options || {}
                    //obj.event.lastEvent = ''
                    //obj.event.active = false
                   // obj.event.eventCount = 0
                    if(y.EVENTS[n].hasOwnProperty("eventTag")) obj.event.eventTag = y.EVENTS[n].eventTag
                    if(y.EVENTS[n].hasOwnProperty("level")) {
                        obj.event.level = y.EVENTS[n].level
                    } else {
                        obj.event.level = 'info'
                    }
                       
                    eventsArray.push(obj)
                    //console.log("events document added to array")                   
                }
            }   
            if (y.PLC.hasOwnProperty("binary")){
                y.PLC.binary.forEach(function(a){
                    let bitID = a.bit
                    let bitAlias
                    if(a.hasOwnProperty("VIEW")){
                        if(a.VIEW.hasOwnProperty("alias")){
                            bitAlias = a.VIEW.alias
                        } else {
                            bitAlias = a.VIEW.name || ''
                        }
                    }
                    if(a.hasOwnProperty("EVENTS")){
                        a.EVENTS.forEach(function(z){
                        let bitObj = {}
                        bitObj.device = name
                        bitObj.register_id = id+'_'+bitID
                        if(bitAlias)bitObj.alias = bitAlias
                        bitObj.type = z.type
                        bitObj.group = z.group || 'default'
                        bitObj.uuid = z.uuid || uuidv4()
                        bitObj.event = {}
                       // if(z.type === "email")bitObj.event.subscribers = [{email:'rjones@nepgroup.com',active: true}]
                        bitObj.event.comparison = z.comparison 
                        bitObj.event.value = z.value
                        bitObj.event.readingsValue = z.readingsValue || 'value'
                        bitObj.event.clearDuration = z.clearDuration
                        if(z.hasOwnProperty('message'))bitObj.event.message = z.message
                        //bitObj.event.message = z.message || ''
                        bitObj.event.source = z.source || 'emitter'
                        bitObj.event.options = z.options || {}
                        //if(z.hasOwnProperty('options'))bitObj.event.options = z.options//, bitObj.event.options.parameters = {}
                       // bitObj.event.lastEvent = ''
                        //bitObj.event.active = false
                       // bitObj.event.eventCount = 0
                        if(z.hasOwnProperty("eventTag"))bitObj.event.eventTag = z.eventTag
                        if(z.hasOwnProperty("level")){
                            bitObj.event.level = z.level
                        } else {
                            bitObj.event.level = 'info'
                        }
                        eventsArray.push(bitObj)
                        //console.log("events binary document added to array")
                    })
                    }
                })
            } 
        })
    })
    //const grouped = nestGroupsBy(eventsArray, ['register_id', 'type'])

    fs.writeFile(settingsFilePath+"/events.json",JSON.stringify(eventsArray, null, 2), err => {
        if(!err){
            //console.log("events.json document added")
            logger.info("events.json document added",{module:"sysBuilder.js"})
            //aboutCounter ++ 
        } else {
            //console.log(err)
            logger.error(err,{module:"sysBuilder.js"})
        } 
    }) 
}


/* ********************************** REMVOE ME ****************************************************** */
function nestGroupsBy(arr, properties) {
    properties = Array.from(properties);
    
    if (properties.length === 1) {
      return groupBy(arr, properties[0]);
    }
    const property = properties.shift();
    var grouped = groupBy(arr, property);
    for (let key in grouped) {
      grouped[key] = nestGroupsBy(grouped[key], Array.from(properties));        
    }
    return grouped;
  }


function groupBy(conversions, property) {
    return conversions.reduce((acc, obj) => {
      let key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }

/* ********************************************************************************************* */




function modbus(){
    let modbusDeviceArray = []
    settings.modbusDevice.forEach(function(x){
        let modbusSettingst = {}
        var regAddrStart = []
        let zeroBase = x.zeroBase || true
        let regOffset = x.regOffset || 3000
        
        x.registers.forEach(function(a){
           
            regAddrStart.push(a.PLC.register)
            
        })
        const differenceAry = regAddrStart.slice(1).map(function(n, i) { return n - regAddrStart[i]; })
        const isDifference= differenceAry.every(value => value == 1)
        if(!isDifference){
            //console.error(`${x.name} [ ERROR ] - modbus registers are NOT consecutive`)
            logger.error(`${x.name} [ ERROR ] - modbus registers are NOT consecutive`,{module:"sysBuilder.js"})
            return
        }	

        modbusSettingst.name = x.name
        modbusSettingst.host = x.host
        modbusSettingst.port = x.port || 502
        modbusSettingst.requestInterval = x.requestInterval || 1000
        modbusSettingst.modbusCommand = x. modbusCommand || "readHoldingRegisters"
        modbusSettingst.regAddrQty = x.registers.length
        modbusSettingst.isConn = null
        modbusSettingst.socketTimeout = x.socketTimeout || 4000
        modbusSettingst.onEndTimeout = x.onEndTimeout || 1000
        modbusSettingst.onErrorTimeout = x.onErrorTimeout || 3000
        modbusSettingst.regOffset = regOffset
        
        if(zeroBase){
            regAddrStart = Math.min(...regAddrStart) - 1
            regAddrStart = (regAddrStart) + (regOffset)
            modbusSettingst.regAddrStart = regAddrStart
        } else {
            regAddrStart = Math.min(...regAddrStart) 
            regAddrStart = (regAddrStart) + (regOffset)
            modbusSettingst.regAddrStart = regAddrStart
        }

        const name = x.name
        x.registers.forEach(function(y){
            const id = name+y.PLC.register
            registerDetailObj[id] = {}
            registerDetailObj[id].register = {}
            registerDetailObj[id].min ={}
            registerDetailObj[id].max = {}
            
           
            
            
            if (y.PLC.hasOwnProperty("binary")){
                registerDetailObj[id].register.type = "binary"
                registerDetailObj[id].register.bitArray = []
                for (var n = 0, x = y.PLC.binary.length; n < x; n++) {
                    let testObj= {}
                    testObj.bitId = id + '_' + y.PLC.binary[n].bit
                    testObj.bit = y.PLC.binary[n].bit

                    if(y.PLC.binary[n].hasOwnProperty("MASK")){

                        testObj.mask = y.PLC.binary[n].MASK
                    }
                    if(y.PLC.binary[n].hasOwnProperty("VIEW")){
                        testObj.view = {
                            group: y.PLC.binary[n].VIEW.group,
                            name: y.PLC.binary[n].VIEW.name
                        }
                        if(y.PLC.binary[n].VIEW.hasOwnProperty("alias")){
                            testObj.view.alias = y.PLC.binary[n].VIEW.alias
                        } else {
                            testObj.view.alias = y.PLC.binary[n].VIEW.name || ''
                        }
                        if(y.PLC.binary[n].VIEW.hasOwnProperty("rule")){
                            testObj.view.rule = {}
                            if(y.PLC.binary[n].VIEW.rule.hasOwnProperty("value")){
                                
                                testObj.view.rule.value = y.PLC.binary[n].VIEW.rule.value 
                            } else {
                                testObj.view.rule.value = []
                            }
                            if(y.PLC.binary[n].VIEW.rule.hasOwnProperty("box")){ 
                                testObj.view.rule.box = y.PLC.binary[n].VIEW.rule.box 
                            } else {
                                testObj.view.rule.box = []
                            }
                            
                            
                        } else {
                            testObj.view.rule = {value:[],box:[]}
                        }
                       // testObj.viewName = y.PLC.binary[n].VIEW.name
                        //testObj.viewGroup = y.PLC.binary[n].VIEW.group
                    }
                    registerDetailObj[id].register.bitArray.push(testObj)
                }
            } else {
                //if(y.PLC.unused){
                   // registerDetailObj[id].register.type = "unused"
               // } else {
                    registerDetailObj[id].register.type = "word"
               // }
                
                
                
            }         
            if(y.hasOwnProperty("MASK")){
                registerDetailObj[id].mask = y.MASK
            }
            if(y.PLC.hasOwnProperty("math")){
                registerDetailObj[id].math = {}
                registerDetailObj[id].math.operation = y.PLC.math.operation
                registerDetailObj[id].math.value = y.PLC.math.value
            }
            if(y.PLC.hasOwnProperty("tag")){
                registerDetailObj[id].tag = y.PLC.tag
            }
            if(y.hasOwnProperty("TREND")){
                registerDetailObj[id].ticker = null
                registerDetailObj[id].TREND = {
                    sampleRate: y.TREND.sampleRate || 50,
                    offset:y.TREND.sampleRate || .5
                }

            }
            if(y.hasOwnProperty("VIEW")){
                registerDetailObj[id].view = {
                    group: y.VIEW.group,
                    name: y.VIEW.name
                }
                if(y.VIEW.hasOwnProperty("alias")){
                    registerDetailObj[id].view.alias = y.VIEW.alias
                } else {
                    registerDetailObj[id].view.alias = y.VIEW.name || ''
                }
                if(y.VIEW.hasOwnProperty("rule")){
                    registerDetailObj[id].view.rule = {}
                    if(y.VIEW.rule.hasOwnProperty("value")){
                        registerDetailObj[id].view.rule.value = y.VIEW.rule.value
                    }
                    if(y.VIEW.rule.hasOwnProperty("box")){
                        registerDetailObj[id].view.rule.box = y.VIEW.rule.box
                    }
                    
                } else {
                    registerDetailObj[id].view.rule = {value:[],box:[]}
                }
            }
            
            
        })

        modbusDeviceArray.push(modbusSettingst)
        
    })
    fs.writeFile(settingsFilePath+"/modbusDevice.json",JSON.stringify(modbusDeviceArray), err => {
        if(!err){
            //console.log("modbusDevice.json document added")
            logger.info("modbusDevice.json document added",{module:"sysBuilder.js"})
            //aboutCounter ++ 
        } else {
            //console.log(err)
            logger.error(err,{module:"sysBuilder.js"})
            
        } 
    })

    fs.writeFile(settingsFilePath+"/modbusRegisters.json",JSON.stringify(registerDetailObj), err => {
        if(!err){
            //console.log("modbusRegisters.json document added")
            logger.info("modbusRegisters.json document added",{module:"sysBuilder.js"})
           // aboutCounter ++
        } else {
            //console.log(err)
            logger.error(err,{module:"sysBuilder.js"})
        } 
    })

}
const validated = (callback) => {
    let modDevices = {}
    modDevices.modbusDevice = settings.modbusDevice
        schema.modbusDevice(modDevices,function(err,valid){
            if(valid){
                callback(true)
            } else if(!valid){
                //console.log("ModbusDevice object - ERROR")
                logger.error("ModbusDevice object - ERROR",{module:"sysBuilder.js"})
                //console.log(err)
                //callback(false)
                logger.error(err,{module:"sysBuilder.js"})
            }
        })
}


if(args.length == 1){
   // console.log(args)
    args.forEach(x => {
        switch(x){
            case "server": server(); break;
            case "view":  
                validated( function(valid){
                    if(valid) view()
                })
                break;
            case "events":  
                validated( function(valid){
                    if(valid) events()
                })
            break;
            case "modbus":  
                validated( function(valid){
                    if(valid) modbus()
                })
                break;
            case "test":
                //console.log("no test functions built ")
                logger.warn("no test functions build",{module:"sysBuilder.js"})
                break;
            default: logger.error("unkown command -commands: server, view, events, or modbus",{module:"sysBuilder.js"})//console.log({ERROR:"unkown command",commands:"server, view, events, or modbus"})
        }
    })
} else { 
    server()
    validated( function(valid){
        if(valid){
            view(), events(), modbus()
        } else { process.exit(1)}
    })
   // aboutWrapper()

    
} 

/* function aboutWrapper() {
    if(aboutCounter >= 5){
        //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        about()
    } else {
        setTimeout(() => {
            aboutWrapper()
        }, 200);
    }
} */

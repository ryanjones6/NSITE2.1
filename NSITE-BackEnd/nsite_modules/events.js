'use strict'
/* Do not forget to update the nsite_modules build version in package.json */

// monitor readings for events (email, notification, log)

//node_modules
const fs = require('fs')
var path = require("path");
const {v4: uuidv4} = require('uuid')
//const fetch = require('node-fetch')

//nsite_modules
const readings = require('./readings')
const emitter = require('./emitter')
const {nestGroupsBy, comparisonLookUp} = require('./helper')
const logger = require('./logger');
const eventLogger = require('./eventLogger');
/* const api = require('./http')
 */
//nsite_settings
const settingsFilePath = path.join(__dirname,'/settings')
let events = require(settingsFilePath+'/events.json');
const api = require('./http');



let eventSettings = []
let emitterArray = []
let facility = ''

logger.info("events started")

module.exports = {
    get: function(callback){
        let getGroup = nestGroupsBy(eventSettings, ['group'])
        callback(null,getGroup)
    },
    getByGroup: function(x,callback){
        let getGroup = nestGroupsBy(eventSettings, ['group','type'])
        if(getGroup.hasOwnProperty(x)){
            callback(null,getGroup[x])
            return
        } else {
            callback({error: "Group Error - This group does not exist."})
            return
        }
        

    },
    getGroups: function(callback){
        let getGroup = nestGroupsBy(eventSettings, ['group'])
        let groups = []
        for (const key in getGroup) {
            groups.push(key)
        }
        callback(null,groups)
    },
    add: function(x,callback){ 
        //console.log("ADD EVENT FROM FUNCTION")
        logger.info("event added from function",{module:"events.js"})
        if(!x.hasOwnProperty("uuid")){
            x.uuid = uuidv4()
        }
        
        fs.readFile(path.resolve(__dirname,"./settings/events.json"), (err,data) => {
            if(err){
                //throw err
                callback({
                    status:"error",
                    query:"add",
                    errorMsg: "File System Error - Problem readings events.json file",
                    results:err
                })
                return
            }
            let eventsCopy = JSON.parse(data)
            
            eventsCopy.forEach((element) => {
                if(element.uuid.includes(x.uuid)){
                    eventsCopy = eventsCopy.filter(a => a.uuid !== x.uuid)
                   
                }
            })
            eventSettings.forEach((element) => {
                if(element.uuid.includes(x.uuid)){
                    eventSettings = eventSettings.filter(a => a.uuid !== x.uuid)
                }
            })

                eventsCopy.push(x)
                fs.writeFile(path.resolve(__dirname,"./settings/events.json"),JSON.stringify(eventsCopy,null,2), err => {
                    if(err){
                        //throw err
                        callback({
                            status:"error",
                            query:"add",
                            errorMsg: "File System Error - Problem writting to events.json file",
                            results:err})
                        return
                    } else {
                        callback(null,{
                            status:"success",
                            query:"add",
                            results: x
                        })
                        eventSettings.push(x)
                    
                    }
                })
           // }
        }) 
    },
    removeByID: function(x,callback){ 
        let idCheck = 0
        fs.readFile(path.resolve(__dirname,"./settings/events.json"), (err,data) => {
            if(err) {
                //throw err
                callback({
                    status:"error",
                    query:"Remove by ID",
                    errorMsg: "File System Error - Problem readings events.json file",
                    results:err
                })
                return
            }
            let eventCopy = JSON.parse(data)
            eventCopy.forEach((element) => {
                if(element.uuid.includes(x)){
                    eventCopy = eventCopy.filter(a => a.uuid !== x)
                   idCheck ++
                }
            })
            eventSettings.forEach((element) => {
                if(element.uuid.includes(x)){
                    eventSettings = eventSettings.filter(a => a.uuid !== x)
                    idCheck ++
                }
            })
            
            helper.file(eventCopy)
            /* if(idCheck > 0) {
                helper.file(eventCopy)
            } else {
                return callback({
                    status:"error",
                    query:"Remove by ID",
                    errorMsg: "ID Error - "+x+" does not exist",
                    results: x
                })
                
            } */
        })
        const helper = {
            file:function (eventCopy){
                fs.writeFile(path.resolve(__dirname,"./settings/events.json"),JSON.stringify(eventCopy,null,2), err => {
                    if(err){
                        //throw err
                        callback({
                            status:"error",
                            query:"Remove by ID",
                            errorMsg: "File System Error - Problem writting to events.json file",
                            results:err
                        })
                        return
                    } 
                })
            }
        }
        callback(null,{
            status:"success",
            query:"Remove by ID",
            results: x
        })
    },
    removeByGroup: function(x,callback){
        fs.readFile(path.resolve(__dirname,"./settings/events.json"), (err,data) => {
            if(err) {
                //throw err
                callback({
                    status:"error",
                    query:"Remove by Group",
                    errorMsg: "File System Error - Problem readings events.json file",
                    results:err
                })
                return
            }
            let eventCopy = JSON.parse(data)
            eventCopy.forEach((element) => {
                if(element.group.includes(x)){
                    eventCopy = eventCopy.filter(a => a.group !== x)
                   
                }
            })
            eventSettings.forEach((element) => {
                if(element.group.includes(x)){
                    eventSettings = eventSettings.filter(a => a.group !== x)
                }
            })
            helper.file(eventCopy)
        })
        const helper = {
            file:function (eventCopy){
                fs.writeFile(path.resolve(__dirname,"./settings/events.json"),JSON.stringify(eventCopy,null,2), err => {
                    if(err){
                        //throw err
                        callback({
                            status:"error",
                            query:"Remove by Group",
                            errorMsg: "File System Error - Problem writting to events.json file",
                            results:err
                        })
                        return
                    } 
                })
            }
        }
        const group = {group:x}
        /* api.post('/api/'+facility+'/removeGroup',group,function(err,ret){
            // console.log("post request sent")
         }) */
        callback(null,{
            status:"success",
            query:"Remove by Group",
            results: x
        })
    },
    edit: function(x){ //<<<<<<<<<<<<<============================= add call back and remove the throw err ************** NOT USED ANYMORE YOU CAN DELETE
        //remove then add x 
        //console.log(x.uuid)
        logger.info("event edited from function",{module:"events.js",uuid:x.uuid})

        fs.readFile("./settings/events.json", (err,data) => {
            if(err) {
                //throw err
                callback({
                    status:"error",
                    query:"Edit",
                    errorMsg: "File System Error - Problem readings events.json file",
                    results:err
                })
                return
            }
            let eventCopy = JSON.parse(data)
            var removeUUID = eventCopy.map(function(item) { return item.uuid; }).indexOf(x.uuid)
            if(removeUUID > -1) {
                eventCopy.splice(removeUUID,1)
                eventCopy.push(x)
            } else {
                callback({
                    status:"error",
                    query:"Edit",
                    errorMsg: "ID Error - "+x+" does not exist in events object.",
                    results:{}
                })
                return
                //console.log("cannot remove that ID")
            }
            fs.writeFile("./settings/events.json",JSON.stringify(eventCopy,null,2), err => {
                if(err){
                    //throw err
                    callback({
                        status:"error",
                        query:"Edit",
                        errorMsg: "File System Error - Problem writting to events.json file",
                        results:err
                    })
                    return
                } 
            })
        })

        var removeID = eventSettings.map(function(item) { return item.uuid; }).indexOf(x.uuid)
        if(removeID > -1) {
            eventSettings.splice(removeID,1)
            eventSettings.push(x)
        } else {
            callback({
                status:"error",
                query:"Edit",
                errorMsg: "ID Error - "+x+" does not exist in events object.",
                results:{}
            })
            return
            //console.log("cannot remove that ID")
        }
        callback(null,{
            status:"success",
            query:"Edit",
            results: x
        })

    },
    NSITE_EVENTS: class{
        constructor(server){
            facility = server.facility
            events.forEach( (x) => {
                if(x.event.source === "emitter")
                emitterArray.push(x)
            })
            adduuid(events)
            onEmitterDevice()
        }
    } 
}
 
function adduuid (x){
    if(Array.isArray(x)){
        x.forEach( (y) => {
            if(!y.hasOwnProperty("uuid")){
                y.uuid = uuidv4()
            }
            eventSettings.push(y)
        })
    } else {
        if(!x.hasOwnProperty("uuid")){
            x.uuid = uuidv4()
        }
        eventSettings.push(x)
    }
   // console.log(eventSettings)
}


// On emit send data to event handler
function onEmitterDevice(){
    let holdingArray = []
    emitterArray.forEach( (x) => {
        if(!(holdingArray.includes(x.device))){
            holdingArray.push(x.device)
        }
    })
    holdingArray.forEach( (y) => {
        emitter.on(y, (data,deviceInfo) => {
            if(deviceInfo.status === 'connected'){
                
                let obj = {}
                for (const id in data) { 
                    obj[id] = {}
                    obj[id].value = data[id].value
                    obj[id].rawValue = data[id].rawValue
                    obj[id].mathValue = data[id].mathValue
                    if(data[id].hasOwnProperty('min')) {
                        obj[id].minValue = data[id].min.value
                    } else {
                        obj[id].minValue = null
                    }
                    if(data[id].hasOwnProperty('max')) {
                        obj[id].maxValue = data[id].max.value
                    } else {
                        obj[id].maxValue = null
                    }
                }
                eventHandler(obj,y)
            }
            else {
                //console.log(y, '=>', y.status)
            }
        })
    })
    //if(!process.env.NODE_ENV ) console.log("onEmitter Devices =>",holdingArray)
}

// Check if an event happened for the emitter devices
function eventHandler(data,device){
    let activeEvents = {}
    eventSettings.forEach( (x) => {
      // if(x.register_id ==='XL71069_9')console.log(x)
        let id 
        let value 
        let event
        let readingsValue 

        if(device === x.device){
            id = x.register_id
            value = x.event.value
            event = x.event
            readingsValue = x.event.readingsValue
            const comparison = comparisonLookUp[event.comparison](data[id][readingsValue], value)
            const currentTime = Date.now()
            const allClearTime = currentTime - event.clearDuration 

            let eventHelper = {
                checkClearDuration: function() { return event.lastEvent < allClearTime },              
                updateLastEvent: function() {event.lastEvent = currentTime},
                buffer: function() {
                        if(event.properties.buffer.endTime < currentTime){
                            return true
                        } else {
                            return false
                        }
                },
                bufferSetTimes: function() { 
                    event.properties.buffer.endTime = currentTime + (event.options.buffer * 60000) // minuts
                    event.properties.buffer.status = 'active'
                },
                hasOption: function(x){
                    if(event.hasOwnProperty("options") && Object.keys(event.options).length > 0 ){
                        if(event.options.hasOwnProperty(x)){
                            return true
                        }
                    } else {
                        return false
                    }
                },
                oneShot: function(){
                    if(event.properties.oneShot === 0){
                        event.properties.oneShot = currentTime
                        return true
                    } else {
                        return false
                    }
                },
                suppress: function(){
                    if(event.properties.suppress.endTime === 0){
                        event.properties.suppress.endTime = currentTime + (event.options.suppress * 3600000) // hours
                        return true
                    }
                    if(currentTime > event.properties.suppress.endTime){
                        event.properties.suppress.endTime = currentTime + (event.options.suppress * 3600000) // hours
                        return true
                    } else {
                        return false
                    }
                },
                checkStop: function() {
                    if(this.hasOption('oneShot') && !this.hasOption('suppress') && this.buffer()){ 
                        if(this.oneShot()){
                            this.updateLastEvent()
                            event.eventCount + 1
                            return true
                        } else {
                            return false
                        }

                    } else if(this.hasOption('suppress') && !this.hasOption('oneShot') && this.buffer()){
                        if(this.suppress()){
                            this.updateLastEvent()
                            event.eventCount + 1
                            return true
                        } else {
                            return false
                        }

                    } else if(this.hasOption('oneShot') && this.hasOption('suppress') && this.buffer()){
                        if(this.oneShot() && this.suppress()){
                            this.updateLastEvent()
                            event.eventCount + 1
                            return true
                        } else {
                            return false
                        }

                    } else if(!this.hasOption('oneShot') && !this.hasOption('suppress') && this.hasOption('buffer') ){
                       if(this.buffer()){
                        this.updateLastEvent()
                        event.eventCount + 1
                           return true
                       } else {
                           return false
                       }

                    } else if(!this.hasOption('oneShot') && !this.hasOption('suppress') && !this.hasOption('buffer') && this.buffer()){
                        this.updateLastEvent()
                        event.eventCount + 1
                        return true
                    } else {
                        return false
                    }
                },
                eventRouter:function(e){
                    if(!activeEvents.hasOwnProperty(e.type)){
                        activeEvents[e.type] = []
                        activeEvents[e.type].push(e)
                    } else {
                        activeEvents[e.type].push(e)
                    }
                }
            }// <- end of eventHelpers
            if(!event.hasOwnProperty("active"))event.active = false
            if(!event.hasOwnProperty("lastEvent"))event.lastEvent = 0
            if(!event.hasOwnProperty("eventCount"))event.eventCount = 0
            if(!event.hasOwnProperty("properties"))event.properties = {} // add properties object
            if(!event.hasOwnProperty("clearDuration"))event.clearDuration = 600000 // add defult clearDuration if missing

            if(comparison){
                
                event.active = true
                if(eventHelper.checkClearDuration()){
                    if(event.hasOwnProperty("options") && Object.keys(event.options).length > 0 ){
                        if(!event.options.hasOwnProperty("buffer")){
                            event.properties.buffer = {}
                            event.properties.buffer.endTime = 1
                            event.properties.buffer.status = 'no-option'
                        } 
                        if(!event.properties.hasOwnProperty('buffer')){
                            event.properties.buffer = {}
                            eventHelper.bufferSetTimes()
                        }
                        if(event.properties.buffer.status === 'inactive'){
                            eventHelper.bufferSetTimes()
                        }
                        
                        
                        if(event.options.hasOwnProperty('oneShot')){
                            if(!event.properties.oneShot) event.properties.oneShot = 0
                           
                        }

                        if(event.options.hasOwnProperty('suppress')){
                            if(!event.properties.suppress){
                                event.properties.suppress = {}
                                event.properties.suppress.endTime = 0
                            }
                        }

                    } else {
                        if(!event.properties.hasOwnProperty("buffer")){
                            event.properties.buffer = {}
                            event.properties.buffer.endTime = 1
                            event.properties.buffer.status = 'no-option'
                        }
                    } // <- end of options
                    
                    if(eventHelper.checkStop()){
                        event.eventCount = event.eventCount + 1
                        eventHelper.eventRouter(x)
                    } else {
                       // console.log("did not make it past the checkStop")
                        return
                    }
                    
                } else {
                    event.lastEvent = currentTime
                    //console.log("in-distres but did not clear the duration")
                }
  
            } else {
               // console.log("not in distress")
                event.active = false
                if(event.properties.hasOwnProperty("buffer")){
                    if(event.properties.buffer.status === 'active'){
                        event.properties.buffer.status ="inactive"
                    }
                    return
                }
                return
            }
        }
        return
    })// end of foreach

    for (const type in activeEvents) {    
        const activeEventsType = activeEvents[type];
        let eventGroup = nestGroupsBy(activeEventsType, ['group'])
        alertHandler(type,eventGroup)
    } 
}

function alertHandler(type,events) {
    //console.log(events)
    if(type === 'email'){  //<<<<<<<<<<<<<<<<<<<================================= dont forget to add logs to a shunt trip event
        //if(!process.env.NODE_ENV ) console.log('email event fired',events)
        logger.info("Email event initiated",{module:"events.js"})
      for (const group in events) {
        let emailObj = {}
        emailObj.alert = []
        emailObj.group = group
        emailObj.facility = facility
        const element = events[group]
        element.forEach(x => {
            let section = {}
            section.uuid = x.uuid
            section.level = x.event.level
            if(x.event.hasOwnProperty('message')){
                section.main = x.event.message
                //emailObj.alert.push(section)
            } else {
                readings.get({[x.register_id]:'view.name'},function(err,res){
                    if(Object.keys(res).length > 0){
                        section.main = res+" is "+x.event.comparison+" - "+x.event.value
                    } else {
                        section.main = x.event.value
                    }
                    //emailObj.alert.push(section)
                })
            }
            if(x.event.hasOwnProperty("eventTag")){
                section.tag = []
                x.event.eventTag.forEach(tag => {
                    let tagObj = {}
                    tagObj.name = tag
                    tagObj.results = []
                    readings.getTag(tag,function(res){
                        for (const id in res) {
                            let obj ={}
                            //obj[id] = {}
                            obj.value = res[id].value
                            obj.name = res[id].view.name || id
                            if(res[id].view.hasOwnProperty('alias')) obj.alias = res[id].view.alias
                            tagObj.results.push(obj)
                        }
                    })
                    section.tag.push(tagObj)
                }) 
            } else {
                section.tag = []
            }
            emailObj.alert.push(section)
        })

            //console.log(emailObj.alert[1].tag[0].results)
           // console.log(emailObj)


            api.post('/api/'+facility+'/alert',emailObj,function(err,ret){
               // console.log("post request sent")
            })

       // console.log(emailObj.alert[0].tag[0].results) // <- send this object to Beta or Cloud NSITE !!!!!!! results causes a crash
        //console.log(eventSettings)
      }  
    }

    if(type === 'notification'){
        //if(!process.env.NODE_ENV ) console.log('notification')
        logger.info("Notification event initiated",{module:"events.js"})     
        Object.keys(events).forEach((key,i) => {
            setTimeout(function () {
            events[key].forEach((x,i) => {
                /* let levelNum = 3
                switch (x.event.level) {
                    case "error":
                        levelNum = 1
                        break;
                    case "warning":
                        levelNum = 2
                        break;
                    case "info":
                        levelNum = 3
                        break;
                    default:
                        break;
                } */
                let notifyObj = {
                    device:x.device,
                    group:x.group,
                    msg:x.alias+" - "+x.event.comparison+ " "+x.event.value,
                    level:x.event.level,
                    timeStamp: new Date().toLocaleString(x.event.lastEvent)
                }
                //setTimeout(function () {
                   // console.log(notifyObj)
                    emitter.emit('notify',notifyObj)
                //},i * 2000)
                //console.log(notifyObj)
            });
        },i * 3000)
        })
    }
    if(type === 'log'){
        //if(!process.env.NODE_ENV ) console.log('log')
        logger.info("Log event initiated",{module:"events.js"})
        const log = {
            info: () => {
                eventLogger.info(``,{})
            },
            warn: () => {
                eventLogger.warn(``,{})
            },
            error: () => {
                eventLogger.error(``,{})
            }
        }
        
        
    }
}
const log = {
    info: () => {
        eventLogger.info(`this is info`,{})
    },
    warn: () => {
        eventLogger.warn(`this is warning`,{})
    },
    error: () => {
        eventLogger.error(`this is error`,{})
    }
}
log.info()
log.warn()
log.error()

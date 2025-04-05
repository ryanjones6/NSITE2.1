'use strict'
/* Do not forget to update the nsite_modules build version in package.json */
/*  receive all readings from all devices, 
    make them avaliable for other proccess,
    publish readings using MQTT topic readings,
    take a system wide snapshot every 5 mins
*/
//node_modules
var mqtt = require('mqtt')
const logger = require('./logger')

//nsite_modules
const emitter = require('./emitter')
const helper = require('./helper')

//const { EPROTONOSUPPORT } = require('constants') <-- what is this?? Influx??
let influx
let influxReady = false
let snapshotArray = []
let serverSettings 

function getObj (theObject, path, separator) {
    try {
        separator = separator || '.';
        return path.
                replace('[', separator).replace(']','').
                split(separator).
                reduce(
                    function (obj, property) { 
                        return obj[property];
                    }, theObject
                );
    } catch (err) {   
        return undefined;
    }   
}
emitter.on("update-readings", (data,device) => {
    module.exports.update(data)
    //console.log(device.protocol.settings)
})

emitter.on("delete-readings", (data,device) => {

})

let results = {}
module.exports = {
    update: function (obj) {   //<<<<<<<<<<<<<<<<<------------------------ add callback with err
        if(!helper._isObject(obj))return
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                
                results[prop] = obj[prop] //<-- add to results object
        //        EM.emit(prop,obj[prop].value) // <-- Emit an event for listeners 
                
                // add to influxdb
                if(influxReady && obj[prop].hasOwnProperty("view")){

                    //console.log(prop)
                    //console.log(obj[prop].view)

                    if (obj[prop].hasOwnProperty("rawValue") || obj[prop].hasOwnProperty("mathValue")){
                          influx.writePoints([
                              {
                                measurement: obj[prop].view.group,
                                tags: { id: prop, name: obj[prop].view.name}, // indexed
                                fields: { value: obj[prop].mathValue || obj[prop].rawValue} // not indexed
                              }
                              
                            ]).catch(err => {
                              //console.error(`Error saving data to InfluxDB! ${err.stack}`)
                              //console.error(`Error saving data to InfluxDB!`)
                              logger.error("[ InfluxDB ] - Error saving data",{module:"readings.js"})
                            })
                      }
                }
            }
        }
        emitter.emit('readings',obj)
        //console.log(obj)
    },
    getTag: function (t,callback) {
        let retObj = {}
        let retArray = []
        if(!!t){
            for (const key in results) {
                let obj = {}
                if(results[key].hasOwnProperty("tag")){
                    results[key].tag.forEach(function(x){  
                        if(x === t){
                            retObj[key] = results[key]
                            obj[key] = results[key]
                            retArray.push(obj)
                        }
                    } )
                } 
            }
        } else {
            for (const key in results){
                if(!results[key].hasOwnProperty("tag")){
                    retObj[key] = results[key]
                }
            }
        }
        //console.log(retArray)                            <<<<<<<<<<<<<<<<<<================================= fix me I added an array to test
        callback(retObj,retArray)
    },
    getTagNames: function(t,callback){
        let retArray = []
        Object.keys(results).forEach(x => {
            Object.keys(results[x]).forEach(y => {
                if(y === "tag"){
                    results[x].tag.forEach(z => {
                        if(!retArray.includes(z)) retArray.push(z)
                    })
                }
            })
        })
        callback(retArray)
    },
    get: function (x,callback) {
        let retObj
        if(x === null || undefined) return
        if(Object.keys(x).length === 0){
            callback(null,results)
        } else if (Object.keys(x).length > 1){
            retObj = []
            for (const key in x) {
                if (results.hasOwnProperty(key)) {
                    const element = x[key];
                    if (!element){
                        retObj.push(results[key])
                        
                    } else {
                        let getNestedArr = getObj(results[key],element)
                        if(getNestedArr !== undefined){
                            retObj.push(getNestedArr)
                        } else {
                            retObj.push(null)
                            callback({error: key + ":"+element+" - BAD COMMAND"})
                        }
                    }
                } else {
                    callback({error: key + " - DOES NOT EXIST"})
                    retObj.push(null)
                }
            }
            callback(null,retObj)
        } else {
            retObj = {}            
            for (const key in x) {                
                if (results.hasOwnProperty(key)) {
                    const element = x[key];
                    retObj = results[key][element]
                    if (!element){
                        retObj = results[key]
                        callback(null,retObj)
                        return
                    }
                    let getNestedObj = getObj(results[key],element)
                    if(getNestedObj !== undefined){
                        callback(null,getNestedObj)
                        return
                    } else {
                        callback({error: key + ":"+element+" - BAD COMMAND"},{})
                        return
                    }
                } else {
                    callback({error: key + " - DOES NOT EXIST"},{})
                }
            }
        }
    },
    delete: function (x,callback) { // <<<<<<<<<<<<<---------------------------- work on delete function currently copy paste of get
        let retObj
        if(x === null || undefined) return
        if(Object.keys(x).length === 0){
            callback({error: "MUST PROVIDE ID"},false)
            return
        } else if (Object.keys(x).length > 1){
            retObj = []
            for (const key in x) {
                if (results.hasOwnProperty(key)) {
                    const element = x[key];
                    if (!element){
                        retObj.push(results[key])
                        
                    } else {
                        let getNestedArr = getObj(results[key],element)
                        if(getNestedArr !== undefined){
                            retObj.push(getNestedArr)
                        } else {
                            retObj.push(null)
                            callback({error: key + ":"+element+" - BAD COMMAND"})
                        }
                    }
                } else {
                    callback({error: key + " - DOES NOT EXIST"})
                    retObj.push(null)
                }
            }
            callback(null,retObj)
        } else {
            retObj = {}            
            for (const key in x) {                
                if (results.hasOwnProperty(key)) {
                    const element = x[key];
                    retObj = results[key][element]
                    if (!element){
                        retObj = results[key]
                        callback(null,retObj)
                        return
                    }
                    let getNestedObj = getObj(results[key],element)
                    if(getNestedObj !== undefined){
                        callback(null,getNestedObj)
                        return
                    } else {
                        callback({error: key + ":"+element+" - BAD COMMAND"},{})
                        return
                    }
                } else {
                    callback({error: key + " - DOES NOT EXIST"},{})
                }
            }
        }
    },
    getSnapshot: function (x,callback) {
        const expectedKeys = {
            startDate:'',
            endDate:'',
            interval:5
        }
        const today = Date.parse(new Date().toLocaleDateString('en-US'))
        let start , end , onTheHour = true , resultsArry = []
        for (const key in expectedKeys) {
            if (x.hasOwnProperty(key)) {
            } else {
                return callback({
                    error:'MISSING PARAMETERS - Expected {start:xx,end:xx,interval:xx}',
                    query:x
                },[])
            }
        }
        if(x.interval % expectedKeys.interval != 0 || x.interval > 60){
            return callback({
                error:'interval must be divisable by '+ expectedKeys.interval + ' and must not be greater than 60',
                query:x
            },[])
        }
        if(60 % x.interval != 0) onTheHour = false
        if(typeof x.startDate === 'string' && typeof x.endDate === 'string'){
            start = (x.startDate) ? Date.parse(x.startDate) : today
            end = (x.endDate) ? Date.parse(x.endDate) : today
           if(isNaN(start)||isNaN(end)){
            return callback({
                error:'NaN Error - startDate or endDate has a incorrect date',
                query:x
            },[])
           }
        } else if(typeof x.startDate === 'number' && typeof x.endDate === 'number'){
            start = x.startDate
            end = x.endDate
        } else {
            return callback({
                error:'typeof error - startDate and endDate type mismatch',
                query:x
            },[])
        }
        if(start > end){
            return callback({
                error:'date error - the endDate needs to come after the startDate',
                query:x
            },[])
        } else {
            if(end === today || start === end) end = (end + 86400000)
            var docs = snapshotArray.filter(x => {
                return x._id >= start && x._id <= end
            })
            docs.forEach(element => {
                let mins = new Date(element._id)
                mins = mins.getMinutes()
                if(mins % x.interval === 0){
                    if(onTheHour){
                        if(x.tag){
                            let  tagObj = {
                                timeStampPretty: element.timeStampPretty,
                                _id:element._id
                            }
                        for (const key in element) {
                            if(element[key].hasOwnProperty("tag")){
                                element[key].tag.forEach(t => {  
                                    if(t === x.tag){
                                        tagObj[key] = element[key]
                                    }
                                } )
                            } 
                        }
                        resultsArry.push(tagObj)
                        } else {
                        resultsArry.push(element)
                        }
                    } else if(mins > 0){
                    if(x.tag){
                        let  tagObj = {
                                timeStampPretty: element.timeStampPretty,
                                _id:element._id
                            }
                        for (const key in element) {
                            
                            if(element[key].hasOwnProperty("tag")){
                                element[key].tag.forEach(t => {  
                                    if(t === x.tag){
                                        tagObj[key] = element[key]
                                    }
                                } )
                            } 
                        }
                        resultsArry.push(tagObj)
                    }
                    }
                }
            })
            return callback(null,resultsArry)
        }
    },
    getAllSnapshot: function (x,callback) {
        let resultsArry = []
        if(x.tag){
            snapshotArray.forEach(element => {
                let  tagObj = {
                    timeStampPretty: element.timeStampPretty,
                    _id:element._id
                }
                for (const key in element) {
                    if(element[key].hasOwnProperty("tag")){
                        element[key].tag.forEach(t => {  
                            if(t === x.tag){
                                tagObj[key] = element[key]
                            }
                        })
                    } 
                }
                resultsArry.push(tagObj)
            })
            return callback(null,resultsArry)
        }
        return callback(null,snapshotArray)
    },
    Start: class{
        constructor(x){
            serverSettings = x // <---------- this is for desktop notifications please change this (bad ideas)
            this.server = x
            this.NSITE_MQTT()
            if(this.server.hasOwnProperty("snapshotDays"))this.NSITE_SNAPSHOT()
           // if(this.server.hasOwnProperty("influxDB"))this.NSITE_INFLUX()
        }
        NSITE_MQTT(){
            var client  = mqtt.connect(`mqtt://127.0.0.1:${serverSettings.broker}`,{ //connect to local broker
            clientId: "NSITE-BackEnd (readings.js)",
            will: {
                topic: 'NSITE/log',
                payload: 'NSITE - readings disconnected - '+ new Date().toLocaleString(),
                qos: 0,
                retain: false,
                properties: {
                willDelayInterval: 5 /* seconds to wait before publishing the LWT message */
                }
            }
        }) 
    
        client.on('connect', function () {
            client.subscribe(`${serverSettings.facility}/readings/update`, function (err) {})
            client.subscribe(`${serverSettings.facility}/readings/get`, function (err) {})
            client.subscribe(`${serverSettings.facility}/readings/getTag`, function (err) {})
            client.subscribe(`${serverSettings.facility}/snapShot/get`, function (err) {})
            client.subscribe(`${serverSettings.facility}/snapShot/getTag`, function (err) {})
            const liveReadings = setInterval(function () {
                client.publish(`${serverSettings.facility}/readings`,JSON.stringify(results))
            },1000)
        })
        emitter.on("notify", (data) => {
            let obj = {
                facility:serverSettings.facility,
                service:"NSITE",
                parameter:[data.group],
                path:`${serverSettings.facility}/NSITE/${data.group}`,
                subtitle: data.device,
                main: data.msg,
                level: data.level,
                timeStamp: data.timeStamp
            }
            client.publish(`%`,JSON.stringify(obj))
        })
        client.on('message', function (topic, message) {
            let msg = message.toString()
            msg = JSON.parse(msg)
        
            if( topic === `${serverSettings.facility}/readings/get`){
                module.exports.get(msg[0],function(err,res){
                    let reply = {}
                if(msg[1].hasOwnProperty('replyBack')){
                    if(msg[1].replyBack.hasOwnProperty('topic') && msg[1].replyBack.hasOwnProperty('msgID')){
                            let msgID = msg[1].replyBack.msgID
                            reply[msgID] = err ||res
                            if(err){
                                client.publish('error',JSON.stringify(err))
                            }
                            client.publish(msg[1].replyBack.topic,JSON.stringify(reply))
                            } else {
                                client.publish('error',JSON.stringify({error:"There is a issue with the topic and/or msgID field"}))
                            }
                    } else {
                        client.publish('error',JSON.stringify({error:"There is a issue with the replyBack field"}))
                    }
                })
            }
    
            if( topic === `${serverSettings.facility}/readings/getTag`){
                module.exports.getTag(msg[0],function(err,res){
                    let reply = {}
                if(msg[1].hasOwnProperty('replyBack')){
                    if(msg[1].replyBack.hasOwnProperty('topic') && msg[1].replyBack.hasOwnProperty('msgID')){
                            let msgID = msg[1].replyBack.msgID
                            reply[msgID] = err ||res
                            if(err){
                                client.publish('error',JSON.stringify(err))
                            }
                            client.publish(msg[1].replyBack.topic,JSON.stringify(reply))
                            } else {
                                client.publish('error',JSON.stringify({error:"There is a issue with the topic and/or msgID field"}))
                            }
                    } else {
                        client.publish('error',JSON.stringify({error:"There is a issue with the replyBack field"}))
                    }
                })
            }
            if( topic === `${serverSettings.facility}/readings/update`){
                module.exports.update(msg) //<<<<<<<<<<<<<<<<<------------------------ add callback with err after adding call back to update function
            }
        })
        }
        NSITE_SNAPSHOT(){
            let days = this.server.snapshotDays
            days = (days * 1440) / 5
            //console.log(days)
            var time = new Date(),
                secoundsRemaining = (60 - time.getSeconds()) * 1000,
                minsRemaining = 5 - (time.getMinutes() % 5)
                secoundsRemaining = ((minsRemaining - 1) * 60000) + secoundsRemaining

            setTimeout(function(){
                snapshot()
                setInterval(function(){
                    snapshot()
                },300000)
            },secoundsRemaining)

            function snapshot(){
                //if(!process.env.NODE_ENV ) console.log("Snapshot fired -", new Date().toLocaleString())
                logger.info("Snapshot fired",{module:"readings.js"})
                const snapShotDateObj = {
                    timeStampPretty: new Date().toLocaleString(),
                    _id: Date.now()
                }
                const systemSnapShot = Object.assign(snapShotDateObj,results)
                snapshotArray.push(systemSnapShot)
                const removalTime = (Date.now() - days)
                //if(!process.env.NODE_ENV )console.log("snapshot count =",snapshotArray.length)
            if(snapshotArray.length > days)snapshotArray.shift()
            }
        }
        NSITE_INFLUX(){
            const Influx = require('influx')
            influx= new Influx.InfluxDB(this.server.InfluxDB)
            let influxInterval = setInterval(() =>
                influx.getDatabaseNames()
                    .then(names => {
                        if (!names.includes('NSITE')) {
                            influx.createDatabase('NSITE')
                            influx.createRetentionPolicy(x.retentionPolicy.name, x.retentionPolicy)
                            return 
                        }
                    })
                    .then(() => {
                       // influxReady = true
                        //console.log("influxDB is ready")
                        clearInterval(influxInterval)
                        })
                    .catch(err => {
                        //console.error(`Error creating Influx database!`);
                        logger.error("Error creating Influx database",{module:"readings.js"})
                    }),
            10000)
        }
        GET(x,callback){ //<<<<<<<<<<<<<<<<<<<----------------------------- what is this?? remove?
            return(null,"error")
        }
    },
    
}



'use strict'
/* Do not forget to update the nsite_modules build version in package.json */

var revalidator = require('revalidator')

const path = require("path");
const settingsFilePath = path.join(__dirname,'/settings')

const svr = require(settingsFilePath+'/schema/settings_schema/schema_server')
const modbus = require(settingsFilePath+'/schema/settings_schema/schema_modbusDevice')
const plc = require(settingsFilePath+'/schema/settings_schema/schema_PLC')
const events = require(settingsFilePath+'/schema/settings_schema/schema_EVENTS')
const mask = require(settingsFilePath+'/schema/settings_schema/schema_MASK')
const view = require(settingsFilePath+'/schema/settings_schema/schema_VIEW') 


const server = svr.server
const modbusDevice = modbus.modbusDevice
const EVENTS = events.EVENTS
const MASK = mask.MASK
const PLC = plc.PLC  
const VIEW = view.VIEW 



function validate(data,schema,callback){
    var validation = revalidator.validate(data,schema)
    if(validation.valid){
        callback(null,true)
    } else if(!validation.valid){
        callback(validation.errors)
    }
}

module.exports = {
    modbus: function (x, callback) {
        val('modbus',x, function(err,valid){
            if(valid){
                callback(null,true)
            } else if(!valid){
                callback(err)
            }
        })
    },
    server: function (data, callback){
        validate(data,server, function(err,valid){
            if(valid){
                callback(null,true)
            } else if(!valid){
                callback(err)
            }
        })
    },
    modbusDevice: function (data, callback){
        validate(data,modbusDevice, function(err,valid){
            if(valid){
                callback(null,true)
            } else if(!valid){
                callback(err)
            }
        })
    },
    PLC: function (data, callback){
        validate(data,PLC, function(err,valid){
            if(valid){
                callback(null,true)
            } else if(!valid){
                callback(err)
            }
        })
    },
    MASK: function (data, callback){
        validate(data,MASK, function(err,valid){
            if(valid){
                callback(null,true)
            } else if(!valid){
                callback(err)
            }
        })
    },
    EVENTS: function (data, callback){
        validate(data,EVENTS, function(err,valid){
            if(valid){
                callback(null,true)
            } else if(!valid){
                callback(err)
            }
        })
    },
    VIEW: function (data, callback){
        validate(data,VIEW, function(err,valid){
            if(valid){
                callback(null,true)
            } else if(!valid){
                callback(err)
            }
        })
    },
    validate: function (data,name, callback){
        validate(data,name, function(err,valid){
            if(valid){
                callback(null,true)
            } else if(!valid){
                callback(err)
            }
        })
    },

}









const plc = require('./schema_PLC')
const mask = require('./schema_MASK')
const events = require('./schema_EVENTS')
const view = require('./schema_VIEW')
const trend = require('./schema_TREND')

const PLC = plc.PLC
const MASK = mask.MASK
const EVENTS = events.EVENTS
const VIEW = view.VIEW
const TREND = trend.TREND

module.exports  = {
    
    modbusDevice:{
        properties:{
            modbusDevice:{
            description:'Array of all the modbus devices',
            type: 'array',
            required: true,
            items:{
                type:'object',
                additionalProperties:false,
                properties:{
                    name:{
                        description:'device name. numbers and letters only, no spaces',
                        type: 'string',
                        required: true,
                    },
                    host:{
                        description:'ip address of the modbus device',
                        type: 'string',
                        formate:'ip-address',
                        required: true
                    },
                    port:{
                        description:'modbus device port number to be used',
                        type: 'number',
                        required: false
                    },
                    socketTimeout:{
                        description:'set socket timout in ms ( max 4999 )',
                        type: 'number',
                        required: true,
                        maximum: 4999
                    },
                    onErrorTimeout:{
                        description:'time it takes to reconnect to a device if the socket was disconnected (ms)',
                        type: 'number',
                        required: false
                    },
                    onEndTimeout:{
                        description:'time it takes to reconnect to a device if the socket was ended (ms)',
                        type: 'number',
                        required: false
                    },
                    requestInterval:{
                        description:'how often to make a modbus TCP request in ms',
                        type: 'number',
                        required: false
                    },
                    modbusCommand:{
                        description:'modbus function call.(readHoldingRegisters|readDiscreteInputs|readCoils|readInputRegisters)',
                        type: 'string',
                        required: false,
                        enum:['readHoldingRegisters','readDiscreteInputs','readCoils','readInputRegisters']
                    },
                    regOffset:{
                        description:'modbus register offset. Use zero if no offset is needed',
                        type: 'number',
                        required: false
                    },
                    zeroBase:{
                        description:'modbus registers start at 0.',
                        type: 'boolean',
                        required: false
                    },
                    registers:{
                        description:'array of the registers to be used',
                        type: 'array',
                        required: true,
                        items:{
                            type:'object', 
                            properties:{
                                PLC, //schema_PLC
                                MASK, //schema_MASK
                                VIEW, //schema_VIEW
                                EVENTS, //schema_EVENTS
                                TREND
                            }
                        }
                    }
                }
            }
        }
            }
        }
}
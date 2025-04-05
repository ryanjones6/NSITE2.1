const events = require('./schema_EVENTS')
const view = require('./schema_VIEW')
const mask = require('./schema_MASK')

const EVENTS = events.EVENTS
const VIEW = view.VIEW
const MASK = mask.MASK

module.exports = { 
    PLC:{
        description: 'PLC register settings',
        type:'object',
        required: true,
        additionalProperties:false,
        properties:{
            name:{
                description:'Name of the register',
                type:'string',
                required: false
            },
            register:{
                description:'The acutal PLC register number',
                type:'number',
                required: true,
                uniqueItems: true
            },
            math:{
                description:'This will apply a math equation to the registers returned value',
                type:'object',
                required: false,
                properties:{
                    operation:{
                        description:'Math Operation - divide|multiply|add|subtract',
                        type: 'string',
                        required: true,
                        enum:['divide','multiply','add','subtract']
                    },
                    value:{
                        description:'The number for the math equation',
                        type: 'number',
                        required: true
                    },

                }
            },
            binary: {
                description:'Changes the register type from a integer (word) to binary 16 LSB',
                type:'array',
                required:false,
                items:{
                    type:'object',
                    properties:{
                        bit:{
                            description:'Bit number to be used (1-16)',
                            type:'number',
                            required:true,
                            minimum:1,
                            maximum:16
                        },
                        MASK,  //schema_MASK
                        EVENTS, //schema_EVENTS
                        VIEW //schema_VIEW
                        
                    }
                }
            },
            tag:{
                description:'This gives you a means of searching for registers with a keyword/tag',
                type:'array',
                required: false
            },
        }
    }
}
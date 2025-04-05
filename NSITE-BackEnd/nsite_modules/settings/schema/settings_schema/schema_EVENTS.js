module.exports = {
    EVENTS:{
        description:'parameter tells the system to perform an action depending on the registers value',
        type:'array',
        required:false,
        items:{
            type:'object', 
            additionalProperties:true,  
            properties:{
                type:{
                    description:'Event type (email|notification|log)',
                    type:'string',
                    required:true,
                    enum:['email','notification','log']
                },
                readingsValue:{
                    description:'Event value to use from the readings object (value|rawValue|mathValue|minValue|maxValue)',
                    type:'string',
                    required:false,
                    enum:['value','rawValue','mathValue','minValue','maxValue']
                },
                comparison:{
                    description:'Comparison type (equal|notEqual|lessThan|lessThanOrEqual|graterThan|graterThanOrEqual)',
                    type:'string',
                    required:true,
                    enum:['equal','notEqual','lessThan','lessThanOrEqual','graterThan','graterThanOrEqual','between','notBetween']
                },
                value:{
                    description:'The registers value after the MASK is applied',
                    type:['string','number'],
                    required:true
                },
                clearDuration:{
                    description:'How long in ms the event needs be false before it will trigger the event again',
                    type:'number',
                    required:false
                },
                eventTag:{
                    description:'Capture the current values and VIEW names of every PLC register that has the same eventTag value within the PLC tag array',
                    type:'array',
                    required:false
                },
                level:{
                    description:'Event level (error|warning|info)',
                    type:'string',
                    required:false,
                    enum:['error','warning','info']
                },
                options:{
                    description:'Options on handling the event',
                    type:'object',
                    required:false,
                    properties: {
                        suppress:{
                            description:'How long to suppress the event after it was true',
                            type:'number',
                            required:false
                        },
                        oneShot:{
                            description:'Only allow the event to be happen once',
                            type:'boolean',
                            required:false,
                        },
                        buffer:{
                            description:'How long the event has to be true before its triggered (in minutes)',
                            type:'number',
                            required:false,
                            minimum: 1000

                        }
                    }
                }
            }
        }
    }
}
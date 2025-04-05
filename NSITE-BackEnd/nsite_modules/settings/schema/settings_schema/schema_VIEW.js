module.exports = {
    VIEW:{
        description:'The VIEW parameter is to seed the front-end',
        type:'object',
        required:false,
        additionalProperties:true,
        properties:{
            group:{
                description:'The group this register or bit is associated with',
                type:['string','number'],
                required:true
            },
            displayOrder:{
                description:'The display order within the template group',
                type:'number',
                required:false
            },
            name:{
                description:'This is the name/title of the value being displayed on the web & InfluxDB - Used as a tag value',
                type:'string',
                required:true
            },
            style:{
                description:'This is to set the diffrent styles (inline) for all the values being displayed on the web',
                type:['string','number'],
                required:false
            },
            alias:{
                description:'This is a more detailed name used on the front-end and in events. If omited it will defult to the name',
                type:['string','number'],
                required:false
            },
            rule:{
                description:'This allows users to create custom CSS effects based on a readings value',
                type:'object',
                required:false,
                additionalProperties:false,
                properties:{
                    value:{
                        description:'Value field to be changed',
                        type:'array',
                        required:false,
                        items:{
                            type:'object',
                            additionalProperties:true,
                            properties:{
                                readingsValue:{
                                    description:'Event value to use from the readings object (value|rawValue|mathValue|minValue|maxValue)',
                                    type:'string',
                                    required:true,
                                    enum:['value','rawValue','mathValue','minValue','maxValue']
                                },
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
                            css:{
                                description:'Object of CSS values',
                                type:'object',
                                required:true
                            },
                        }
                    },
                    box:{
                        description:'Box that contains the value to be changed',
                        type:'array',
                        required:false,
                        items:{
                            type:'object',
                            additionalProperties:true,
                            properties:{
                                readingsValue:{
                                    description:'Event value to use from the readings object (value|rawValue|mathValue|minValue|maxValue)',
                                    type:'string',
                                    required:true,
                                    enum:['value','rawValue','mathValue','minValue','maxValue']
                                },
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
                            css:{
                                description:'Object of CSS values',
                                type:'object',
                                required:true
                            },
                        }
                    }
                }
            }
        }
    }
}
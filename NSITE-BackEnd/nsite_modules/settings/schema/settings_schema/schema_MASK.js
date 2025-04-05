module.exports = {    
    MASK:{
        description:'The MASK parameter overwrites the register value after the math equation is applied',
        type:'array',
        required:false,
        items:{
            type:'object',
            properties:{
                value:{
                    description:'The registers current value (after the math equation)',
                    type:'number',
                    required:true
                },
                comparison:{
                    description:'The type of comparison to be perform (equal|notEqual|lessThan|lessThanOrEqual|graterThan|graterThanOrEqual|absolute)',
                    type:'string',
                    required:true,
                    enum:['equal','notEqual','lessThan','lessThanOrEqual','graterThan','graterThanOrEqual','absolute']
                },
                trueValue:{
                    description:'The new value if the comparison is true',
                    type:['string','number'],
                    required:true
                },
                action:{
                    description:'What to do with the MASK trueValue (replace|before|after)',
                    type:'string',
                    required:true,
                    enum:['replace','before','after']
                },
            }
        }
    }
}
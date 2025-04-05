module.exports = {    
    TREND:{
        description:'The TREND parameter will enable the "ticker" parameter in the readings object',
        type:['boolean','object'],
        required:false,
        additionalProperties:false,
        properties:{
            sampleRate:{
                description:'How many readings to average before compairing the previous average readings to the offset',
                type:'number',
                required:true
            },
            offset:{
                description:'The allowed diffrence between the last average and current average to determine if the ticker should be up, down, or none',
                type:'number',
                required:true,
                
            }
        }
    }
}
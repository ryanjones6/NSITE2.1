var express = require('express')
var app = express()
const {getAllSnapshot,getSnapshot} = require('../readings')


app.get('/api/snapshot/', function (req, res) {
    getAllSnapshot({},function(err,ret){
        if (err === null){
            return  res.status(200).json({
            status:'success',
            query:{startDate:'',endDate:'',interval:''},
            resultsCount: ret.length,
            results:ret
            }) 
        }
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:{startDate:'',endDate:'',interval:''},
            resultsCount: ret.length,
            results:ret
        }) 
    })
})

app.get('/api/snapshot/:startDate-:endDate/:interval', function (req, res) {
    const start = Number(req.params.startDate)
    const end = Number(req.params.endDate)
    const interval = Number(req.params.interval)
    getSnapshot({startDate:start,endDate:end,interval:interval},function(err,ret){
        if (err === null){
            
            return  res.status(200).json({
            status:'success',
            query:{startDate:start,endDate:end,interval:interval},
            resultsCount: ret.length,
            results:ret
            }) 
        }
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:{startDate:start,endDate:end,interval:interval},
            resultsCount: ret.length,
            results:ret
        }) 
    })
})

// ------------ snapshot get tag query API --------------
app.get('/api/snapshot/:tag/:startDate-:endDate/:interval', function (req, res) {
    const start = Number(req.params.startDate)
    const end = Number(req.params.endDate)
    const interval = Number(req.params.interval)
    const tag = req.params.tag
    getSnapshot({startDate:start,endDate:end,interval:interval,tag:tag},function(err,ret){
        if (err === null){
            return  res.status(200).json({
            status:'success',
            query:{startDate:start,endDate:end,interval:interval,tag:tag},
            resultsCount: ret.length,
            results:ret
            }) 
        }
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:{startDate:start,endDate:end,interval:interval,tag:tag},
            resultsCount: ret.length,
            results:ret
        }) 
    })
})
app.get('/api/snapshot/:tag', function (req, res) {
    const tag = req.params.tag
    getAllSnapshot({tag:tag},function(err,ret){
        if (err === null){
            return  res.status(200).json({
            status:'success',
            query:{startDate:'',endDate:'',interval:'',tag:tag},
            resultsCount: ret.length,
            results:ret
            }) 
        }
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:{startDate:'',endDate:'',interval:'',tag:tag},
            resultsCount: ret.length,
            results:ret
        })  
    })
})


module.exports = app
var express = require('express')
var app = express()
const {get,getTag,update,getTagNames} = require('../readings')

  // ------------ readings get query API's --------------
app.get('/api/readings/get/:id-:request', function (req, res) {
    const id = req.params.id
    const request = req.params.request
    get({[id]:request},function(err,ret){
        if (err === null){
            return  res.status(200).json({
                status:'success',
                query:{[id]:request},
                results:ret
            })
        } 
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:{[id]:request},
            results:ret
        })
    })
})

app.get('/api/readings/get/:id', function (req, res) {
    const id = req.params.id
    get({[id]:''},function(err,ret){
        if (err === null){
            return  res.status(200).json({
                status:'success',
                query:{[id]:''},
                results:ret
            }) 
        } 
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:{[id]:''},
            results:ret
        })
    })
})
app.get('/api/readings/get', function (req, res) {
    get({},function(err,ret){
        if (err === null){
            return  res.status(200).json({
                status:'success',
                query:{},
                results:ret
            }) 
        } 
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:{},
            results:ret
        })
    })
})

// ------------ readings get tag query API's --------------
app.get('/api/readings/tag/:tag', function (req, res) {
    const tag = req.params.tag
    getTag(tag,function(ret,arr){
        if(Object.keys(ret).length > 0){
           return res.status(200).json({
                status:'success',
                query:tag,
                resultsArr:arr,
                results:ret

            }) 
        } else {
            res.status(400).json({
                status:'error',
                errorMsg: "No results",
                query:tag,
                results:ret
            })
        }
    })
})
app.get('/api/readings/tag/', function (req, res) {
    getTag('',function(ret){
        res.status(200).json({
            status:'success',
            query:'',
            results:ret
        }) 
    })
})
app.get('/api/readings/tagNames/', function (req, res) {
    getTagNames('',function(ret){
        res.status(200).json({
            status:'success',
            query:'Get All Tag Names',
            results:ret
        }) 
    })
})

// ------------ readings update query API --------------
app.post('/api/readings/update', function (req, res){
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    const obj = req.body
    update(obj)
    res.status(200).json({
        status:'success',
        query:"update",
        results:obj
    })
})


module.exports = app
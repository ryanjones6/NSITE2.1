var express = require('express')
var app = express()
const {resetMin, resetMax, getTagByID,updateTags,updateViewRule} = require('../modbus')
//var cors = require('cors');

//app.use(cors());


app.get('/api/modbus/getTagByID/:id', function (req, res){
    const id = req.params.id
    getTagByID(id,function(err,ret){
        if (err === null){
            return  res.status(200).json({
                status:'success',
                query:"Get Tag By ID - "+id,
                results:ret
            }) 
        } 
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:"Get Tag By ID - "+id,
            results:[]
        })
    })
})

app.post('/api/modbus/updateTags', function (req, res){

    const obj = req.body
    //console.log(req)
    updateTags(obj)
    res.status(200).json({
        status:'success',
        query:"updateTags",
        results:obj
    })
})

app.get('/api/modbus/:resetType/:id', function (req, res){
    const id = req.params.id
    const resetType = req.params.resetType
    switch (resetType) {
        case 'resetMin':
            resetMin(id)
            return  res.status(200).json({
                status:'success',
                query:resetType +" - "+id,
                results:id
            })
            break;
        case 'resetMax':
            resetMax(id)
            return  res.status(200).json({
                status:'success',
                query:resetType +" - "+id,
                results:id
            })
            break;
    
        default:
            return  res.status(400).json({
                status:'error',
                query:resetType +" - "+id,
                results:id
            })
            break;
    }
}),

app.post('/api/modbus/updateViewRule', function (req, res){

    const obj = req.body
    /* console.log(obj) */
    updateViewRule(obj) 
    res.status(200).json({
        status:'success',
        query:"updateTags",
        results:obj
    })
})




module.exports = app
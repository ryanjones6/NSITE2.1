var express = require('express')
var app = express()
const view = require('../settings/view.json')

app.get('/api/view', function (req, res) {
    res.status(200).json(view)
    //console.log("VIEW REQUESTED")
    //var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    //console.log(ip)
})

module.exports = app
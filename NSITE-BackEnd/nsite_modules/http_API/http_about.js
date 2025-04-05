var express = require('express')
var app = express()
const package = require('../../package.json')

//const modules = require('../settings/about.json')

app.get('/api/about', function (req, res) {
    //let obj = modules
    let obj = {}
    obj.nsite = package.version
    obj.nsite_modules = package.nsite_modules
    obj.dependencies = package.dependencies
    res.status(200).json(obj)
})

app.get('/api/about/schema/VIEW', function (req, res) {
    const view = require('../settings/schema/settings_schema/schema_VIEW')
    res.status(200).json(view)
})

app.get('/api/about/schema/EVENTS', function (req, res) {
    const events = require('../settings/schema/settings_schema/schema_EVENTS')
    res.status(200).json(events)
})

app.get('/api/about/schema/MASK', function (req, res) {
    const mask = require('../settings/schema/settings_schema/schema_MASK')
    res.status(200).json(mask)
})

app.get('/api/about/schema/PLC', function (req, res) {
    const plc = require('../settings/schema/settings_schema/schema_PLC')
    res.status(200).json(plc)
})

app.get('/api/about/schema/TREND', function (req, res) {
    const trend = require('../settings/schema/settings_schema/schema_TREND')
    res.status(200).json(trend)
})

app.get('/api/about/schema/modbusDevice', function (req, res) {
    const modbusDevice = require('../settings/schema/settings_schema/schema_modbusDevice')
    res.status(200).json(modbusDevice)
})

app.get('/api/about/schema/server', function (req, res) {
    const server = require('../settings/schema/settings_schema/schema_server')
    res.status(200).json(server)
})





/*************************************** Future stuff for the API ********************************************************** */
//let fs = require('fs')
/* app.get('/settings', function (req, res) {
    let rawdata = fs.readFileSync('./nsite_modules/settings/systemSettings.json');
    let settings = JSON.parse(rawdata);
    res.json(settings)
})
app.get('/settings/view', function (req, res) {
    res.render('index', "")
})
app.get('/settings/events', function (req, res) {
    res.json(eventsSettings)
}) */
/**************************************************************************************************************************** */



module.exports = app
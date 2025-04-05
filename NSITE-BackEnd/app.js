'use strict'
const env = process.env.NODE_ENV || 'development'
if(env === 'development'){
    console.log(`${env} mode`)
    const os = require('os');
    const networkInterfaces = os.networkInterfaces()
    const eth0 = networkInterfaces.eth0[0].address
    const wlan0 = networkInterfaces.wlan0[0].address
    if(eth0) console.log(`eth0= http://${eth0}`)
    if(wlan0 )console.log(`wlan0= http://${wlan0}`)
}

// NSITE settings files
const serverSettings = require('./nsite_modules/settings/server.json')

// NSITE Primary Modules
const readings = require('./nsite_modules/readings')
new readings.Start(serverSettings) // initialize the NSITE readings module

const modbus = require('./nsite_modules/modbus')
new modbus.Device() // connect to the modbus devices

const events = require('./nsite_modules/events') 
new events.NSITE_EVENTS(serverSettings) // initialize the NSITE events module

const ftp = require('./nsite_modules/ftp')
new ftp.Device(serverSettings) // initialize the ftp devices


const logger = require('./nsite_modules/logger')
global.logger = logger

logger.error("This is a info log", {group:"defult",device:"XL7"})
/*****************************************************************************/ 
//require('./mqtt/broker.js') // start the broker ************ remove me after container is figured out
/*************************************************************************** */

// express stuff
var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var app = express()
var cors = require('cors')

//app.set('view engine', 'html')
//app.set('views', __dirname + '/public/views')
if(env === 'development')app.set('json spaces', 2)
app.set('etag', false)
app.disable('view cache')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
//app.use(express.static(path.join(__dirname, 'public')))
app.use('/favicon.ico', express.static('public/images/favicon.ico'))
app.use(cors())

// NSITE API's
app.use('/', require('./nsite_modules/http_API/http_events'))
app.use('/', require('./nsite_modules/http_API/http_modbus'))
app.use('/', require('./nsite_modules/http_API/http_readings'))
app.use('/', require('./nsite_modules/http_API/http_snapshot'))
app.use('/', require('./nsite_modules/http_API/http_ftp'))
app.use('/', require('./nsite_modules/http_API/http_view'))
app.use('/', require('./nsite_modules/http_API/http_about'))


// Front-End route
app.use(express.static(path.join(__dirname, './dist')))
app.use('/favicon.ico', express.static('./dist/favicon.ico'))
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './dist/index.html'))
})

// Any request that is not definded is redirected to the front-end index page
app.get('*', function(req, res){
    res.redirect("/")
})

// Start the express server
//app.listen(serverSettings.webAppPort)

//module.exports = app

/* ----------------------------------------------------------------------------------- */
// broker.js
var aedes = require('aedes')()
var server = require('net').createServer(aedes.handle)
var httpServer = require('http').createServer()
var ws = require('websocket-stream')


// Start the MQTT Broker
server.listen(serverSettings.broker, function () {
    //console.log('server listening on port', port)
})

// Create the Websocket server with mqtt scheme
ws.createServer({server: httpServer}, aedes.handle)

// Mount the express app
httpServer.on('request',app)

// Start the http & Websocket server
httpServer.listen(serverSettings.webAppPort, function () {
   // console.log('websocket server listening on port', wsPort)
   logger.info("http & websock server running",{module:"app.js",port:serverSettings.port})
})

// MQTT events
aedes.on('publish', function (packet, client) {/* msg processing will go here */})


aedes.on('subscribe', function (subscriptions, client) {
    if (client) {
      //console.log('subscribe from client', subscriptions, client.id)
      logger.info("[ MQTT Broker ] - Subscribe from client",{module:"app.js",topic:subscriptions[0].topic,clientID:client.id})
      //aedes.publish({cmd: 'publish',qos: 2,topic: 'test', payload: new Buffer('test pay'),retain: false})
    }
  })
  
  aedes.on('client', function (client) {
  //  console.log('new client ', client.id)
  
  })
  
  aedes.on('clientDisconnect', function (client){
    //console.log(client.id, ' - Disconnected')
    logger.info(`[ MQTT Broker ] - Dissconnected ${client.id}`,{module:"app.js"})
  })

/*   const fs = require('fs')
  const test = path.resolve(__dirname,"./nsite_modules/eventLogs/eventsLogs-2022-01-03.log")
  const test3 = path.resolve(__dirname,"./nsite_modules/eventLogs")



var test2 = fs.readFileSync(test).toString().split("\n");
for(const i in test2) {
    //console.log(test2[i]);
}
//console.log(test2[2])


fs.readdir(test3, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(file); 
    });
}); */

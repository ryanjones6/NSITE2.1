var express = require('express')
var app = express()
const ftp = require('../ftp') 
var JSFtp = require("jsftp");

/* app.get('/api/ftp/power_logs/list/:listDir', function (req, res){
    let list = req.params.listDir
    list = list.split("-").join("/")
    //console.log(p)
    ftp.list(list,function(err,ret){
       // console.log(err || res)
        if (err === null){
            return  res.status(200).json({
                status:'success',
                query:"list - "+list,
                type: 'array',
                results:ret
            })
        }
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:"list - "+list,
            results:ret
        })
    })
}) */

app.get('/api/ftp/list/:type/:device/:listDir', function (req, res){
    let list = req.params.listDir
    list = list.split("-").join("/")
    let obj = {
        device: req.params.device,
        dir: list,
        type:req.params.type
    }
    ftp.listContents(obj,function(err,ret){
       // console.log(err || res)
        if (err === null){
            return  res.status(200).json({
                status:'success',
                query:`${obj.device} - ${obj.dir}`,
                type: 'array',
                results:ret
            })
        }
        res.status(200).json({
            status:'error',
            errorMsg: err.error,
            query:`${obj.device} - ${obj.dir}`,
            results:ret
        })
    })
})
// /api/ftp/get/power_logs/RCX/:dir/:file
app.get ('/api/ftp/get/:type/:device/:dir/:file', (req, res) => {
    let dir = req.params.dir
    dir = dir.split("-").join("/")
    const file = req.params.file
    let obj = {
        device: req.params.device,
        dir: dir,
        file:req.params.file,
        type:req.params.type
    }
    /* connect(function (ftp){
        ftp.on('error', () => {
            //console.log('Connection error to FTPLogs')
            disconnect(ftp)
            //console.log(err)
            res.status(400).json({
                status:"Error connecting to FTP"
            })
        })
        ftp.raw("CWD", dir , (err, data) => {
            //console.log(data.code)
            if(err || data.code !== 250){
                disconnect(ftp)
                res.status(400).json({
                    status:"CWD error",
                    code:data.code
                })
            }

            var str = ""
            ftp.get(file,(err,socket) => {
                if(err){
                    disconnect(ftp)
                    //console.log(err)
                    res.status(400).json({
                        status:"Error"
                    })
                } else {
                    let readSteam = socket.on('data',data => {
                        str += data.toString()
                    })
                    readSteam.pipe(res)
                    socket.on('end', function (){
                        res.end()
                        disconnect(ftp)
                        //console.log(str)     
                    })
                    socket.on("error", function () {
                        disconnect(ftp)
                        res.status(400).json({
                            status:"Error"
                        })
                    })

                }
            })

        })
    }) */
    ftp.connectFTP(obj,function(err,con){
        con.on('error', () => {
            //console.log('Connection error to FTPLogs')
            ftp.disconnectFTP(con)
            //console.log(err)
            res.status(400).json({
                status:"Error connecting to FTP"
            })
        })
        con.raw("CWD", dir , (err, data) => {
            //console.log(data.code)
            if(err || data.code !== 250){
                ftp.disconnectFTP(con)
                res.status(400).json({
                    status:"CWD error",
                    code:data.code
                })
            }

            var str = ""
            con.get(file,(err,socket) => {
                if(err){
                    ftp.disconnectFTP(con)
                    //console.log(err)
                    res.status(400).json({
                        status:"Error"
                    })
                } else {
                    let readSteam = socket.on('data',data => {
                        str += data.toString()
                    })
                    readSteam.pipe(res)
                    socket.on('end', function (){
                        res.end()
                        ftp.disconnectFTP(con)
                        //console.log(str)     
                    })
                    socket.on("error", function () {
                        ftp.disconnectFTP(con)
                        res.status(400).json({
                            status:"Error"
                        })
                    })

                }
            })

        })
    })
 }) 
/* 

 function connect(callback){
    var ftp = new JSFtp({
        host: "10.212.10.207",
        port: 21,
        user: "",
        pass: ""
    })
    callback(ftp)
    return 
}

function disconnect(ftp){
    ftp.raw("quit", (err, data) => {
        if (err) {
          return console.error(err);
        }
       // console.log("Bye!");
      });
}
 */


module.exports = app
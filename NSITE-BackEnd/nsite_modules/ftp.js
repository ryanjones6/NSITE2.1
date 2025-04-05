'use strict'
/* Do not forget to update the nsite_modules build version in package.json */
var JSFtp = require("jsftp");
const logger = require("./logger")

function connect(obj,callback){
    var ftp = new JSFtp({
        host: ftpDevices[obj.type][obj.device].host,
        port: ftpDevices[obj.type][obj.device].port,
        user: ftpDevices[obj.type][obj.device].user,
        pass: ftpDevices[obj.type][obj.device].pass
    })
    callback(ftp)
    return 
}

function disconnect(ftp){
    ftp.raw("quit", (err, data) => {
        if (err) {
          return logger.error(err,{module:"ftp.js"})//console.error(err)
        }
        //console.log("Bye!");
    })
}


let ftpDevices = {}

module.exports = {
    Device: class{
        constructor(server){
            ftpDevices = server.ftp
        }
    },
    listContents: (obj,callback) => {
        const dir = obj.dir
        let results=[]
        connect(obj, (ftp) =>{
            ftp.on('error', () => {
                //console.log('Connection error to FTPLogs')
                return callback({error:'Connection error to FTPLogs'})
            })
            ftp.raw("CWD", dir , (err, data) => {
                if(err){
                    return callback({error:err})
                }
                ftp.ls(".", (err, res) => {
                    if (!res){
                        //console.log("FTP ERROR Reading Directory")
                        return callback({error:'FTP ERROR Reading Directory'})
                    } else {
                        res.forEach(x => {
                            //console.log(x.name)
                            results.push(x.name)
                        });
                        disconnect(ftp)
                        return callback(null,results)
                    }
                });
            })
        })
    },
    connectFTP: (obj,callback) => {
        connect(obj, (ftp) => {
            return callback(null,ftp)
        })
    },
    disconnectFTP: (ftp) => {
        disconnect(ftp)
    }
}
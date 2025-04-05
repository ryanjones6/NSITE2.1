var express = require('express')
var app = express()
const events = require('../events')

let uuidArray = []
let emailForm = {
    from: 'nsite@nepgroup.com',
    replyTo: 'rjones@nepgroup.com'
}
//########################### Remove me #############################
/* app.post('/api/test', function (req, res){
    const body = req.body
    const facility = body.facility || ""
    emailForm.subject = facility + " NSITE EVENT"
    const time = {
        update(index){
            uuidArray[index].time = Date.now()
        },
        allClearTime(index){
            const clearTime = (Date.now() - 60000) //<--- 9.9 minutes = 594000
            return uuidArray[index].time <clearTime
        } 
    }

    body.alert.forEach((x,i) => {
        //console.log(x.tag[0].results)
        const index = uuidArray.map(e => e.uuid).indexOf(x.uuid);
        if(index > -1){
            if(time.allClearTime(index)){
                //console.log(x.main)
                console.log("send alert - UPDATE Time")
                time.update(index)

            } else {
                console.log("alert happend but its less than the all clear time")
                time.update(index)
                body.alert = body.alert.filter(a => a.uuid !== x.uuid)
            }
        } else {
            let obj = {
                uuid:x.uuid,
                time: Date.now()
            }
            uuidArray.push(obj)
            console.log("alert happend - its NEW")
            //console.log(x.main)
        }
    })

    if(body.alert.length > 0){
        const cssInline_TH = "style='border: 1px solid #999;padding: 0.5rem;text-align: center; background-color:black;color:white; FONT-FAMILY: &quot;Arial&quot;,sans-serif'"
        const cssInline_TD = "style='border: 1px solid #999;padding: 0.5rem;text-align: center; FONT-FAMILY: &quot;Arial&quot;,sans-serif'"
        const disclamer = "<span style='FONT-SIZE: 10pt; COLOR: #333333'><span style='FONT-SIZE: 10pt; -webkit-text-size-adjust: none'><span style='FONT-SIZE: 10pt'><span style='FONT-SIZE: 8pt; FONT-FAMILY: &quot;Arial&quot;,sans-serif; COLOR: #333333; mso-fareast-font-family: &quot;Times New Roman&quot;; mso-no-proof: yes'><span style='FONT-SIZE: 8pt'>CONFIDENTIALITY NOTICE &amp; DISCLAIMER: This email may contain confidential, proprietary, or privileged information. If you are not the intended recipient, please contact the sender by reply email and destroy all copies of the original message.</span>"
        let htmlBody =''
        const tableHeaders = "<th "+cssInline_TH+">Name</th><th "+cssInline_TH+">Value</th>"
        let i = 0
        body.alert.forEach(x => {
            i ++
           const main = "<strong>" + x.main + "</strong><br><span>Facility: " + facility + "</span><br><span>Group: " + body.group + "</span><br><span>Level: " + x.level + "</span><br><span>Message: "+i+" of " + body.alert.length + "</span><p>"
           htmlBody += main
           if(x.tag.length > 0){
                x.tag.forEach(y => {
                    const tableName = "<caption><strong>" + y.name.toUpperCase() + "</strong></caption>"
                    //htmlBody += tableName
                    htmlBody += "<table style='border-collapse:collapse'> <tbody>"
                    htmlBody += tableName
                    htmlBody += tableHeaders
                    y.results.forEach(z => {
                        let tableRow = "<tr><td "+cssInline_TD+">" + z.alias + "</td><td "+cssInline_TD+">" + z.value + "</td></tr>"
                        htmlBody += tableRow
                    })
                    htmlBody += "</tbody></table><p>"
                })
                htmlBody += "<hr><p>"
           } else {
                htmlBody += "<hr><p>"
           }

           
        })
        htmlBody += disclamer
        console.log(htmlBody)
    }

    res.status(200).send(body)






})
 */


app.get('/api/events/get', function (req, res){
    events.get( function(err,ret){
        if (err === null){
            return  res.status(200).json({
                status:'success',
                query:"get",
                results:ret
            })
        }
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:'get',
            results:ret
        })
    })
    
})

app.get('/api/events/groups', function (req, res){
    events.getGroups( function(err,ret){
        if (err === null){
            return  res.status(200).json({
                status:'success',
                query:"get groups",
                type: "array",
                results:ret
            })
        }
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:'get groups',
            type:'array',
            results:ret
        })
    })
    
})


app.get('/api/events/get/:group', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    const group = req.params.group
    events.getByGroup(group,function(err,ret){
        if (err === null){
            return  res.status(200).json({
                status:'success',
                query:"Get By Group - "+group,
                results:ret
            }) 
        } 
        res.status(400).json({
            status:'error',
            errorMsg: err,
            query:"Get By Group - "+group,
            results:ret
        })
    })
})
/* app.get('/events/email/:group', function (req, res){ //<<<<---------- temp solution for SS5
    const group = req.params.group
    http.get('/api/SS9/emailList/TEST', function(err,ret){
        if (err === null){
            return  res.status(200).json({
                status:'success',
                query:'email - '+group,
                results:ret
            })
        }
        res.status(400).json({
            status:'error',
            errorMsg: err.error,
            query:'email - '+group,
            results:ret
        })
    })
}) */

app.post('/api/events/addEvent', function (req, res){
    const obj = req.body
    events.add(obj, function(err,ret){
        if(err === null) {
            return res.status(200).json({ret})
        }
        res.status(400).json({err})
    })  
})

app.post('/api/events/removeByGroup', function (req, res){
    const group = req.body
    //console.log(group)
    events.removeByGroup(group.name, function(err,ret){
        if(err === null) {
            return res.status(200).json({ret})
        }
        res.status(400).json({err})
    })  
})

app.post('/api/events/removeById', function (req, res){
    const id = req.body
    //console.log(id)
    events.removeByID(id.uuid, function(err,ret){
        if(err === null) {
            return res.status(200).json({ret})
        }
        res.status(400).json({err})
    })  
})

module.exports = app
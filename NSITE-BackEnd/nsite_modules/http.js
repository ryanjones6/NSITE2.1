const axios = require ('axios')

let axiosConfig = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
    }
  }
const tempURL = 'http://10.10.205.20:3001' // <------ remove after dev

const api = {
    post: (url,postData,callback) => {
        axios.post(tempURL+url, postData, axiosConfig)
        .then((res) => {
            callback(null,res)
        })
        .catch((err) => {
            callback("AXIOS ERROR: " + err)
        })
    },
    get: (url,callback) => {
        axios.get(tempURL+url)
        .then(res => {
            callback(null,res)
        })
        .catch((err) => {
            callback("AXIOS ERROR: " + err)
        })
    },  
}

module.exports = api
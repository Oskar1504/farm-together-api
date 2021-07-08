
const fs = require('fs')


var Log = {
    tsErrorApi: function (err) {
        try{
            console.log("Error occured. Check logs.")
            let content =  `[${new Date().toISOString().slice(0, 19)}] ${err.name}: ${err.message} Url: ${err.config.url} \n`
            fs.appendFileSync("server/log/system.log",content)
        }catch{
            let content =  `[${new Date().toISOString().slice(0, 19)}] ${err.name}: ${err.message} \n`
            fs.appendFileSync("server/log/system.log",content)
        }

    },
    logReq: function (reqConfig, title) {
        try{
            let content =  `[${new Date().toISOString().slice(0, 19)}] SUCCESS ${reqConfig.method}: ${reqConfig.url} Title: ${title} \n`
            console.log(content.replace("\n",""))
            fs.appendFileSync("server/log/system.log",content)
        }catch{
            console.log("logging error")
        }

    },
    logReqErr: function (reqConfig) {
        try{
            let content =  `[${new Date().toISOString().slice(0, 19)}] ERROR ${reqConfig.method}: ${reqConfig.url} \n`
            fs.appendFileSync("server/log/system.log",content)
        }catch{
            console.log("logging error")
        }

    },
    logInfo: function (string) {
        try{
            let content =  `[${new Date().toISOString().slice(0, 19)}] INFO ${string} \n`
            console.log(content.replace("\n",""))
            fs.appendFileSync("server/log/system.log",content)
        }catch{
            console.log("logging error")
        }

    }
}

module.exports = Log;
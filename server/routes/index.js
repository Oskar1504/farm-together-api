const express = require('express');
const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs")

const log = require('../log.js');
const router = express.Router();

router.get('/ft/list/:type',async (req, res, next) => {
    try{
        //requests side from website
        let type = capitalizeFirstLetter(req.params.type)
        let url = `https://farmtogether.fandom.com/wiki/${type}`;
        axios({
            method:'get',
            url
        })
            .then(function (response) {
                const dom = new JSDOM(response.data);
                let title = dom.window.document.querySelector("title").textContent
                console.log(title);
                let tables = [...dom.window.document.getElementsByClassName("article-table")]

                let o = {}
                tables.forEach(function(table,index,array){
                    //query needs to be changed since animals have other td tree
                    let query = "td span a",
                        type2 = table.querySelectorAll("h3")[0].textContent.replace(/ /g,"")
                    if(type === "Animals"){
                        query = "td a"
                    }

                    let t = []
                    table.querySelectorAll(query).forEach(flower => {
                        t.push({name:flower.textContent,type:type2,link: flower.href})
                    })

                    o[type2] = t
                })

                let content = {
                    url:response.config.url,
                    date:new Date(),
                    title: title,
                    data:o
                }
                fs.writeFile(`server/scrapped_data/lists/${type}.json`, JSON.stringify(content), function (err) {
                    if (err) throw err;
                    log.logReq(response.config,title)
                    res.send(JSON.stringify(content))
                });
            })
            .catch(function (error) {
                console.log(error);
                log.logReqErr(response.config)
                res.sendStatus(500)
            })

    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
});

router.get('/ft/item/:name',async (req, res, next) => {
    try{
        //requests side from website
        let itemname = req.params.name
        let url = `https://farmtogether.fandom.com/wiki/${itemname}`;
        axios({
            method:'get',
            url
        })
            .then(async function (response) {
                const dom = new JSDOM(response.data);
                let title = dom.window.document.querySelector("title").textContent,
                    profitTable = dom.window.document.getElementsByClassName("article-table")[0],
                    infoTable = dom.window.document.getElementsByClassName("infobox")[0],
                    o = []

                console.log(title);
                let crop = {buy:0,harvest:0,time:0,seasons:[],type:"",profit:[],requirements:[],image:{url:"",urlBase64:""}}

                try {
                    getCropInfo(crop,infoTable)
                } catch (e) {
                    console.log(e)
                }

                try{
                    getCropRequirement(crop,infoTable)
                }catch (e){
                    console.log(e)
                }

                try{
                    await getCropImage(crop,infoTable)
                }catch (e){
                    console.log(e)
                }

                let rows = profitTable.querySelectorAll("tr"),profit = []
                for(let i = 1;i < rows[0].children.length;i++){
                    profit.push({level:rows[0].children[i].textContent.replace("\n",""),standard:rows[1].children[i].textContent.replace("\n",""),flat:rows[2].children[i].textContent.replace("\n","")})
                }
                crop.profit = profit

                res.send(JSON.stringify(crop))
                log.logInfo(`FINISHED with ${req.protocol + '://' + req.get('host') + req.originalUrl}`)
            })
            .catch(function (error) {
                console.log(error);
                log.logReqErr(response.config)
                res.sendStatus(500)
            })

    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
});

router.get('/ft/listItems/:type',async (req, res, next) => {
    try{
        let type = capitalizeFirstLetter(req.params.type),
            itemData = JSON.parse(fs.readFileSync("server/scrapped_data/lists/"+type+".json"))
        res.send(JSON.stringify(Object.keys(itemData.data)))
        log.logInfo(`FINISHED with ${req.protocol + '://' + req.get('host') + req.originalUrl}`)
    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
});

router.get('/ft/listItems/:type/:type2',async (req, res, next) => {
    try{
        let type = capitalizeFirstLetter(req.params.type),
            type2 = capitalizeFirstLetter(req.params.type2),
            itemData = JSON.parse(fs.readFileSync("server/scrapped_data/lists/"+type+".json")),
            output = []
        for(crop2 of itemData.data[type2]){
            let url = `https://farmtogether.fandom.com${crop2.link}`;
            await axios({
                method:'get',
                url
            })
                .then(function (response) {
                    const dom = new JSDOM(response.data);
                    let title = dom.window.document.querySelector("title").textContent,
                        profitTable = dom.window.document.getElementsByClassName("article-table")[0],
                        infoTable = dom.window.document.getElementsByClassName("infobox")[0],
                        o = []

                    let crop = {name:crop2.name,link:crop2.link,buy:0,harvest:0,time:0,seasons:[],type:"",profit:[],requirements:[]}


                    try {
                        getCropInfo(crop,infoTable)
                    } catch (e) {
                        console.log(e)
                    }

                    try{
                        getCropRequirement(crop,infoTable)
                    }catch (e){
                        console.log(e)
                    }


                    let rows = profitTable.querySelectorAll("tr"),profit = []
                    try{

                        for(let i = 1;i < rows[0].children.length;i++){
                            profit.push({level:rows[0].children[i].textContent.replace("\n",""),standard:rows[1].children[i].textContent.replace("\n",""),flat:rows[2].children[i].textContent.replace("\n","")})
                        }
                        crop.profit = profit
                    }catch(e){
                        console.log(e)
                    }
                    output.push(crop)
                    log.logReq(response.config,title)

                })
                .catch(function (error) {
                    console.log(error);
                    res.sendStatus(500)
                })
        }

        processOutput(output);

        fs.writeFile(`server/scrapped_data/${type}_${type2}.json`, JSON.stringify(output), function (err) {
            if (err) throw err;
            res.send(JSON.stringify(output))
            log.logInfo(`FINISHED with ${req.protocol + '://' + req.get('host') + req.originalUrl}`)
        });

    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
});

router.get('/ft/listAll/:type',async (req, res, next) => {
    try{
        let type = capitalizeFirstLetter(req.params.type),
            itemData = JSON.parse(fs.readFileSync("server/scrapped_data/lists/"+type+".json")),
            output = []
        for(type2 of Object.keys(itemData.data) ) {
            log.logInfo(`STARTING with ${type} => ${type2}`)

            for (crop2 of itemData.data[type2]) {
                let url = `https://farmtogether.fandom.com${crop2.link}`;
                await axios({
                    method: 'get',
                    url
                })
                    .then(async function (response) {
                        const dom = new JSDOM(response.data);
                        let title = dom.window.document.querySelector("title").textContent,
                            profitTable = dom.window.document.getElementsByClassName("article-table")[0],
                            infoTable = dom.window.document.getElementsByClassName("infobox")[0],
                            o = []

                        let crop = {
                            name: crop2.name,
                            link: crop2.link,
                            buy: 0,
                            harvest: 0,
                            time: 0,
                            seasons: [],
                            type: "",
                            profit: [],
                            requirements: [],
                            image:{
                                url:"",
                                urlBase64:""
                            }
                        }

                        try {
                            getCropInfo(crop,infoTable)
                        } catch (e) {
                            console.log(e)
                        }

                        try{
                            getCropRequirement(crop,infoTable)
                        }catch (e){
                            console.log(e)
                        }

                        try{
                            await getCropImage(crop,infoTable)
                        }catch (e){
                            console.log(e)
                        }


                        let rows = profitTable.querySelectorAll("tr"), profit = []
                        try {

                            for (let i = 1; i < rows[0].children.length; i++) {
                                profit.push({
                                    level: rows[0].children[i].textContent.replace("\n", ""),
                                    standard: rows[1].children[i].textContent.replace("\n", ""),
                                    flat: rows[2].children[i].textContent.replace("\n", "")
                                })
                            }
                            crop.profit = profit
                        } catch (e) {
                            console.log(e)
                        }
                        output.push(crop)
                        log.logReq(response.config, title)

                    })
                    .catch(function (error) {
                        console.log(error);
                        res.sendStatus(500)
                    })
            }

            log.logInfo(`FINISHED with ${type} => ${type2}`)
        }
        try{
            processOutput(output);
        }catch (e) {
            console.log(e)
        }
        fs.writeFile(`server/scrapped_data/all_${type}.json`, JSON.stringify(output), function (err) {
            if (err) throw err;
            res.send(JSON.stringify(output))
            log.logInfo(`FINISHED with ${req.protocol + '://' + req.get('host') + req.originalUrl}`)
        });

    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
});

router.get('/getCrops',async (req, res, next) => {
    try{
        console.log(`FINISHED with ${req.protocol + '://' + req.get('host') + req.originalUrl}`)
        res.send(fs.readFileSync("server/scrapped_data/all_Crops.json"))
    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
});

module.exports = router;


async function getCropImage(crop,infoTable){
    let url = infoTable.querySelectorAll("tr")[1].children[0].children[0].children[0].src.replace("110","64").split("?")[0]

    // src => https://stackoverflow.com/a/52648030/14077167
    let image = await axios.get(url, {responseType: 'arraybuffer'});
    let urlBase64 = Buffer.from(image.data).toString('base64');

    crop.image.url = url
    crop.image.urlBase64 = "data:image/png;base64," + urlBase64
}

function getCropInfo(crop,infoTable){
    infoTable.querySelectorAll("tr").forEach(row => {
        if (row.children.length >= 2) {
            let th = row.children[0].textContent

            switch (true) {
                case th.includes("Buy"):
                    crop.buy = row.children[1].textContent.replace("\n", "")
                    break;
                case th.includes("Plant on"):
                    [...row.children[1].children].forEach(a => {
                        crop.seasons.push(a.children[0].alt.split(".")[0])
                    })
                    break;
                case th.includes("Harvest each"):
                    crop.time = row.children[1].textContent.replace("\n", "")
                    break;
                case th.includes("Harvest"):
                    crop.harvest = row.children[1].textContent.replace("\n", "").split(" ")
                    break;
                case th.includes("Resource"):
                    crop.type = row.children[1].children[0].children[0].alt.split(".")[0]
                    break;
            }
        }
    })
}

function getCropRequirement(crop,infoTable){
    //adds requirements
    let rows2 = [...infoTable.querySelectorAll("tr")].reverse()
    for(row of rows2){
        if(row.textContent.includes("Requirement")){
            break
        }else{
            crop.requirements.push({requirement:row.children[0].textContent.replace("\n","") ,level: row.children[1].textContent.replace("\n","")})
        }
    }
}

function processOutput(output){
    output.forEach(item =>{
        item.time.replace("hours","h")

        let a = convertBuy(item.buy),
            b = convertTime(item.time),
            c = convertBuy(item.harvest.join(" "))

        item.buyInt = a[0]
        item.buyExpInt = a[1] ? a[1] : 0

        item.timeInt = b

        item.harvest = item.harvest.join(" ")
        item.harvestInt = c[0]
        item.harvestExpInt = c[1] ? c[1] : 0

        item.profit.forEach(lvl =>{
            let sInt =  convertBuy(lvl.standard)[0],
                fInt =  convertBuy(lvl.flat)[0]
            lvl.standardInt = sInt ? sInt : 0
            lvl.flatInt = fInt ? fInt : 0
        })

        item.profitPerPlant = item.harvestInt - item.buyInt
        item.profitPerHour = item.profitPerPlant/item.timeInt
        item.profit = []
    })
}

function convertTime(s) {
    let ts = s.split(" "),
        o = 0

    ts.forEach(time => {
        switch(true){
            case time.includes("m"):
                o += parseInt(time.split("m")[0])
                break
            case time.includes("h"):
                o += parseInt(time.split("h")[0]) * 60
                break
            case time.includes("d"):
                o += parseInt(time.split("d")[0]) * 1440
                break
        }
    })

    return o/60
}

function convertBuy(s) {
    let buy = parseInt(s.split(" ")[0].replace(",",".").replace(".","").replace("k","K").replace("K","0")),
        exp = parseInt(s.split(" ")[1])

    return [buy,exp]
}

function chunk(arr, chunkSize) {
    if (chunkSize <= 0) throw "Invalid chunk size";
    var R = [];
    for (var i=0,len=arr.length; i<len; i+=chunkSize)
        R.push(arr.slice(i,i+chunkSize));
    return R;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
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
            .then(function (response) {
                const dom = new JSDOM(response.data);
                let title = dom.window.document.querySelector("title").textContent,
                    profitTable = dom.window.document.getElementsByClassName("article-table")[0],
                    infoTable = dom.window.document.getElementsByClassName("infobox")[0],
                    o = []

                console.log(title);
                let crop = {buy:0,harvest:0,time:0,seasons:[],type:"",profit:[]}
                infoTable.querySelectorAll("tr").forEach(row => {
                    if(row.children.length >= 2){
                        let th = row.children[0].textContent

                        switch (true) {
                            case th.includes("Buy"):
                                crop.buy = row.children[1].textContent.replace("\n","")
                                break;
                            case th.includes("Plant on"):
                                [...row.children[1].children].forEach(a =>  {
                                    crop.seasons.push(a.children[0].alt.split(".")[0])
                                })
                                break;
                            case th.includes("Harvest each"):
                                crop.time = row.children[1].textContent.replace("\n","")
                                break;
                            case th.includes("Harvest"):
                                crop.harvest = row.children[1].textContent.replace("\n","").split(" ")
                                break;
                            case th.includes("Resource"):
                                crop.type = row.children[1].children[0].children[0].alt.split(".")[0]
                                break;
                        }
                    }
                })

                let rows = profitTable.querySelectorAll("tr"),profit = []
                for(let i = 1;i < rows[0].children.length;i++){
                    profit.push({level:rows[0].children[i].textContent.replace("\n",""),standard:rows[1].children[i].textContent.replace("\n",""),flat:rows[2].children[i].textContent.replace("\n","")})
                }
                crop.profit = profit

                res.send(JSON.stringify(crop))
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

                    let crop = {name:crop2.name,link:crop2.link,buy:0,harvest:0,time:0,seasons:[],type:"",profit:[]}
                    try {
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
                    catch(e){
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
            fs.writeFile(`server/scrapped_data/${type}_${type2}.json`, JSON.stringify(output), function (err) {
                if (err) throw err;
                res.send(JSON.stringify(output))
            });

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
    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
});

module.exports = router;

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
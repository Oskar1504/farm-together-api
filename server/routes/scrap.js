const express = require('express');
const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs")

const log = require('../log.js');
const router = express.Router();


router.get('/pokemon/gen/:gen',async (req, res, next) => {
    try{
        // axios request to get website html code
        //requests side from website
        let type = req.params.gen
        let url = `https://www.serebii.net/pokemon/gen${type}pokemon.shtml`;
        // let url = `http://localhost:3001/test.html`;
        axios({
            method:'get',
            url
        })
            .then( async function (response) {
                //when website html code received it converts it into an dom element
                const dom = new JSDOM(response.data);

                //stores tab name for debugging purposes
                let title = dom.window.document.querySelector("title").textContent
                console.log(title);

                // creates an array with all tables with specified class
                let tables = [...dom.window.document.getElementsByClassName("dextable")]

                let pokemons = []

                let rows = tables[0].querySelectorAll("tr")

                try{
                    let leng =  rows.length
                    for(let i = 2; i < leng; i++){


                        let row = rows[i]
                        if(row.children.length > 1){
                            pokemons.push({
                                id: row.children[0].textContent.replace(/[^0-9\.]+/g, ''),
                                image:await getPokemonImage(row.children[1],type),
                                name: row.children[2].children[0].innerHTML,
                                type:extractType(row.children[3]),
                                stats: {
                                    hp:row.children[5].textContent,
                                    atk:row.children[6].textContent,
                                    def:row.children[7].textContent,
                                    satk:row.children[8].textContent,
                                    sdef:row.children[9].textContent,
                                    spd:row.children[10].textContent
                                }
                            })


                        }


                    }
                }catch(e){
                    console.log(e)
                }

                let content = {
                    url:response.config.url,
                    date:new Date(),
                    title: title,
                    data:pokemons
                }

                // writes data to file

                fs.writeFile(`server/scrapped_data/pokemon/gen-${type}/data.json`, JSON.stringify(content), function (err) {
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

module.exports = router;


async function  getPokemonImage(td,gen){
    let l  = ""
    try{
        // theres an table inside the td with the image
         l = td.children[0].children[0].children[0].children[0].children[0].children[0].src.replace("/small","")
        let url = "https://www.serebii.net" + l,
            imageName = url.split("/").reverse()[0],
            fileName = "server/scrapped_data/pokemon/gen-"+gen+"/images/" + imageName

        //using statsync to check if file already exist otherwise download it
        try{
            fs.statSync(fileName)
        }catch (e) {
            // converts image url to base64 string
            // src => https://stackoverflow.com/a/52648030/14077167
            let image = await axios.get(url, {responseType: 'arraybuffer'});
            let urlBase64 = Buffer.from(image.data).toString('base64');

            await sleep(2000)

            // writes image
            fs.writeFile(fileName , urlBase64, {encoding: 'base64'}, function(err) {
                log.logInfo(`SUCCESS ${url} Downloaded image Gen-${gen} ${imageName}`)

            });
        }
        



    }catch (e) {
        console.log(e)
    }

    return l
}

function extractType(td){
    let o = []
    try{
        // need to form own array to forEach over it
        let td2 = [...td.children]
        td2.forEach(a => {
            // a href is /pokemon/type/grass only need the last bit
            o.push(a.href.split("/").reverse()[0])
        })

    }catch (e) {
        console.log(e)
    }
    return o.join(",")
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
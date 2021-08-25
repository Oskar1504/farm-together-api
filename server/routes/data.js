const express = require('express');
const fs = require("fs")
const router = express.Router();


router.get('/pokemon/gen/:gen',async (req, res, next) => {
    try{
        res.json(JSON.parse(fs.readFileSync("server/scrapped_data/pokemon/gen-"+req.params.gen+"/data.json")))

    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
});

router.get('/pokemon/all/gen',async (req, res, next) => {
    try{
        let o = []
        for(let i = 1; i < 9; i++){
            o.push(JSON.parse(fs.readFileSync("server/scrapped_data/pokemon/gen-"+i+"/data.json")))
        }
        res.json(o)

    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
});
module.exports = router;

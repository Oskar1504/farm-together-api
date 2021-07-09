const express = require('express');

const router = express.Router();


Array("rechner","r","rächner","calc","calculator","c","").forEach(path =>{
    router.get("/"+path,async (req, res, next) => {
        try{
            res.redirect("rechner.html")
        }catch(e){
            console.log(e)
            res.sendStatus(500)
        }
    });
})

Array("table","t","tabelle").forEach(path =>{
    router.get("/"+path,async (req, res, next) => {
        try{
            res.redirect("tabel.html")
        }catch(e){
            console.log(e)
            res.sendStatus(500)
        }
    });
})


module.exports = router;

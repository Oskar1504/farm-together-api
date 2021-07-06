const express = require('express');
const apiRouter = require('./routes');


const app =  express();

app.use(express.static('public'));
app.use(express.json());
app.use('/api', apiRouter);

app.listen(3001, () =>{
    console.log("server is running at http://localhost:3001")
})

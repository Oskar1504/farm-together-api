const express = require('express');
const apiRouter = require('./routes');
const router = require('./routes/public.js');


const app =  express();

app.use(express.static('public'));
app.use(express.json());
app.use('/api', apiRouter);
app.use('/', router);

app.listen(3001, () =>{
    console.log("server is running at http://localhost:3001")
})

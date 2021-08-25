const express = require('express');
const scrappingRouter = require('./routes/scrap.js');
const router = require('./routes/public.js');
const dataRouter = require('./routes/data.js');


const app =  express();

app.use(express.static('public'));
app.use(express.json());
app.use('/scrap', scrappingRouter);
app.use('/data', dataRouter);
app.use('/', router);

app.listen(3001, () =>{
    console.log("server is running at http://localhost:3001")
})

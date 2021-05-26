const express = require("express");
const app = express();

const fileRoutes = require('./routes/files');
const showRoutes = require('./routes/show')
const downloadRoutes = require('./routes/download')
const path = require('path');
// const require = require('ejs');

app.use(express.static('public'));
app.use(express.json())

const connectDB = require('./config/db');
const { urlencoded } = require("body-parser");
connectDB();

//template engine
app.set('views', path.join(__dirname,'/views'));
app.set('view engine', 'ejs');


//routes

app.use('/api/files', fileRoutes);

app.use('/files',showRoutes)

app.use('/files/download',downloadRoutes);


const port = process.env.PORT || 3000 ;

app.listen(port, ()=>{
    console.log(`Listening at port ${port}`);
})
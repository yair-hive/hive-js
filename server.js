const express = require('express')
const map_router = require('./src/routs/map')

const app = express()
const port = 3020

app.use('/map', map_router)

app.listen(port, function(){
    console.log("express start")
})
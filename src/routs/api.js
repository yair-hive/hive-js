const express = require('express')
const router = express.Router()

const maps = require('./api/maps')
const seats = require('./api/seats')
const guests = require('./api/guests')
const tags = require('./api/tags')
const users = require('./api/users')
const map_elements = require('./api/map_elements')
const projects = require('./api/projects')
const guest_groups = require('./api/guest_groups')
const seat_belongs = require('./api/seat_belongs')
const seats_groups = require('./api/seats_groups')
const tag_belongs = require('./api/tag_belongs')
const requests_belongs = require('./api/requests_belongs')

const actions = {
    maps,
    seats,
    guests,
    tags,
    map_elements,
    projects,
    guest_groups,
    seat_belongs,
    seats_groups,
    tag_belongs,
    requests_belongs,
    users
}

router.post('/', async (req, res)=>{
    const {category, action} = req.body
    try {
        if(!category || !action){
            throw new Error('parameter misseng');
        }
        if(category.length == 0 || action.length == 0){
            throw new Error('parameter misseng');
        }
        if(!actions[category]){
            throw new Error('category dont exists');;
        }
        if(!actions[category][action]){
            throw new Error('action dont exists');
        }
        var respons = {
            data: await actions[category][action](req.body, req),
            msg: 'ok'
        }
        res.json(respons)
    } catch (error) {
        res.status(500).json({msg: false, data: error}) 
    }
})

module.exports = router
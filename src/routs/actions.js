const express = require('express')
const mysql = require('mysql')
const router = express.Router()

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hive",
    multipleStatements: true
})

con.connect()

function row_score(seats){
    var rows = [];

    seats.forEach(seat =>{
        if(rows.indexOf(seat.row_num) === -1) rows.push(seat.row_num);
    })

    rows.sort(function(a, b) { return a - b; });
    rows.reverse();

    var seats_by_row = {}
    rows.forEach(row => seats_by_row[row.toString()] = [])
    seats.forEach((seat, index) => seats_by_row[seat.row_num].push(index))

    var i = 0
    for(let row of rows){
        i++
        seats_by_row[row].forEach(index => {
            seats[index].row_score = i
        })
    }
    return seats
}
function col_score(seats, map){
    var cols = [];
    map.columns_number = Number(map.columns_number)
    var to = map.cols_to
    var cols_even = Math.round(map.columns_number / 2) === Math.floor(map.columns_number / 2)
    var cols_middle = Math.round(map.columns_number / 2)
    seats.forEach(seat =>{
        if(cols.indexOf(seat.col_num) === -1) cols.push(seat.col_num);
    })
    cols.sort(function(a, b) { return a - b; });

    var seats_by_col = {}
    cols.forEach(col => seats_by_col[col.toString()] = [])
    seats.forEach((seat, index) => seats_by_col[seat.col_num].push(index))

    var i = 0 
    if(to === 'center'){
        cols.reverse()
        for(let col of cols){
            if(cols_even){
                if(col != (cols_middle + 1)){
                    if(col < cols_middle) i++; 
                    if(col > cols_middle) i--;    
                }
                if(col == cols_middle) i++;
                score = Math.abs(i);
            }else{
                if(col < cols_middle)  i--;
                if(col > cols_middle) i++; 
                if(col == cols_middle) i++;
                score = i;
                if(col == cols_middle) score = Math.abs(i);
            }
            seats_by_col[col].forEach(index => {
                seats[index].col_score = score
            })
        }
    }
    if(to === 'left'){
        cols.reverse()
        var score = 0
        for(let col of cols){
            score ++
            seats_by_col[col].forEach(index => {
                seats[index].col_score = score
            })
        }
    }
    if(to === 'right'){
        var score = 0
        for(let col of cols){
            score ++
            seats_by_col[col].forEach(index => {
                seats[index].col_score = score
            })
        }
    }
    return seats
}
function group_score(seats, groups){

    var seats_as_object = {}
    seats.forEach(seat => seats_as_object[seat.id] = seat)

    for(let group of groups){
        var cols = []
        for(let i = group.from_col; i <= group.to_col; i++){
            cols.push(i)
        }
        var group_seats = []
        for(let seat of seats){
            if(seat.col_num >= group.from_col && seat.col_num <= group.to_col && seat.row_num >= group.from_row && seat.row_num <= group.to_row){
                group_seats.push(seat)  
            }
        }

        var seats_by_col = {}
        cols.forEach(col => seats_by_col[col.toString()] = [])
        group_seats.forEach((seat, index) => seats_by_col[seat.col_num].push(index))

        cols.sort(function(a, b) { return a - b; });  

        var score = 20
        var mid = Math.floor((cols[0]+cols[cols.length -1])/2);
        var as = ((cols.length /2) %1) != 0
        for(let col of cols){
            seats_by_col[col].forEach(index => {
                var seat_id = group_seats[index].id
                seats_as_object[seat_id].pass_score = score
            })
            if(col < mid) score = score - 2
            if(as && col == mid) score = score + 2
            if(col > mid) score = score + 2 
        }
    }
    var seats_as_array = Object.entries(seats_as_object)
    seats_as_array = seats_as_array.map(([key, seat])=> seat)
    return seats_as_array
}
function calculat_seats(seats, map, groups){
    seats = row_score(seats);
    seats = col_score(seats, map);
    seats = group_score(seats, groups);
    seats = seats.map(seat => {
        var {row_score, col_score, pass_score} = seat
        if(!row_score) row_score = 0
        if(!col_score) col_score = 0
        if(!pass_score) pass_score = 0
        seat.score = row_score + col_score + pass_score
        return seat
    })
    return seats
}
function calculat_guests(guests, groups){
    var groups_as_object = {} 
    groups.forEach(group => groups_as_object[group.id] = group)
    guests = guests.map(guest => {
        guest.score = guest.score + groups_as_object[guest.guest_group].score
        return guest
    })
    return guests
}
function calculat_tags(seats, tags){
    var tags_as_object = {}
    tags.forEach(tag => tags_as_object[tag.seat] = [])
    tags.forEach(tag => tags_as_object[tag.seat].push(tag.group_id))
    return seats.map(seat => {
        if(tags_as_object[seat.id]) seat.tags = tags_as_object[seat.id]
        return seat
    })
}
function calculat_requests(guests, requests){
    var requests_as_object = {}
    requests.forEach(request => requests_as_object[request.guest] = [])
    requests.forEach(request => requests_as_object[request.guest].push(request.request))
    return guests.map(guest => {
        if(requests_as_object[guest.id]) guest.requests = requests_as_object[guest.id]
        return guest
    })
}

function get_project_id(project_name){
    return new Promise((resolve, reject) => {
        var query_string = `SELECT * FROM projects WHERE name='${project_name}'`
        con.query(query_string, (err, map_result)=>{
            if(err) reject(err)
            else resolve(map_result[0].id)
        })
    })
}
function getMap(project_id, map_name){
    return new Promise((resolve, reject) => {
        var query_string = `SELECT * FROM maps WHERE project='${project_id}' AND map_name = '${map_name}'`
        con.query(query_string, (err, map_result)=>{
            if(err) reject(err)
            else resolve(map_result[0])
        })
    })
}
function getMaps(project_id){
    return new Promise((resolve, reject) => {
        var query_string = `SELECT * FROM maps WHERE project='${project_id}'`
        con.query(query_string, (err, map_result)=>{
            if(err) reject(err)
            else resolve(map_result)
        })
    })
}
function getSeats(map_id){
    return new Promise((resolve, reject) => {
        var query_string = `SELECT * FROM seats WHERE map='${map_id}';`
        con.query(query_string, (err, seats_result)=>{
            if(err) reject(err)
            else resolve(seats_result)
        })       
    })
}
function getSeatsGroups(map_id){
    return new Promise((resolve, reject) => {
        var query_string = `SELECT * FROM seats_groups WHERE map = '${map_id}';`;
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })       
    })
}
function getTagsBelongs(map_id){
    return new Promise((resolve, reject) => {
        var query_string = `SELECT * FROM tag_belongs WHERE map = '${map_id}'`;
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })       
    })
}

function getGuests(project_id){
    return new Promise((resolve, reject) => {
        var query_string = `SELECT * FROM guests WHERE project = '${project_id}';`;
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })       
    })
}
function getGuestsGroup(project_id){
    return new Promise((resolve, reject) => {
        var query_string = `SELECT * FROM guests_groups WHERE project = '${project_id}';`;
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })       
    })
}
function getRequests(project_id){
    return new Promise((resolve, reject) => {
        var query_string = `SELECT * FROM guests_requests WHERE project = '${project_id}'`;
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })       
    })
}

function getRandomNumber(max) {
    let min = 0
    let step1 = max - min + 1;
    let step2 = Math.random() * step1;
    let result = Math.floor(step2) + min;
    return result;
}
function getGuestsScores(guests){
    var guests_scores = []
    guests.forEach(guest => {if(guests_scores.indexOf(guest.score) === -1) guests_scores.push(guest.score)})
    guests_scores.sort(function(a, b) { return a - b; });
    guests_scores.reverse()
    return guests_scores
}
function getSeatsScores(seats){
    var seats_scores = []
    seats.forEach(seat => {if(seats_scores.indexOf(seat.score) === -1) seats_scores.push(seat.score)})
    seats_scores.sort(function(a, b) { return a - b; });
    seats_scores.reverse()
    return seats_scores
}
function getGuestWithScore(guests, score){
    var new_guests = []
    guests.forEach((guest, index) => {
        if(guest.score == score) new_guests.push(index)
    })
    return new_guests
}
function getSeatWithScore(seats, score){
    var new_seats = []
    seats.forEach((seat, index) => {
        if(seat.score == score) new_seats.push(index)
    })
    return new_seats
}
function getSeatWithTag(seats, tag){
    var new_seats = []
    seats.forEach((seat, index) => {
        if(seat.tags){
            seat.tags = seat.tags.map(tag=> Number(tag))
            if(seat.tags.indexOf(tag) > -1){
                seat.index = index
                new_seats.push(seat)
            }
        }
    })
    return new_seats
}
function getSeatWithTagAndScore(seats){
    var score = getSeatsScores(seats)[0]
    var new_seats = []
    seats.forEach((seat) => {
        if(seat.score == score) new_seats.push(seat.index)
    })
    return new_seats
}
function addAllMatchs(matching_list, project_id){
    return new Promise((resolve, reject) => {
        var query_string = ``
        matching_list.forEach(match => {
            var {guest, seat} = match
            query_string += `DELETE FROM belong WHERE guest='${guest}';`;
            query_string += `DELETE FROM belong WHERE seat='${seat}';`;
            query_string += `INSERT INTO belong(guest, seat, project) VALUES('${guest}', '${seat}', '${project_id}');`;
        })
        con.query(query_string, (err)=>{
            if(err) reject(err)
            else resolve('all_ok')
        })
    })
}

router.get('/scheduling/:project_name', async (req, res)=>{
    res.set('Access-Control-Allow-Origin', req.get('origin'))

    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    var project_id = await get_project_id(req.params.project_name)

    var seats = []
    var matching_list = []
    var maps = await getMaps(project_id)
    for(let map of maps){
        var seats_result = await getSeats(map.id)
        var groups_result = await getSeatsGroups(map.id)
        var tags_belongs = await getTagsBelongs(map.id)
        var map_seats = calculat_seats(seats_result, map, groups_result) 
        map_seats = calculat_tags(map_seats, tags_belongs)
        seats.push(...map_seats)
    }

    var guests_result = await getGuests(project_id)
    var guests_group = await getGuestsGroup(project_id)
    var requests = await getRequests(project_id)
    var guests = calculat_guests(guests_result, guests_group)
    guests = calculat_requests(guests, requests)

    var total_iterations = Math.min(seats.length, guests.length)
    var completed_iterations = 0
    var progress = 0
    while(seats.length != 0 && guests.length != 0){
        var guests_scores = getGuestsScores(guests)
        var height_guests = getGuestWithScore(guests, guests_scores[0])
        var random_for_guest = getRandomNumber(height_guests.length -1)
        var random_guest_index = height_guests[random_for_guest]
        var guest = guests[random_guest_index]
        var guest_id = guest.id

        var seats_scores = getSeatsScores(seats)
        var height_seats = getSeatWithScore(seats, seats_scores[0])

        if(guest.requests){
            var seats_with_tags = getSeatWithTag(seats, guest.requests[0])
            if(getSeatWithTagAndScore(seats_with_tags).length > 0) height_seats = getSeatWithTagAndScore(seats_with_tags)
        }

        var random_for_seat = getRandomNumber(height_seats.length -1)
        var random_seat_index = height_seats[random_for_seat]
        var seat = seats[random_seat_index]
        var seat_id = seat.id

        matching_list.push({guest: guest_id, seat: seat_id})
        guests.splice(random_guest_index, 1)
        seats.splice(random_seat_index, 1)

        completed_iterations++
        progress = (completed_iterations / total_iterations) * 100
        progress = Math.round(progress)
        res.write(`data: { "progress": ${progress} }\n\n`);

        await addAllMatchs([{guest: guest_id, seat: seat_id}], project_id)
    }
})

router.get('/seats_score/:project_name/:map_name', async (req, res)=>{
    var project_id = await get_project_id(req.params.project_name)
    var {map_name} = req.params
    var seats = []
    var map = await getMap(project_id, map_name)
    var seats_result = await getSeats(map.id)
    var groups_result = await getSeatsGroups(map.id)
    var tags_belongs = await getTagsBelongs(map.id)
    var map_seats = calculat_seats(seats_result, map, groups_result) 
    map_seats = calculat_tags(map_seats, tags_belongs)
    seats.push(...map_seats)
    // var maps = await getMaps(project_id)
    // for(let map of maps){
    //     var seats_result = await getSeats(map.id)
    //     var groups_result = await getSeatsGroups(map.id)
    //     var tags_belongs = await getTagsBelongs(map.id)
    //     var map_seats = calculat_seats(seats_result, map, groups_result) 
    //     map_seats = calculat_tags(map_seats, tags_belongs)
    //     seats.push(...map_seats)
    // }
    // var guests_result = await getGuests(project_id)
    // var guests_group = await getGuestsGroup(project_id)
    // var requests = await getRequests(project_id)
    // var guests = calculat_guests(guests_result, guests_group)
    // guests = calculat_requests(guests, requests)
    res.json(seats)
})

module.exports = router
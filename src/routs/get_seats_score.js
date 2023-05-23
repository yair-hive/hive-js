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
function getMap(project_name, map_name){
    return new Promise(async (resolve, reject) => {
        var project_id = await get_project_id(project_name)
        var query_string = `SELECT * FROM maps WHERE project = '${project_id}' AND map_name = '${map_name}';`;
        con.query(query_string, (err, result)=>{
            if(err) reject(err)
            else resolve(result[0])
        })       
    })
}

async function getSeatsScoreByMap(project_name, map_name){
    var map = await getMap(project_name, map_name)
    var seats_result = await getSeats(map.id)
    var groups_result = await getSeatsGroups(map.id)
    var map_seats = calculat_seats(seats_result, map, groups_result) 
    return map_seats
}

module.exports = {getSeatsScoreByMap}
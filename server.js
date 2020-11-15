const express = require('express')
const http = require('http')
const path = require('path')
const socketIO = require('socket.io')

const app = express()
var server = http.Server(app)
var io = socketIO(server)

const PORT = process.env.PORT || 3000

var games = {}

app.set('port', PORT)

app.use('/static', express.static(__dirname + '/static'))


app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname + '/homepage.html'))
})

app.get('/create', (request, response) => {
    var gameid = Math.floor(Math.random()*90000) + 10000
    var user = request.query.user
    response.redirect(`/app?user=${user}&id=${gameid}`)
})

app.get('/join', (request, response) => {
    response.sendFile(path.join(__dirname + '/join.html'))
})

app.get('/app', (request, response) => {
    response.sendFile(path.join(__dirname + '/index.html'))
})

server.listen(PORT, () => {
    console.log(PORT)
})


var type = [1,2]

function check_win(id, square) {
    var game = games[id][square]
    if (game[0] == game[1] && game[1] == game[2] && game[0] != 0) {return true}
    else if (game[3] == game[4] && game[4] == game[5] && game[3] != 0) {return true}
    else if (game[6] == game[7] && game[7] == game[8] && game[6] != 0) {return true}
    else if (game[0] == game[3] && game[3] == game[6] && game[0] != 0) {return true}
    else if (game[1] == game[4] && game[4] == game[7] && game[1] != 0) {return true}
    else if (game[2] == game[5] && game[5] == game[8] && game[2] != 0) {return true}
    else if (game[0] == game[4] && game[4] == game[8] && game[0] != 0) {return true}
    else if (game[2] == game[4] && game[4] == game[6] && game[2] != 0) {return true}
    else {return false}
}

function check_full_win(id) {
    var game = games[id].wins
    if (game[0] == game[1] && game[1] == game[2] && game[0] != 0) {return true}
    else if (game[3] == game[4] && game[4] == game[5] && game[3] != 0) {return true}
    else if (game[6] == game[7] && game[7] == game[8] && game[6] != 0) {return true}
    else if (game[0] == game[3] && game[3] == game[6] && game[0] != 0) {return true}
    else if (game[1] == game[4] && game[4] == game[7] && game[1] != 0) {return true}
    else if (game[2] == game[5] && game[5] == game[8] && game[2] != 0) {return true}
    else if (game[0] == game[4] && game[4] == game[8] && game[0] != 0) {return true}
    else if (game[2] == game[4] && game[4] == game[6] && game[2] != 0) {return true}
    else {return false}
}

io.on('connection', (socket) => {
    socket.on('gameinit', (data) => {
        socket.emit('gameinit', games[data])
    })
    socket.on('update_game', (data) => {
        if (games[data.gameID] != null && games[data.gameID].players[0] != null && games[data.gameID].players[1] != null) {
            games[data.gameID][data.square][parseInt(data.loc)] = data.value
            if (check_win(data.gameID, data.square)) {
                games[data.gameID].wins[parseInt(data.square)] = games[data.gameID].types[games[data.gameID].players.indexOf(data.user_name)]
            }   
            if (games[data.gameID].wins[parseInt(data.loc)] != 0) {
                games[data.gameID].all = true;
            } else {
                games[data.gameID].all = false;
            }
            if (check_full_win(data.gameID)) {
                io.to(data.gameID).emit('end', games[data.gameID].turn)
            } else {
                if (games[data.gameID].turn == 1) {
                    games[data.gameID].turn = 2
                } else {
                    games[data.gameID].turn = 1
                }
                games[data.gameID].pos = data.loc
                io.to(data.gameID).emit('game_update', games[data.gameID])
            }
        } else {
            socket.emit('missingPlayer')
        }
    })
    
    socket.on('join_game', (data) => {
        socket.join(data.gameid)
        if (games[data.gameid] == null) {
            var rand = Math.round(Math.random())
            games[data.gameid] = {players: [data.user, null],
                types: [type[rand], type[1-rand]],
                '0': [0,0,0,0,0,0,0,0,0],
                '1': [0,0,0,0,0,0,0,0,0],
                '2': [0,0,0,0,0,0,0,0,0],
                '3': [0,0,0,0,0,0,0,0,0],
                '4': [0,0,0,0,0,0,0,0,0],
                '5': [0,0,0,0,0,0,0,0,0],
                '6': [0,0,0,0,0,0,0,0,0],
                '7': [0,0,0,0,0,0,0,0,0],
                '8': [0,0,0,0,0,0,0,0,0],
                all: true,
                pos: '1',
                wins: [0, 0, 0, 0, 0, 0, 0, 0, 0]}
            games[data.gameid].turn = games[data.gameid].types.indexOf(1) + 1
        } else if (games[data.gameid].players[0] == data.user || games[data.gameid].players[1] == data.user) {
            console.log('sup')
            socket.emit('start')
        } else if (games[data.gameid].players[1] == null) {
            games[data.gameid].players[1] = data.user
            io.to(data.gameid).emit('start')
        } else {
            socket.emit('reject')
        }
    })
    socket.on('join', (data) => {
        if (games[data] != null && games[data].players[1] == null) {
            socket.emit('approved', 'approved')
        } else {
            socket.emit('approved', "false")
        }
    })

    socket.on('restart', (data) => {
        var rand = Math.round(Math.random())
        games[data.gameid] = {players: [data.user1, data.user2],
            types: [type[rand], type[1-rand]],
            '0': [0,0,0,0,0,0,0,0,0],
            '1': [0,0,0,0,0,0,0,0,0],
            '2': [0,0,0,0,0,0,0,0,0],
            '3': [0,0,0,0,0,0,0,0,0],
            '4': [0,0,0,0,0,0,0,0,0],
            '5': [0,0,0,0,0,0,0,0,0],
            '6': [0,0,0,0,0,0,0,0,0],
            '7': [0,0,0,0,0,0,0,0,0],
            '8': [0,0,0,0,0,0,0,0,0],
            all: true,
            pos: '1',
            wins: [0, 0, 0, 0, 0, 0, 0, 0, 0]}
        games[data.gameid].turn = games[data.gameid].types.indexOf(1) + 1
        io.to(data.gameid).emit('start')
    })

    socket.on('message', (data) => {
        console.log(data)
    })
    
    
})




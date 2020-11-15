
document.body.scrollTop = 0; // For Safari
document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
var board = {players: [null, null],
    types: [null, null],
    '0': [0,0,0,0,0,0,0,0,0],
    '1': [0,0,0,0,0,0,0,0,0],
    '2': [0,0,0,0,0,0,0,0,0],
    '3': [0,0,0,0,0,0,0,0,0],
    '4': [0,0,0,0,0,0,0,0,0],
    '5': [0,0,0,0,0,0,0,0,0],
    '6': [0,0,0,0,0,0,0,0,0],
    '7': [0,0,0,0,0,0,0,0,0],
    '8': [0,0,0,0,0,0,0,0,0],
    turn: 1,
    all: true,
    pos: '1',
    wins: [0, 0, 0, 0, 0, 0, 0, 0, 0]}

var socket = io.connect()

const url = new URL(document.URL)
var gameid = url.searchParams.get('id')
var user = url.searchParams.get('user')

$('#gameid').text(`Game ID: ${gameid}`)

socket.emit("join_game", {'user':user, 'gameid': gameid})
socket.on('start', () => {
    $('#wait').empty()
    $('#row1').empty()
    $('#row2').empty()
    $('#row3').empty()
    socket.emit('gameinit', gameid)
    socket.on('gameinit', (data) => {
        board = data;
        window.user1 = user;
        window.player = board.players.indexOf(user)
        window.user2 = board.players[1-player]
        window.player2 = board.players.indexOf(user2)
        $('#user1').html(`<p class = 'user'>${user1}</p>${small_types[board.types[player]]}`)
        $('#user2').html(`<p class = 'user'>${user2}</p>${small_types[board.types[player2]]}`)
        if (board.turn == player+1) {
            $(`#turn1`).html(`<p style = 'font-size: 25px' class = 'user'>Your turn!</p>`)
        } else {
            $('#turn2').html(`<p style = 'font-size: 25px' class = 'user'>Their turn!</p>`)
        }
    })
    
    draw_board()
    for (i of Array(9).keys()) {
        if (document.getElementById(i)) {
            document.getElementById(i).style.border = '1px white solid'
        }
    }
})
socket.on('game_update', (data) => {
    board = data
    draw_board()
    $('#turn1').empty()
    $('#turn2').empty()
    if (board.turn == player+1) {
        $(`#turn1`).html(`<p style = 'font-size: 25px' class = 'user'>Your turn!</p>`)
    } else {
        $('#turn2').html(`<p style = 'font-size: 25px' class = 'user'>Their turn!</p>`)
    }
    if (!board.all) {
        var i
        for (i of Array(9).keys()) {
            if (document.getElementById(i)) {
                document.getElementById(i).style.border = 'none'
            }
        }
        document.getElementById(parseInt(board.pos)).style.border = '1px white solid'
    } else {
        for (i of Array(9).keys()) {
            if (document.getElementById(i)) {
                document.getElementById(i).style.border = '1px white solid'
            }
        }
    }
})

socket.on('end', (data) => {
    $('#user1').empty()
    $('#user2').empty()
    $('#turn1').empty()
    $('#turn2').empty()
    $('#wrapper').html(`<h1 class = 'wait-text'>Game Over</h1><br>
    <h1 class = 'wait-text'>${board.players[data-1]} wins!</h1><br>`)
})

var small_types = ["<p></p>", `<img class = 'small-icon'  src = '/static/x-mark-128.png'>`, `<img  class=  'small-icon' src = '/static/o.png'>`]
var types = ["<p></p>", `<img class = 'icon'  src = '/static/x-mark-128.png'>`, `<img  class=  'icon' src = '/static/o.png'>`]
var big_types = ["<p></p>", `<img class = 'big-icon'  src = '/static/x-mark-128.png'>`, `<img  class=  'big-icon' src = '/static/o.png'>`]

function draw_board() {
    var i;
    var square = (id) => { 
        return `<div class = "small-board" id = '${id}' name = 'square${id}'>
                    <div class = "square-row">
                        <div class = 'top-right box' onclick = 'turn(this)' name = '0'>${types[board[id][0]]}</div>
                        <div class = 'top-mid box' onclick = 'turn(this)' name = '1'>${types[board[id][1]]}</div>
                        <div class = 'top-left box' onclick = 'turn(this)' name = '2'>${types[board[id][2]]}</div>
                    </div>
                    <div class = "square-row">
                        <div class = 'mid-right box' onclick = 'turn(this)' name = '3'>${types[board[id][3]]}</div>
                        <div class = 'mid-mid box' onclick = 'turn(this)' name = '4'>${types[board[id][4]]}</div>
                        <div class = 'mid-left box' onclick = 'turn(this)' name = '5'>${types[board[id][5]]}</div>
                    </div>
                    <div class = "square-row">
                        <div class = 'bottom-right box' onclick = 'turn(this)' name = '6'>${types[board[id][6]]}</div>
                        <div class = 'bottom-mid box' onclick = 'turn(this)' name = '7'>${types[board[id][7]]}</div>
                        <div class = 'bottom-left box' onclick = 'turn(this)' name = '8'>${types[board[id][8]]}</div>
                </div>
                </div>` }
    
    $('#row1').empty()
    $('#row2').empty()
    $('#row3').empty()
    for (i of ['0','1','2']) {
        if (board.wins[parseInt(i)] != '0') {
            $(`#row1`).append(big_types[board.wins[parseInt(i)]])
        } else {
            $('#row1').append(square(i))
        }
    }
    for (i of ['3','4','5']) {
        if (board.wins[parseInt(i)] != '0') {
            $(`#row2`).append(big_types[board.wins[parseInt(i)]])
        } else {
            $('#row2').append(square(i))
        }
    }
    for (i of ['6','7','8']) {
        if (board.wins[parseInt(i)] != '0') {
            $(`#row3`).append(big_types[board.wins[parseInt(i)]])
        } else {
            $('#row3').append(square(i))
        }
    }
}

function turn(element) {
    console.log('click')
    if (player+1 == board.turn && (board.all || board.pos == element.parentElement.parentElement.id) && board[element.parentElement.parentElement.id][parseInt(element.getAttribute('name'))] == 0) {
        socket.emit('update_game', {gameID: gameid, square: element.parentElement.parentElement.id, loc: element.getAttribute('name'), value: board.types[player], user_name: user1})
    }
}

socket.on('reject', () => {
    alert('Game is full')
    $('#board').html = "<h1>Game does not exist</h1>"
})


function restart() {
    socket.emit('restart', {'gameid': gameid, 'user1' : user1, 'user2' : user2})
}
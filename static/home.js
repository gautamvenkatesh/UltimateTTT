
var socket = io.connect()
socket.on('message', (data) => {
    console.log(data)
})


$("#user").on("change keyup paste", function(){
    var elem = $('#user')
    $('#create').attr('href', `https://ultitictactoe.herokuapp.com/create?user=${elem.val()}`)
    $('#join').attr('href', `https://ultitictactoe.herokuapp.com/join?user=${elem.val()}`)
})
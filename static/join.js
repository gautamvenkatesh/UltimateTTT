var socket = io.connect()

function join() {
    var url = new URL(document.URL)
    var gameid = document.getElementById('gameid').value 
    var user = url.searchParams.get('user')
    socket.emit('join', gameid)
    socket.on('approved', (data) => {
        if (data == 'approved') {
            window.location.href = `/app?user=${user}&id=${gameid}`
        } else {
            alert('That game does not exist')
        }
    })
}
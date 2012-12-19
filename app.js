var fs = require('fs')
    , http = require('http')
    , socketio = require('socket.io')
    , mime = require('mime')
    , url = require('url');

var players = {};
 
var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-type': 'text/html'});
    var uri = url.parse(req.url);
    // console.log("URL: "+ uri);
    var file = './index.html';
    if (uri.path != '/') {
        file = '.' + uri.path;
    }
    fs.readFile(file, function(err, result){
        if (err) {
            console.error(err);
            res.writeHead(404, {'content-type': 'text/html'});
            res.end('404: file not found<br><a href="/">back</a>');
            return false;
        }

        var type = mime.lookup(file)
        console.log("", file, " [", type, "]");

        res.writeHead(200, { 'Content-Type': type });
        res.write(result);
        res.end();
    });
    
}).listen(8080);
 
socketio.listen(1050).on('connection', function (socket) {
	
    

    socket.on('message', function (msg) {
        console.log('Message Received: ', msg);
        console.log("total Players:" , players.length)
        socket.broadcast.emit('message', msg);
    });

    socket.on('players_init', function(player, anim_data){
    	tmp = JSON.parse(player);
    	tmp.key = socket.id;
        var currentPlayer = {player:tmp,anim:anim_data};
    	players[tmp.key] = currentPlayer;

    	socket.emit('player_init', tmp , anim_data);
    	socket.broadcast.emit("user_join", tmp , anim_data);
        console.log("----------> players: " , players);
        console.log("----------> players: " , players.length);
        socket.emit('load_players', players);
    });

    socket.on('player_move', function(x, y, key, dir){
        console.log("PLAYER KEY: ", players[key]);
        console.log("params KEY: ", key);
        players[key].player.x = x;
        players[key].player.y = y;
        players[key].player.dir = dir;
            
                    
    	socket.broadcast.emit("players_update", key, x, y, dir);
    });

    socket.on('disconnect', function(){
        // or here
        delete players[socket.id];
        socket.broadcast.emit("user_disconnect", socket.id);
    });
});
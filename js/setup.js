
const auth = firebase.auth();
const db = firebase.database();
const Games = db.ref().child("Games");

const template = {
    RedPlayer:-1,
    BluePlayer:-1,
    winner:-1,
    tiles:[
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
    ],
    turn:-1,
}

function join() {
    var id = auth.currentUser.uid;
    var plr = db.ref().child("Players").child(id);
    plr.once("value", function(snap) {
        if(!snap.val()) {
            Games.once("value", function(snap) {
                var val = snap.val();
                for(var i in val) {
                    var cur = val[i];
                    if(typeof cur == "object") {
                        if(!(cur.BluePlayer!==-1 && cur.RedPlayer!==-1)) {
                            if(cur.BluePlayer == -1) {
                                Games.child(i).child("BluePlayer").set(id);
                            } else {
                                Games.child(i).child("RedPlayer").set(id);
                            }
                            Games.child(i).child("turn").set(Math.round(Math.random()));
                            plr.set(i);
                            return true;
                        }
                    }
                }
                var gid = uid();
                var game = template
                var color = Math.random()*100;
                if(color > 50) {
                    game.RedPlayer = id;
                } else {
                    game.BluePlayer = id;
                }
                Games.child(gid).set(game);
                plr.set(gid);
                template.RedPlayer = -1;
                template.BluePlayer = -1;
            });
        }
    });
}

function leave() {
    var id = auth.currentUser.uid;
    var plr = db.ref().child("Players").child(id);
    plr.once("value", function(snap) {
        if(snap.val()) {
            var g = Games.child(snap.val());
            g.once("value", function(snap) {
                if(typeof snap.val() == "object") {
                    if(snap.val().winner == -1) {
                        var team = -1;
                        if(snap.val().BluePlayer == id) {
                            team = 1;
                        } else if(snap.val().RedPlayer == id) {
                            team = 2;
                        }
                        g.child("winner").set(team);
                        g.child("turn").set(-1);
                    }
                    if(snap.val().BluePlayer == id) {
                        if(!snap.val().RedPlayer || snap.val().RedPlayer == -1) {
                            g.remove();
                        } else {
                            g.child("BluePlayer").remove();
                        }
                    } else if(snap.val().RedPlayer == id) {
                        if(!snap.val().BluePlayer || snap.val().BluePlayer == -1) {
                            g.remove();
                        } else {
                            g.child("RedPlayer").remove();
                        }
                    }
                }
            });
        }
    });
    plr.set(null);
    auth.currentUser.delete();
}
document.body.onunload = leave;

function winCheck(tiles) {
    var px = [-1, 0, 1,-1,1,-1, 0, 1];
    var py = [1, 1, 1,0,0,-1,-1,-1,];
    var rows = [];
    for(var x in tiles) {
        for(var y in tiles[x]) {
            var cur = tiles[x][y];
            if(cur > 0) {
                for(var i in px) {
                    var curRow = [];
                    var row = 1;
                    while(true) {
                        try {
                            var n = tiles[Number(x)+(px[i]*row)][Number(y)+(py[i]*row)];
                            if(n == cur) {
                                curRow.push({x:Number(x)+(px[i]*row),y:Number(y)+(py[i]*row)});
                                row++;
                            } else {
                                break;
                            }
                        } catch (e) {
                            break;
                        }
                    }
                    if(row >= 4) {
                        rows.push(curRow);
                    }
                }
            }
        }
    }
    return rows;
}

function place(x) {
    var id = auth.currentUser.uid;
    var plr = db.ref().child("Players").child(id);
    plr.once("value", function(snap) {
        if(snap.val()) {
            Games.child(snap.val()).once("value", function(s) {
                if(typeof s.val() == "object") {
                    var tiles = s.val().tiles;
                    var slot = tiles[x].indexOf(0);
                    var turn = s.val().turn;
                    var user;
                    if(turn == 0) {
                        user = s.val()["BluePlayer"];
                    } else if(turn == 1) {
                        user = s.val()["RedPlayer"];
                    }
                    if(slot > -1 && user === id) {
                        tiles[x][slot] = turn+1;
                        var win = winCheck(tiles);
                        if(win.length > 0) {
                            Games.child(snap.val()).child("tiles").child(x).child(slot).set(turn+1);
                            Games.child(snap.val()).child("turn").set(-1);
                            Games.child(snap.val()).child("winner").set(turn);
                            for(var i in win) {
                                for(var j in win[i]) {
                                    var cur = win[i][j];
                                    Games.child(snap.val()).child("tiles").child(cur.x).child(cur.y).set(-(turn+1));
                                }
                            }
                        } else {
                            Games.child(snap.val()).child("tiles").child(x).child(slot).set(turn+1);
                            var tTurn = "";
                            if(turn == "RedPlayer") {
                                tTurn = "BluePlayer";
                            } else if(turn == "BluePlayer") {
                                tTurn = "RedPlayer";
                            }
                            Games.child(snap.val()).child("turn").set((turn+1)%2);
                        }
                    }
                }
            })
        }
    })
}

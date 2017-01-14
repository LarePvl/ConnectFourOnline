
const view = document.getElementById("view");

auth.onAuthStateChanged(function(user) {
    if (user) {
        //console.log(user.uid);
        var plr = db.ref().child("Players").child(user.uid);
        plr.on("value",function(snap) {
            if(snap.val()) {
                Games.child(snap.val()).on("value",function(s) {
                    if(s.val()) {
                        ReactDOM.render(<Game data={s.val()}/>,view);
                    } else {
                        plr.remove();
                    }
                });
            } else {
                ReactDOM.render(<Lobby />,view);
            }
        });
    } else {
        auth.signInAnonymously();
    }
})

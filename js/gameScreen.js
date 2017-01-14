
class Tile extends React.Component {
    render() {
        var color = this.props.color;
        var c = "";
        if(Math.abs(color) == 1) {
            c = "blue";
            if(color < 0) {
                c = "w"+c;
            }
        } else if(Math.abs(color) == 2) {
            c = "red";
            if(color < 0) {
                c = "w"+c;
            }
        }
        var x = this.props.x;
        return (
            <td className={"tile bg"} onClick={()=>{place(x);}}>
                {color != 0 ? <div className={"token " + c}> </div> : " "}
            </td>
        );
    }
}

class Game extends React.Component {
    render() {
        var otiles = this.props.data.tiles;
        var tiles = [];
        for(var x in otiles) {
            tiles[x] = [];
            for(var y in otiles[x]) {
                tiles[x][y] = otiles[y][x];
            }
        }
        var id = auth.currentUser.uid;
        var user = "";
        var c = "";
        if(this.props.data.BluePlayer === id) {
            user = "blue";
        } else if(this.props.data.RedPlayer == id) {
            user = "red";
        }
        var turn = "Waiting";
        if(this.props.data.turn == 0) {
            c = "blue";
            if(user == c) {
                turn = "Your turn";
            } else {
                turn = "Rivals turn";
            }
        } else if(this.props.data.turn == 1) {
            c = "red";
            if(user == c) {
                turn = "Your turn";
            } else {
                turn = "Rivals turn";
            }
        }

        if(this.props.data.winner == 0) {
            c = "blue";
            if(user == c) {
                turn = "You Win";
            } else {
                turn = "Rival Wins";
            }
        } else if(this.props.data.winner == 1) {
            c = "red";
            if(user == c) {
                turn = "You Win";
            } else {
                turn = "Rival Wins";
            }
        }

        return (
            <div className="full">
                <label id={Math.random()*100} key={Math.random()*100} className={c}>{turn}</label>
                <table>
                    <tbody>
                        {tiles.map((val,x) => {
                            return (
                                <tr key={x}>
                                {val.map((v,y) => {
                                    return (<Tile color={v} x={y} key={x,y}/>);
                                })}
                                </tr>
                            )
                        }).reverse()}
                    </tbody>
                </table>
                <button className="leave" onClick={leave}>Leave</button>
            </div>
        )
    }
}

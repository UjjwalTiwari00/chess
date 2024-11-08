// import 
const express=require('express');
const socket=require('socket.io')
const http=require("http")
const {Chess}=require("chess.js");
const path = require('path');


// create app instance
const app=express();
// initilise http server
const PORT=3000;
// Initialize HTTP server with Express
const server=http.createServer(app)
const io=socket(server);

//  Create Chess object instance (chess.js)

const chess=new Chess;

let player={};
let currentPlayer="w"

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
// //! yaha se connection establish hoga 
// io.on("connection",function(uniqueSocketAdmin){
//     console.log("connected");
//     //! yaha frontend se data to catch krnge matlab data server se ayega
//     uniqueSocketAdmin.on("message",function(){
//         //! fir yaha se frontend pe data bhejo 
//        io.emit("sabko hello ji",function(){
//         console.log("ye message backend ke liye");
        
//        })
//     })
// })

io.on("connection",function(uniquesocket){
    console.log("connected");

    if(!player.white){
        player.white=uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }
   else if(!player.black){
        player.black=uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnect",function(){
        if(uniquesocket.id===player.white){
            delete player.white;
        }
        else if(uniquesocket.id===player.black){
            delete player.black;
        }
    })
    // agar move ho koi bhi piece to fir check karo kya valid move hai ki nahi 

    uniquesocket.on("move",(move)=>{
        try{
            if(chess.turn()==='w' && uniquesocket.id!==player.white) return;
            if(chess.turn()==='b' && uniquesocket.id!==player.black) return;

            const result=chess.move(move);
            if(result){
                currentPlayer=chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen())
            }
            else{
                console.log("invalid move",move);
                uniquesocket.emit("invalid move",move);
            }
        }
        catch(err){
            console.log(err);
            uniquesocket.emit("invalid move",move);
        }
    })
    
})

app.get("/",(req,res)=>{
    res.render("index",{title:"chess game"});
})

server.listen(PORT,()=>{
    console.log("listeninng on port 3000");
})

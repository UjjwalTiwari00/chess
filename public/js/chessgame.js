const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

// drag and drop
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, squareIndex) => {
      
      //! ye jo code hai ye chessboard pe pattern banne ke liye use kiya hai
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowindex + squareIndex) % 2 == 0 ? "light" : "dark"
      );

      //   todo:: ye dataset kya hota hai
      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareIndex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );

        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareIndex };
            e.dataTransfer.setData("text/plain", "");
          }
        });
        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }
      squareElement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });
      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (draggedPiece){
          const targetSource = {
            row:parseInt(squareElement.dataset.row),
            col:parseInt(squareElement.dataset.col),
          };

          handleMove(sourceSquare,targetSource);
        }
      }); 
      boardElement.appendChild(squareElement);
    });
  });

  if(playerRole==='b'){
    boardElement.classList.add("flipped");
  }
  else{
    boardElement.classList.remove("flipped");
  }
};
const handleMove = (source,target) => {
  const move={
    from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
    to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
    promotion:'q'
  }
  socket.emit("move",move);
};

const getPieceUnicode = (piece) => {
  const unicodePieces={
    p:'♙',
    r:'♖',
    n:'♘',
    b:'♗',
    q:'♕',
    k:'♔',
    P:'♟',
    R:'♜',
    N:'♞',
    B:'♝',
    Q:'♛',
    K:'♚',
  };
  return unicodePieces[piece.type] || "";
};

socket.on("playerRole",function(role){
  playerRole=role;
  renderBoard()
})

socket.on("spectatorRole",function(){
  playerRole=null;
  renderBoard();
})

socket.on('boardState',function(fen){
  chess.load(fen);
  renderBoard();
})

socket.on('move',function(move){
  chess.load(move);
  renderBoard();
})

renderBoard();
// //! yaha se backend pe data bhejo
// socket.emit("message",function(unique){
// })
// //! yaha se backend se data catch kro
// socket.on("sabko hello ji",function(){
//     console.log("good morning ji");
// })

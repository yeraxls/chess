import { useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard"
import Engine from "./stockfish/engine";
import { Chess } from "chess.js";

const Game = () => {
    const levels = {
        "Easy 🤓": 2,
        "Medium 🧐": 8,
        "Hard 😵": 18,
    };
    const engine = useMemo(() => new Engine(), []);
    const game = useMemo(() => new Chess(), []);

    const [gamePosition, setGamePosition] = useState(game.fen());
    const [stockfishLevel, setStockfishLevel] = useState(2);

    function findBestMove() {
        engine.evaluatePosition(game.fen(), stockfishLevel);
        engine.onMessage(({ bestMove }) => {
            if (bestMove) {
                // In latest chess.js versions you can just write ```game.move(bestMove)```
                try{

                    game.move(bestMove)
                }catch{
                    console.log("error");
                    
                }
                // game.move({
                //     from: bestMove.substring(0, 2),
                //     to: bestMove.substring(2, 4),
                //     promotion: bestMove.substring(4, 5),
                // });

                setGamePosition(game.fen());
            }
        });
    }

    function onDrop(sourceSquare: string, targetSquare: string, piece: string) {
        try {

            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: piece[1].toLowerCase() ?? "q",
            });
            setGamePosition(game.fen());

            // illegal move
            if (move === null) return false;

            // exit if the game is over
            if (game.isGameOver() || game.isDraw()) return false;

            findBestMove();
        } catch {
            return false
        }

        return true;
    }

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "1rem",
                }}
            >
                {Object.entries(levels).map(([level, depth]) => (
                    <button
                        style={{
                            backgroundColor: depth === stockfishLevel ? "#B58863" : "#f0d9b5",
                        }}
                        onClick={() => setStockfishLevel(depth)}
                    >
                        {level}
                    </button>
                ))}
            </div>
            <div
                style={{
                    margin: '3rem auto',
                    maxWidth: '70vh',
                    width: '70vw'
                }}
            >
                <Chessboard
                    id="PlayVsStockfish"
                    position={gamePosition}
                    onPieceDrop={onDrop}
                />
            </div>
            <button
                onClick={() => {
                    game.reset();
                    setGamePosition(game.fen());
                }}
            >
                New game
            </button>
            <button
                onClick={() => {
                    game.undo();
                    game.undo();
                    setGamePosition(game.fen());
                }}
            >
                Undo
            </button>
        </div>
    );
}

export default Game

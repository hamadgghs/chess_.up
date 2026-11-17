
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

const pieces = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟'
};

export default function App() {
  const [game, setGame] = useState(() => new Chess());
  const [mode, setMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  const offline = mode === 'offline';
  const bot = mode === 'bot';

  const moves = selected
    ? game.moves({ square: selected, verbose: true })
    : [];

  const isGameOver = game.isGameOver();

  useEffect(() => {
    if (!bot || game.turn() !== 'b' || isGameOver) return;

    const timer = setTimeout(() => {
      const next = new Chess(game.fen());
      const legalMoves = next.moves();

      if (legalMoves.length) {
        const move = legalMoves[
          Math.floor(Math.random() * legalMoves.length)
        ];
        next.move(move);
        setGame(next);
        setSelected(null);
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [game, bot, isGameOver]);

  function playSquare(square) {
    if (isGameOver || (bot && game.turn() === 'b')) return;

    if (selected === square) {
      setSelected(null);
      return;
    }

    const next = new Chess(game.fen());

    if (selected) {
      const legal = next.moves({
        square: selected,
        verbose: true
      });

      if (legal.some(move => move.to === square)) {
        try {
          next.move({
            from: selected,
            to: square,
            promotion: 'q'
          });

          setGame(next);
          setSelected(null);
          setMessage('');
          return;
        } catch {
          setMessage('Invalid move');
        }
      }
    }

    const piece = next.get(square);

    if (piece && piece.color === next.turn()) {
      setSelected(square);
      setMessage('');
    } else {
      setSelected(null);
    }
  }

  function startGame(type) {
    setGame(new Chess());
    setSelected(null);
    setMessage('');
    setMode(type);
  }

  function resetGame() {
    setGame(new Chess());
    setSelected(null);
    setMessage('');
  }

  function getStatus() {
    if (game.isCheckmate()) {
      return `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
    }
    if (game.isDraw()) return 'Game drawn!';
    if (game.isCheck()) return 'Check!';
    return game.turn() === 'w' ? 'White to move' : 'Black to move';
  }

  const board = game.board();
  const blackView = offline && game.turn() === 'b';

  const squares = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const row = blackView ? 7 - r : r;
      const col = blackView ? 7 - c : c;

      const square = 'abcdefgh'[col] + (8 - row);
      const piece = board[row][col];
      const possible = moves.some(move => move.to === square);
      const isSelected = selected === square;

      squares.push(
        <button
          key={square}
          onClick={() => playSquare(square)}
          style={{
            aspectRatio: '1',
            border: isSelected
              ? '4px solid #e2b900'
              : '1px solid #00000015',
            background: (row + col) % 2 === 0
              ? '#f0d9b5'
              : '#b58863',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
            cursor: 'pointer',
            position: 'relative',
            fontSize: 'clamp(25px, 8vw, 53px)',
            color: piece?.color === 'w' ? '#fff' : '#171717',
            textShadow: piece?.color === 'w'
              ? '1px 2px 3px #222'
              : '1px 1px 2px #aaa'
          }}
        >
          {piece && pieces[piece.color + piece.type]}
          {possible && (
            <span style={{
              position: 'absolute',
              width: piece ? '85%' : '25%',
              height: piece ? '85%' : '25%',
              border: piece ? '5px solid #166534' : 'none',
              background: piece ? 'transparent' : '#16653499',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
          )}
        </button>
      );
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">♟ CHESS UP</div>
        <div className="profile">👤 Guest</div>
      </header>

      <main className="home">
        <div className="welcome">
          <h1>Play Chess. Level Up.</h1>
          <p>Your next move starts here.</p>
        </div>

        {!mode ? (
          <>
            <section className="menu">
              <button
                className="primary"
                onClick={() => startGame('bot')}
              >
                ♟ Play vs Bot
              </button>

              <button onClick={() => startGame('offline')}>
                👥 Offline 1v1
              </button>

              <button onClick={() => setMessage('Puzzles coming soon!')}>
                🧩 Puzzles
              </button>

              <button onClick={() => setMessage('Learn Chess coming soon!')}>
                📚 Learn Chess
              </button>

              <button onClick={() => setMessage('Online mode coming soon!')}>
                🌐 Play Online
              </button>
            </section>

            <section className="stats">
              <h2>Your Chess Journey</h2>
              <div className="stat-grid">
                <div className="stat">
                  <strong>1000</strong>
                  <span>Rating</span>
                </div>
                <div className="stat">
                  <strong>0</strong>
                  <span>Wins</span>
                </div>
                <div className="stat">
                  <strong>0</strong>
                  <span>Games</span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: 10 }}>
              {offline ? '👥 Offline 1v1' : '🤖 Play vs Bot'}
            </h2>

            <p style={{ marginBottom: 15, fontWeight: 'bold' }}>
              {getStatus()}
            </p>

            <div style={{
              width: '100%',
              maxWidth: 520,
              margin: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              border: '5px solid #d6a900',
              borderRadius: 5,
              overflow: 'hidden'
            }}>
              {squares}
            </div>

            {offline && (
              <p style={{ marginTop: 12, color: '#888' }}>
                The board turns automatically for each player.
              </p>
            )}

            {bot && (
              <p style={{ marginTop: 12, color: '#888' }}>
                You are White. The computer plays Black.
              </p>
            )}

            {message && <p>{message}</p>}

            <div style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 20
            }}>
              <button onClick={resetGame}>
                ↻ Restart
              </button>

              <button onClick={() => {
                const history = game.history();
                if (!history.length) return;

                const next = new Chess();
                history.slice(0, bot ? Math.max(0, history.length - 2) : history.length - 1)
                  .forEach(move => next.move(move));

                setGame(next);
                setSelected(null);
              }}>
                ↶ Back
              </button>

              <button onClick={() => {
                setMode(null);
                setSelected(null);
                setMessage('');
              }}>
                🏠 Home
              </button>
            </div>
          </section>
        )}
      </main>

      <footer>CHESS UP © 2026</footer>
    </div>
  );
}

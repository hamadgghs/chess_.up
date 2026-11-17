
import React from 'react';

export default function App() {
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

        <section className="menu">
          <button className="primary">
            ♟ Play Online
          </button>

          <button>
            🤖 Play vs Bot
          </button>

          <button>
            🧩 Puzzles
          </button>

          <button>
            📚 Learn Chess
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
      </main>

      <footer>CHESS UP © 2026</footer>
    </div>
  );
}

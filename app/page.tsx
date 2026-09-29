"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Player = "X" | "O";
type Cell = Player | null;
type Mode = "ai" | "pvp";

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Chance that the AI plays a perfect (minimax) move instead of a random one.
// The level goes up after every finished round in AI mode.
const LEVELS = [
  { name: "Beginner", smartChance: 0.1 },
  { name: "Easy", smartChance: 0.35 },
  { name: "Medium", smartChance: 0.6 },
  { name: "Hard", smartChance: 0.85 },
  { name: "Unbeatable", smartChance: 1 },
];
const MAX_LEVEL = LEVELS.length;

/* ------------------------------ game logic ------------------------------ */

function calculateWinner(cells: Cell[]): { winner: Player | null; line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a], line };
    }
  }
  return { winner: null, line: null };
}

// Minimax from the AI's (O) perspective.
function minimax(cells: Cell[], isAiTurn: boolean, depth: number): number {
  const { winner } = calculateWinner(cells);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (cells.every((c) => c !== null)) return 0;

  const scores: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (cells[i]) continue;
    cells[i] = isAiTurn ? "O" : "X";
    scores.push(minimax(cells, !isAiTurn, depth + 1));
    cells[i] = null;
  }
  return isAiTurn ? Math.max(...scores) : Math.min(...scores);
}

function bestMove(cells: Cell[]): number {
  const board = cells.slice();
  let bestScore = -Infinity;
  let moves: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = "O";
    const score = minimax(board, false, 1);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      moves = [i];
    } else if (score === bestScore) {
      moves.push(i);
    }
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

function randomMove(cells: Cell[]): number {
  const empty = cells.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
  return empty[Math.floor(Math.random() * empty.length)];
}

function chooseAiMove(cells: Cell[], level: number): number {
  return Math.random() < LEVELS[level - 1].smartChance ? bestMove(cells) : randomMove(cells);
}

// Board is drawn in a 300x300 viewBox, so each cell centre is easy to compute.
function winLinePath(line: number[]): string {
  const center = (i: number) => ({ x: (i % 3) * 100 + 50, y: Math.floor(i / 3) * 100 + 50 });
  const p1 = center(line[0]);
  const p2 = center(line[2]);
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const ux = (p2.x - p1.x) / len;
  const uy = (p2.y - p1.y) / len;
  const ext = 16;
  return `M${p1.x - ux * ext} ${p1.y - uy * ext} L${p2.x + ux * ext} ${p2.y + uy * ext}`;
}

function makeConfetti() {
  const colors = ["var(--x)", "var(--o)", "var(--gold)"];
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    dur: `${2.4 + Math.random() * 1.8}s`,
    delay: `${Math.random() * 0.6}s`,
    dx: `${Math.random() * 200 - 100}px`,
    rot: `${360 + Math.random() * 720}deg`,
    size: 7 + Math.random() * 7,
    color: colors[i % colors.length],
    round: i % 3 === 0,
  }));
}

/* --------------------------------- styles -------------------------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

.ttt {
  --bg: #0b1020; --card: rgba(20, 28, 52, .82); --ink: #f4f7ff; --muted: #9ba8c7; --line: rgba(151, 169, 211, .2);
  --x: #67e8f9; --o: #fb7185; --gold: #fbbf24;
  min-height: 100vh;
  font-family: 'DM Sans', system-ui, sans-serif;
  color: var(--ink);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(42rem 30rem at 12% 8%, rgba(103, 232, 249, .13), transparent 62%),
    radial-gradient(42rem 32rem at 90% 88%, rgba(251, 113, 133, .13), transparent 62%),
    linear-gradient(135deg, #080d1a 0%, #10172c 48%, #0b1020 100%);
}

.ttt-title { font-family: 'Bricolage Grotesque', 'DM Sans', system-ui, sans-serif; font-weight: 800; letter-spacing: -0.035em; }
.ttt-card {
  width: min(94vw, 26rem);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 2rem;
  padding: 1.5rem;
  box-shadow: 0 30px 70px -40px color-mix(in srgb, var(--x) 60%, transparent);
}

/* mode switch */
.ttt-seg { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 999px; background: color-mix(in srgb, var(--ink) 7%, transparent); }
.ttt-seg-pill { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: 999px; background: var(--card); box-shadow: 0 2px 8px -2px rgba(0,0,0,.25); transition: transform .35s cubic-bezier(.3,1.4,.5,1); }
.ttt-seg-pill[data-pos="1"] { transform: translateX(100%); }
.ttt-seg button { position: relative; z-index: 1; padding: .55rem 1rem; font-size: .875rem; font-weight: 600; color: var(--muted); border-radius: 999px; transition: color .2s; }
.ttt-seg button[aria-selected="true"] { color: var(--ink); }
.ttt-seg button:focus-visible, .ttt-btn:focus-visible { outline: 3px solid var(--x); outline-offset: 2px; }

/* level meter */
.ttt-level { border-radius: 1.25rem; padding: .8rem 1rem; background: color-mix(in srgb, var(--gold) 12%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 35%, transparent); }
.ttt-meter { display: flex; gap: 6px; margin-top: .6rem; }
.ttt-meter span { flex: 1; height: 8px; border-radius: 999px; background: color-mix(in srgb, var(--ink) 12%, transparent); transition: background .4s, transform .4s; }
.ttt-meter span.on { background: var(--gold); }
.ttt-meter span.now { animation: ttt-glow 1.6s ease-in-out infinite; }

/* score chips */
.ttt-chip { flex: 1; text-align: center; padding: .65rem .5rem; border-radius: 1.25rem; border: 2px solid transparent; background: color-mix(in srgb, var(--ink) 5%, transparent); transition: transform .25s, border-color .25s, background .25s, box-shadow .25s; }
.ttt-chip[data-active="true"] { border-color: var(--c); background: color-mix(in srgb, var(--c) 12%, transparent); transform: translateY(-3px); box-shadow: 0 12px 24px -16px var(--c); }
.ttt-chip.mid { flex: .8; }
.ttt-num { display: inline-block; font-family: 'Bricolage Grotesque', 'DM Sans', sans-serif; font-weight: 800; font-size: 1.9rem; line-height: 1.1; color: var(--c); animation: ttt-pop .4s cubic-bezier(.3,1.6,.5,1); }

/* board */
.ttt-board { position: relative; width: min(84vw, 21rem); aspect-ratio: 1; margin-inline: auto; }
.ttt-hash { stroke: var(--line); stroke-width: 6; stroke-linecap: round; fill: none; }
.ttt-cell { position: relative; display: flex; align-items: center; justify-content: center; border-radius: 1.25rem; background: transparent; cursor: pointer; transition: background .2s, transform .12s; }
.ttt-cell:not(:disabled):hover { background: color-mix(in srgb, var(--ink) 6%, transparent); }
.ttt-cell:not(:disabled):active { transform: scale(.94); }
.ttt-cell:disabled { cursor: default; }
.ttt-cell:focus-visible { outline: 3px solid var(--x); outline-offset: -4px; }
.ttt-cell.win { background: color-mix(in srgb, var(--gold) 22%, transparent); animation: ttt-win 1s ease-in-out .5s 2; }
.ttt-cell.dim { opacity: .45; transition: opacity .4s .3s; }

.ttt-mark { width: 60%; height: 60%; overflow: visible; fill: none; stroke: currentColor; stroke-width: 11; stroke-linecap: round; }
.ttt-mark.x { color: var(--x); }
.ttt-mark.o { color: var(--o); }
.ttt-mark path, .ttt-mark circle { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ttt-draw .32s ease-out forwards; }
.ttt-mark path + path { animation-delay: .16s; }
.ttt-mark circle { transform: rotate(-90deg); transform-box: fill-box; transform-origin: center; }
.ttt-mark.ttt-ghost { opacity: 0; transition: opacity .15s; pointer-events: none; }
.ttt-cell:not(:disabled):hover .ttt-ghost { opacity: .22; }
.ttt-mark.ttt-ghost path, .ttt-mark.ttt-ghost circle { animation: none; stroke-dasharray: none; stroke-dashoffset: 0; }

.ttt-winline { fill: none; stroke: var(--gold); stroke-width: 9; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: ttt-draw .45s ease-out .45s forwards; filter: drop-shadow(0 0 6px var(--gold)); }

/* status + buttons */
.ttt-status { min-height: 2rem; font-size: 1.15rem; font-weight: 600; text-align: center; }
.ttt-dots { display: inline-flex; gap: 4px; margin-left: .4rem; vertical-align: middle; }
.ttt-dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--o); animation: ttt-bounce .9s ease-in-out infinite; }
.ttt-dots i:nth-child(2) { animation-delay: .15s; }
.ttt-dots i:nth-child(3) { animation-delay: .3s; }

.ttt-btn { padding: .75rem 1.4rem; border-radius: 999px; font-weight: 600; font-size: .95rem; transition: transform .15s, background .2s, box-shadow .2s; }
.ttt-btn:hover { transform: translateY(-2px); }
.ttt-btn:active { transform: scale(.96); }
.ttt-btn.primary { background: var(--ink); color: var(--bg); }
.ttt-btn.primary.cta { animation: ttt-cta 1.5s ease-in-out infinite; }
.ttt-btn.ghost { border: 1.5px solid var(--line); color: var(--ink); }
.ttt-btn.ghost:hover { background: color-mix(in srgb, var(--ink) 6%, transparent); }

/* confetti */
.ttt-confetti { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 50; }
.ttt-confetti span { position: absolute; top: -6vh; animation: ttt-fall var(--dur) cubic-bezier(.3,.6,.6,1) var(--delay) forwards; }

.ttt-pop { animation: ttt-pop .45s cubic-bezier(.3,1.6,.5,1); }

@keyframes ttt-draw { to { stroke-dashoffset: 0; } }
@keyframes ttt-pop { 0% { transform: scale(.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes ttt-win { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
@keyframes ttt-glow { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--gold) 60%, transparent); } 50% { box-shadow: 0 0 0 5px transparent; } }
@keyframes ttt-bounce { 0%, 100% { transform: translateY(0); opacity: .5; } 50% { transform: translateY(-5px); opacity: 1; } }
@keyframes ttt-cta { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--x) 55%, transparent); } 50% { box-shadow: 0 0 0 9px transparent; } }
@keyframes ttt-fall { to { transform: translate3d(var(--dx), 110vh, 0) rotate(var(--rot)); opacity: .9; } }

@media (prefers-reduced-motion: reduce) {
  .ttt *, .ttt *::before, .ttt *::after { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  .ttt-confetti { display: none; }
}

/* ---------------------- refreshed arcade visual layer --------------------- */
.ttt-eyebrow {
  display: inline-flex;
  align-items: center;
  padding: .4rem .8rem;
  border: 1px solid rgba(103,232,249,.22);
  border-radius: 999px;
  color: var(--x);
  background: rgba(103,232,249,.055);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .2em;
}
.ttt-subtitle {
  margin: -.1rem 0 .3rem;
  color: var(--muted);
  font-size: .95rem;
  text-align: center;
  letter-spacing: .015em;
}
.ttt {
  min-height: 100vh;
  padding: clamp(1.5rem, 4vw, 3.5rem) 1rem;
  gap: 1.25rem;
}
.ttt::before, .ttt::after {
  content: "";
  position: fixed;
  width: 18rem;
  height: 18rem;
  border-radius: 50%;
  filter: blur(90px);
  opacity: .16;
  pointer-events: none;
  z-index: -1;
}
.ttt::before { background: var(--x); top: 18%; left: -10rem; }
.ttt::after { background: var(--o); bottom: 5%; right: -10rem; }
.ttt-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.8rem, 7vw, 4.6rem);
  line-height: .98;
  letter-spacing: -.07em;
  text-align: center;
  background: linear-gradient(100deg, #f8fbff 15%, var(--x) 55%, var(--o) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 8px 28px rgba(103,232,249,.12));
  margin: 0;
}
.ttt-card {
  width: min(94vw, 31rem);
  padding: clamp(1.1rem, 4vw, 2rem);
  gap: 1.25rem;
  border-radius: 2rem;
  background: linear-gradient(145deg, rgba(25, 35, 64, .92), rgba(13, 20, 39, .9));
  border: 1px solid rgba(180, 198, 239, .17);
  box-shadow: 0 30px 100px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06);
  backdrop-filter: blur(22px);
}
.ttt-seg {
  background: rgba(3, 8, 22, .56);
  border: 1px solid rgba(151,169,211,.13);
}
.ttt-seg-pill {
  background: linear-gradient(135deg, rgba(103,232,249,.2), rgba(103,232,249,.08));
  border: 1px solid rgba(103,232,249,.3);
  box-shadow: 0 0 22px rgba(103,232,249,.08), inset 0 1px 0 rgba(255,255,255,.07);
}
.ttt-seg button { color: var(--muted); }
.ttt-seg button[aria-selected="true"] { color: #f4f7ff; }
.ttt-level {
  background: linear-gradient(115deg, rgba(251,191,36,.1), rgba(251,191,36,.035));
  border: 1px solid rgba(251,191,36,.2);
  border-radius: 1.15rem;
}
.ttt-meter span { background: rgba(190,202,232,.12); }
.ttt-meter span.on { background: linear-gradient(90deg, #fbbf24, #fde68a); box-shadow: 0 0 12px rgba(251,191,36,.24); }
.ttt-chip {
  background: rgba(4, 10, 25, .44);
  border: 1px solid rgba(151,169,211,.13);
  border-radius: 1.2rem;
  padding: .8rem .45rem;
}
.ttt-chip[data-active="true"] {
  background: color-mix(in srgb, var(--c) 10%, rgba(4,10,25,.6));
  border-color: color-mix(in srgb, var(--c) 55%, transparent);
  box-shadow: 0 0 28px color-mix(in srgb, var(--c) 13%, transparent), inset 0 1px 0 rgba(255,255,255,.04);
  transform: translateY(-2px);
}
.ttt-num { font-size: 2.15rem; text-shadow: 0 0 22px color-mix(in srgb, var(--c) 22%, transparent); }
.ttt-board {
  width: min(82vw, 22rem);
  padding: .3rem;
  border-radius: 1.65rem;
  background: linear-gradient(145deg, rgba(103,232,249,.07), rgba(251,113,133,.06));
  box-shadow: 0 18px 45px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04);
}
.ttt-hash { stroke: rgba(164,184,226,.22); stroke-width: 4; }
.ttt-cell { border-radius: 1.1rem; }
.ttt-cell:not(:disabled):hover {
  background: rgba(255,255,255,.055);
  box-shadow: inset 0 0 0 1px rgba(103,232,249,.13);
}
.ttt-cell.win {
  background: rgba(251,191,36,.13);
  box-shadow: inset 0 0 0 1px rgba(251,191,36,.28), 0 0 25px rgba(251,191,36,.06);
}
.ttt-mark { filter: drop-shadow(0 0 12px currentColor); }
.ttt-mark.x { color: var(--x); }
.ttt-mark.o { color: var(--o); }
.ttt-winline { stroke-width: 8; }
.ttt-status {
  min-height: 1.8rem;
  margin: 0;
  font-size: 1.08rem;
  letter-spacing: -.015em;
}
.ttt-btn {
  padding: .82rem 1.25rem;
  border-radius: 1rem;
  font-size: .9rem;
  transition: transform .2s, box-shadow .2s, border-color .2s;
}
.ttt-btn.primary {
  color: #07111d;
  background: linear-gradient(105deg, var(--x), #a5f3fc);
  box-shadow: 0 8px 25px rgba(103,232,249,.15);
}
.ttt-btn.primary:hover { box-shadow: 0 12px 32px rgba(103,232,249,.24); }
.ttt-btn.ghost {
  background: rgba(255,255,255,.025);
  border-color: rgba(151,169,211,.23);
  color: #d8e1f7;
}
.ttt-btn.ghost:hover { background: rgba(255,255,255,.07); border-color: rgba(151,169,211,.4); }
.ttt-confetti span { box-shadow: 0 0 8px currentColor; }
@media (max-width: 420px) {
  .ttt-card { border-radius: 1.5rem; }
  .ttt-board { width: min(82vw, 19rem); }
  .ttt-status { font-size: 1rem; }
  .ttt-btn { flex: 1; padding-inline: .75rem; }
}
`;

/* ------------------------------- components ------------------------------ */

function Mark({ player, ghost = false }: { player: Player; ghost?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`ttt-mark ${player === "X" ? "x" : "o"} ${ghost ? "ttt-ghost" : ""}`}
      aria-hidden="true"
    >
      {player === "X" ? (
        <>
          <path pathLength={1} d="M24 24 L76 76" />
          <path pathLength={1} d="M76 24 L24 76" />
        </>
      ) : (
        <circle pathLength={1} cx="50" cy="50" r="28" />
      )}
    </svg>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("ai");
  const [cells, setCells] = useState<Cell[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [level, setLevel] = useState(1);
  const [leveledUp, setLeveledUp] = useState(false);
  const [round, setRound] = useState(0);

  const { winner, line: winningLine } = calculateWinner(cells);
  const isDraw = !winner && cells.every((cell) => cell !== null);
  const roundOver = !!winner || isDraw;
  const currentPlayer: Player = xIsNext ? "X" : "O";
  const isAiTurn = mode === "ai" && !xIsNext && !roundOver;

  const celebrate = !!winner && !(mode === "ai" && winner === "O");
  const confetti = useMemo(() => (celebrate ? makeConfetti() : []), [celebrate, round]); // eslint-disable-line react-hooks/exhaustive-deps

  function applyMove(index: number, player: Player) {
    const nextCells = cells.slice();
    nextCells[index] = player;
    setCells(nextCells);
    setXIsNext(player === "O");
    setLeveledUp(false);

    const result = calculateWinner(nextCells);
    if (result.winner) {
      setScores((s) => ({ ...s, [result.winner as Player]: s[result.winner as Player] + 1 }));
    } else if (nextCells.every((c) => c !== null)) {
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    }
  }

  function handleClick(index: number) {
    if (cells[index] || roundOver || isAiTurn) return;
    applyMove(index, currentPlayer);
  }

  // Keyboard: press 1-9 to play a cell.
  const clickRef = useRef(handleClick);
  clickRef.current = handleClick;
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key >= "1" && e.key <= "9") clickRef.current(Number(e.key) - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // AI plays as "O" after a short "thinking" delay.
  useEffect(() => {
    if (!isAiTurn) return;
    const timer = setTimeout(() => {
      const move = chooseAiMove(cells, level);
      if (move >= 0) applyMove(move, "O");
    }, 550);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiTurn, cells, level]);

  function handleNextRound() {
    // Difficulty goes up after every finished round in AI mode.
    if (mode === "ai" && roundOver && level < MAX_LEVEL) {
      setLevel(level + 1);
      setLeveledUp(true);
    }
    setCells(Array(9).fill(null));
    setXIsNext(true);
    setRound((r) => r + 1);
  }

  function resetAll(nextMode: Mode = mode) {
    setMode(nextMode);
    setCells(Array(9).fill(null));
    setXIsNext(true);
    setScores({ X: 0, O: 0, draws: 0 });
    setLevel(1);
    setLeveledUp(false);
    setRound((r) => r + 1);
  }

  let status: React.ReactNode;
  let statusColor = "var(--ink)";
  if (winner) {
    statusColor = winner === "X" ? "var(--x)" : "var(--o)";
    status =
      mode === "ai"
        ? winner === "X"
          ? "You win! 🎉"
          : "The AI took this one"
        : `Player ${winner} wins! 🎉`;
  } else if (isDraw) {
    statusColor = "var(--gold)";
    status = "Draw. Nobody wins this round";
  } else if (mode === "ai") {
    statusColor = xIsNext ? "var(--x)" : "var(--o)";
    status = xIsNext ? (
      "Your move"
    ) : (
      <>
        AI is thinking
        <span className="ttt-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </>
    );
  } else {
    statusColor = xIsNext ? "var(--x)" : "var(--o)";
    status = `Player ${currentPlayer}'s move`;
  }

  const nextLabel =
    mode === "ai" && roundOver ? (level < MAX_LEVEL ? "Next level" : "Play again") : "New round";

  return (
    <div className="ttt flex flex-col items-center justify-center gap-6 px-4 py-10">
      <style>{CSS}</style>

      {celebrate && (
        <div className="ttt-confetti" aria-hidden="true">
          {confetti.map((p) => (
            <span
              key={p.id}
              style={
                {
                  left: p.left,
                  width: p.size,
                  height: p.size * (p.round ? 1 : 1.6),
                  borderRadius: p.round ? "50%" : "2px",
                  background: p.color,
                  "--dur": p.dur,
                  "--delay": p.delay,
                  "--dx": p.dx,
                  "--rot": p.rot,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <header className="flex flex-col items-center gap-3">
        <span className="ttt-eyebrow">✦ THE MINI ARCADE ✦</span>
        <h1 className="ttt-title">Tic-Tac-Toe</h1>
        <p className="ttt-subtitle">A classic game. A fresh challenge.</p>
      </header>

      <main className="ttt-card flex flex-col gap-5">
        {/* Mode switch */}
        <div className="ttt-seg" role="tablist" aria-label="Game mode">
          <div className="ttt-seg-pill" data-pos={mode === "ai" ? 0 : 1} />
          <button role="tab" aria-selected={mode === "ai"} onClick={() => mode !== "ai" && resetAll("ai")}>
            Player vs AI
          </button>
          <button role="tab" aria-selected={mode === "pvp"} onClick={() => mode !== "pvp" && resetAll("pvp")}>
            2 Players
          </button>
        </div>

        {/* Difficulty */}
        {mode === "ai" && (
          <div className="ttt-level">
            <div className="flex items-baseline justify-between">
              <span key={level} className="ttt-title ttt-pop text-lg">
                Level {level} · {LEVELS[level - 1].name}
              </span>
              <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                {leveledUp ? "Level up! The AI got sharper" : level === MAX_LEVEL ? "Perfect play" : "Rises every round"}
              </span>
            </div>
            <div className="ttt-meter" aria-hidden="true">
              {LEVELS.map((_, i) => (
                <span key={i} className={`${i < level ? "on" : ""} ${i === level - 1 ? "now" : ""}`} />
              ))}
            </div>
          </div>
        )}

        {/* Scoreboard */}
        <div className="flex items-stretch gap-2">
          <div
            className="ttt-chip"
            data-active={winner ? winner === "X" : !roundOver && xIsNext}
            style={{ "--c": "var(--x)" } as React.CSSProperties}
          >
            <div className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
              {mode === "ai" ? "You (X)" : "Player X"}
            </div>
            <span key={scores.X} className="ttt-num">{scores.X}</span>
          </div>
          <div className="ttt-chip mid" style={{ "--c": "var(--gold)" } as React.CSSProperties} data-active={isDraw}>
            <div className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Draws</div>
            <span key={scores.draws} className="ttt-num">{scores.draws}</span>
          </div>
          <div
            className="ttt-chip"
            data-active={winner ? winner === "O" : !roundOver && !xIsNext}
            style={{ "--c": "var(--o)" } as React.CSSProperties}
          >
            <div className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
              {mode === "ai" ? "AI (O)" : "Player O"}
            </div>
            <span key={scores.O} className="ttt-num">{scores.O}</span>
          </div>
        </div>

        {/* Board */}
        <div className="ttt-board">
          <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true">
            <path className="ttt-hash" d="M100 14 L100 286 M200 14 L200 286 M14 100 L286 100 M14 200 L286 200" />
          </svg>

          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {cells.map((cell, index) => {
              const isWinningCell = !!winningLine?.includes(index);
              const disabled = !!cell || roundOver || isAiTurn;
              return (
                <button
                  key={`${round}-${index}`}
                  onClick={() => handleClick(index)}
                  disabled={disabled}
                  aria-label={`Cell ${index + 1}, ${cell ?? "empty"}`}
                  className={`ttt-cell ${isWinningCell ? "win" : ""} ${winner && !isWinningCell ? "dim" : ""}`}
                >
                  {cell ? <Mark player={cell} /> : !disabled ? <Mark player={currentPlayer} ghost /> : null}
                </button>
              );
            })}
          </div>

          {winningLine && (
            <svg
              key={`win-${round}`}
              viewBox="0 0 300 300"
              className="absolute inset-0 h-full w-full pointer-events-none"
              aria-hidden="true"
            >
              <path className="ttt-winline" pathLength={1} d={winLinePath(winningLine)} />
            </svg>
          )}
        </div>

        <p className="ttt-status" role="status" aria-live="polite" style={{ color: statusColor }}>
          {status}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button className={`ttt-btn primary ${roundOver ? "cta" : ""}`} onClick={handleNextRound}>
            {nextLabel}
          </button>
          <button className="ttt-btn ghost" onClick={() => resetAll()}>
            Reset scores
          </button>
        </div>
      </main>

      <p className="hidden text-sm sm:block" style={{ color: "var(--muted)" }}>
        Tip: press keys 1–9 to play a cell
      </p>
    </div>
  );
}
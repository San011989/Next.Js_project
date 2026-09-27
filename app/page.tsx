"use client";

import { useState } from "react";

type Player = "X" | "O";
type Cell = Player | null;

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

function calculateWinner(cells: Cell[]): { winner: Player | null; line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a], line };
    }
  }
  return { winner: null, line: null };
}

export default function Home() {
  const [cells, setCells] = useState<Cell[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const { winner, line: winningLine } = calculateWinner(cells);
  const isDraw = !winner && cells.every((cell) => cell !== null);
  const currentPlayer: Player = xIsNext ? "X" : "O";

  function handleClick(index: number) {
    if (cells[index] || winner) return;

    const nextCells = cells.slice();
    nextCells[index] = currentPlayer;
    setCells(nextCells);
    setXIsNext(!xIsNext);

    const result = calculateWinner(nextCells);
    if (result.winner) {
      setScores((s) => ({ ...s, [result.winner as Player]: s[result.winner as Player] + 1 }));
    } else if (nextCells.every((c) => c !== null)) {
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    }
  }

  function handleReset() {
    setCells(Array(9).fill(null));
    setXIsNext(true);
  }

  function handleResetScores() {
    handleReset();
    setScores({ X: 0, O: 0, draws: 0 });
  }

  let status: string;
  if (winner) {
    status = `Player ${winner} wins!`;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = `Player ${currentPlayer}'s turn`;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Tic-Tac-Toe
        </h1>
        <p
          className={`mt-2 text-lg font-medium ${
            winner
              ? "text-emerald-600 dark:text-emerald-400"
              : isDraw
              ? "text-amber-600 dark:text-amber-400"
              : "text-slate-600 dark:text-slate-300"
          }`}
        >
          {status}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cells.map((cell, index) => {
          const isWinningCell = winningLine?.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!!cell || !!winner}
              className={`flex h-24 w-24 items-center justify-center rounded-2xl border-2 text-4xl font-bold shadow-sm transition-all
                ${
                  isWinningCell
                    ? "border-emerald-400 bg-emerald-100 dark:bg-emerald-900/40"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                }
                ${!cell && !winner ? "cursor-pointer" : "cursor-default"}
                ${cell === "X" ? "text-sky-600 dark:text-sky-400" : "text-rose-500 dark:text-rose-400"}
              `}
            >
              {cell}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-slate-400">X wins</span>
          <span className="text-xl font-semibold text-sky-600 dark:text-sky-400">{scores.X}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-slate-400">Draws</span>
          <span className="text-xl font-semibold text-slate-500 dark:text-slate-400">{scores.draws}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-slate-400">O wins</span>
          <span className="text-xl font-semibold text-rose-500 dark:text-rose-400">{scores.O}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          New round
        </button>
        <button
          onClick={handleResetScores}
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reset scores
        </button>
      </div>
    </div>
  );
}
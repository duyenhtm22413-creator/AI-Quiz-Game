import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GameState, Player, Question } from "./src/types.js";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Game state storage (in-memory for this example)
  const games = new Map<string, GameState>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("createGame", (questions: Question[]) => {
      const gameId = nanoid(6).toUpperCase();
      const gameState: GameState = {
        id: gameId,
        status: "waiting",
        questions,
        currentQuestionIndex: 0,
        players: [],
        timer: 0,
      };
      games.set(gameId, gameState);
      socket.join(gameId);
      socket.emit("gameUpdate", gameState);
      console.log("Game created:", gameId);
    });

    socket.on("joinGame", (gameId: string, playerName: string) => {
      const game = games.get(gameId);
      if (!game) {
        socket.emit("error", "Game not found");
        return;
      }

      const player: Player = {
        id: socket.id,
        name: playerName,
        score: 0,
        lastAnswerCorrect: null,
        hasAnswered: false,
      };

      game.players.push(player);
      socket.join(gameId);
      io.to(gameId).emit("gameUpdate", game);
      console.log(`Player ${playerName} joined game ${gameId}`);
    });

    socket.on("startGame", (gameId: string) => {
      const game = games.get(gameId);
      if (game) {
        game.status = "playing";
        game.currentQuestionIndex = 0;
        io.to(gameId).emit("gameUpdate", game);
        startTimer(gameId);
      }
    });

    socket.on("submitAnswer", (gameId: string, answerIndex: number) => {
      const game = games.get(gameId);
      if (!game || game.status !== "playing") return;

      const player = game.players.find((p) => p.id === socket.id);
      if (player && !player.hasAnswered) {
        const question = game.questions[game.currentQuestionIndex];
        player.hasAnswered = true;
        player.lastAnswerCorrect = answerIndex === question.correctAnswer;
        if (player.lastAnswerCorrect) {
          // Score based on time remaining (simple version)
          player.score += 100 + game.timer * 10;
        }

        // Check if all players answered
        if (game.players.every((p) => p.hasAnswered)) {
          showQuestionResults(gameId);
        } else {
          io.to(gameId).emit("gameUpdate", game);
        }
      }
    });

    socket.on("nextQuestion", (gameId: string) => {
      const game = games.get(gameId);
      if (!game) return;

      if (game.currentQuestionIndex < game.questions.length - 1) {
        game.currentQuestionIndex++;
        game.status = "playing";
        game.players.forEach((p) => {
          p.hasAnswered = false;
          p.lastAnswerCorrect = null;
        });
        io.to(gameId).emit("gameUpdate", game);
        startTimer(gameId);
      } else {
        game.status = "finished";
        io.to(gameId).emit("gameUpdate", game);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Handle player removal if needed
    });
  });

  function startTimer(gameId: string) {
    const game = games.get(gameId);
    if (!game) return;

    game.timer = 20; // 20 seconds per question
    const interval = setInterval(() => {
      const g = games.get(gameId);
      if (!g || g.status !== "playing") {
        clearInterval(interval);
        return;
      }

      g.timer--;
      if (g.timer <= 0) {
        clearInterval(interval);
        showQuestionResults(gameId);
      } else {
        io.to(gameId).emit("gameUpdate", g);
      }
    }, 1000);
  }

  function showQuestionResults(gameId: string) {
    const game = games.get(gameId);
    if (game) {
      game.status = "results";
      io.to(gameId).emit("gameUpdate", game);
    }
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

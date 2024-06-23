import { useAuth } from "@/providers/AuthProvider"
import { Button } from "./ui/button"
import axios from "axios"
import { useEffect, useState } from "react"
import { useChat } from "@/providers/ChatProvider"

const Game = ({ game }) => {
  return (
    <div className="w-[24rem] ml-auto p-4 border border-neutral-800 rounded-2xl space-y-4">
      {game.status === "waiting" && <GameWait game={game} />}
      {game.status === "over" && <GameOver game={game} />}
      {game.status === "running" && <GameRunning game={game} />}
    </div>
  )
}

export default Game

const GameWait = ({ game }) => {
  const { authUser } = useAuth()
  const otherPlayerName = game.players.find((player) => player._id !== authUser?._id).name

  function handlePlay() {
    axios.post(`/game/${game._id}/start`)
  }

  return (
    <div className="py-8 text-xl text-center grid place-content-center gap-4">
      {game.from === authUser?._id ? (
        <>
          <p>Waiting for {otherPlayerName} to accept invitation...</p>
        </>
      ) : (
        <>
          <p>{otherPlayerName} wants to play TicTacToe with you</p>
          <Button onClick={handlePlay} size="sm">
            Play
          </Button>
        </>
      )}
    </div>
  )
}

const GameRunning = ({ game }) => {
  const { authUser } = useAuth()
  const { updateGameMessage } = useChat()

  const myTurn = game.players[game.turn]._id === authUser?._id

  // set game message
  useEffect(() => {
    let message
    if (game.win) {
      message = game.win.playerId === authUser?._id ? "You won" : "You lost"
    } else if (game.draw) {
      message = "It's a draw"
    } else {
      message = myTurn ? "It's your turn" : "Waiting for your turn"
    }

    if (game.message !== message) {
      updateGameMessage(game.chat, game._id, message)
    }
  }, [game, authUser, myTurn, updateGameMessage])

  return (
    <>
      <GameMessage message={game.message} />
      <GameBoard game={game} myTurn={myTurn} />
      <GameScore scores={game.scores} players={game.players} />
    </>
  )
}

const GameMessage = ({ message }) => {
  if (!message) return null

  return <div className="text-sm px-3 py-1.5 w-fit m-auto rounded-full border border-neutral-800">{message}</div>
}

interface GameBoardProps {
  myTurn: boolean
}

const GameBoard = ({ game, myTurn }: GameBoardProps) => {
  function handlePlay(index) {
    axios.post(`/game/${game._id}/play`, { index })
  }

  return (
    <div className="grid grid-cols-3 w-full overflow-hidden">
      {game.board.map((square, id) => (
        <button
          key={id}
          onClick={() => handlePlay(id)}
          className="grid place-content-center w-full aspect-square border border-neutral-800 disabled:cursor-not-allowed"
          disabled={!myTurn || square !== null}
        >
          {getMark(square)}
        </button>
      ))}
    </div>
  )
}

function getMark(value) {
  switch (value) {
    case 0:
      return "X"
    case 1:
      return "0"
    default:
      return ""
  }
}

const GameScore = ({ scores, players }) => {
  const { authUser } = useAuth()
  const otherPlayer = players.find((player) => player._id !== authUser?._id)

  if (!authUser) return null

  return (
    <table className="text-center w-full">
      <thead>
        <tr>
          <th>{otherPlayer.name}</th>
          <th>Draws</th>
          <th>You</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{scores[otherPlayer._id]}</td>
          <td>{scores.draws}</td>
          <td>{scores[authUser._id]}</td>
        </tr>
      </tbody>
    </table>
  )
}

const GameOver = ({ game }) => {
  const { authUser } = useAuth()
  const otherPlayerName = game.players.find((player) => player._id !== authUser?._id).name

  return (
    <div>
      <p>You and {otherPlayerName} played a game of TicTacToe</p>
      <GameScore />
    </div>
  )
}

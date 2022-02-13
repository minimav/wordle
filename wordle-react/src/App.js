

/**
 * Todo:
 * model for success/failure
 * emoji print
 */
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Keyboard from './components/Keyboard';
import Letter from './components/Letter';
import GameModal from './components/GameModal';
import InfoModal from './components/InfoModal';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useState, useEffect } from 'react';
import wordsFile from './words.txt';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { ImStatsDots } from 'react-icons/im';

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}

function App() {
  const NUM_GUESSES = 6
  const NUM_LETTERS = 5

  const [guesses, setGuesses] = useState(
    Object.fromEntries([...Array(NUM_GUESSES).keys()].map(i => [i, []]))
  );
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0)
  const [targetWord, setTargetWord] = useState("")
  const [validWords, setValidWords] = useState(new Set())
  const [finishedGame, setFinishedGame] = useState(false)
  const [gameHistory, setGameHistory] = useState({})
  const [winHistory, setWinHistory] = useState(Object.fromEntries([...Array(NUM_GUESSES).keys()].map(i => [i + 1, 0])))
  const [finishMessage, setFinishMessage] = useState("")
  const [showGameModal, setShowGameModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)

  // modal handlers
  const handleCloseGameModal = () => setShowGameModal(false)
  const handleShowGameModal = () => setShowGameModal(true)
  const handleCloseInfoModal = () => setShowInfoModal(false)
  const handleShowInfoModal = () => setShowInfoModal(true)

  useEffect(() => {
    // load up user's existing game history and stats
    if (localStorage.hasOwnProperty("gameHistory")) {
      setGameHistory(JSON.parse(localStorage.getItem("gameHistory")))
    }
    if (localStorage.hasOwnProperty("winHistory")) {
      setWinHistory(JSON.parse(localStorage.getItem("winHistory")))
    }

    // load the word list and choose a target
    fetch(wordsFile)
      .then(r => r.text())
      .then(text => {
        let validWordsArr = text.split("\n").map(w => w.toUpperCase())
        setTargetWord(randomChoice(validWordsArr))
        setValidWords(new Set(validWordsArr))
      })
  }, [])

  /** Create emoji grid for sharing. */
  const getEmojis = (emojis) => {
    return JSON.stringify(
      [...Array(currentGuessIndex).keys()].map(rowIndex => emojis[rowIndex].join('')).join("<br>")
    )
  }

  const onClickLetter = (letter) => {
    if (finishedGame) { return }
    if (guesses[currentGuessIndex].length < NUM_LETTERS) {
      setGuesses(
        { ...guesses, [currentGuessIndex]: [...guesses[currentGuessIndex], letter] }
      )
    }
  }

  const onDelete = () => {
    const currentGuess = guesses[currentGuessIndex]
    setGuesses(
      { ...guesses, [currentGuessIndex]: currentGuess.slice(0, currentGuess.length - 1) }
    )
  }

  const onEnter = () => {
    const currentGuess = guesses[currentGuessIndex]
    if (currentGuess.length !== NUM_LETTERS) {
      alert(currentGuess.join("") + " is not 5 letter long")
      return
    } else if (!validWords.has(currentGuess.join(""))) {
      alert(currentGuess.join("") + " is not in the word list!")
      return
    }

    const newGuessIndex = currentGuessIndex + 1
    setCurrentGuessIndex(newGuessIndex)
    setGuesses(
      { ...guesses, [newGuessIndex]: [] }
    )

    if (targetWord === currentGuess.join("")) {
      const updatedGameHistory = {
        ...gameHistory,
        numGames: (gameHistory.numGames || 0) + 1,
        numWins: (gameHistory.numWins || 0) + 1,
        streak: (gameHistory.streak || 0) + 1,
      }
      const updatedWinHistory = { ...winHistory, [newGuessIndex]: (winHistory[newGuessIndex] || 0) + 1 }
      localStorage.setItem("gameHistory", JSON.stringify(updatedGameHistory))
      localStorage.setItem("winHistory", JSON.stringify(updatedWinHistory))
      setGameHistory(updatedGameHistory)
      setWinHistory(updatedWinHistory)
      setFinishedGame(true)

      const ending = newGuessIndex === 1 ? " guess!" : " guesses!"
      setFinishMessage("You guessed the word in " + newGuessIndex + ending)
      handleShowGameModal()
    } else if (newGuessIndex >= NUM_GUESSES) {
      const updatedGameHistory = {
        ...gameHistory,
        numGames: (gameHistory.numGames || 0) + 1,
        streak: 0
      }
      localStorage.setItem("gameHistory", JSON.stringify(updatedGameHistory))
      setGameHistory(updatedGameHistory)
      setFinishedGame(true)
      setFinishMessage("You lost! The word was " + targetWord + ".")
      handleShowGameModal()
    }
  }

  const CORRECT = { name: "correct", emoji: "🟩" }
  const IN_WORD = { name: "in-word", emoji: "🟨" }
  const INCORRECT = { name: "incorrect", emoji: "⬛" }

  // see https://codegolf.stackexchange.com/questions/241723/highlight-a-wordle-guess for some test cases
  const getGuessLetterStatus = (guess, letter, index, inWordFlaggedAlready) => {
    if (targetWord[index] === letter) {
      return CORRECT
    } else if (!targetWord.includes(letter)) {
      return INCORRECT
    }

    // the letter is in the word but not in this place, we need to check if the
    // letter was in the word in the correct place(s) as well
    const numOccurrencesTarget = targetWord.split(letter).length - 1
    const numThisLetterCorrect = guess.filter((otherLetter, otherIndex) => letter === otherLetter && targetWord[otherIndex] === otherLetter).length

    if (numOccurrencesTarget === numThisLetterCorrect) return INCORRECT
    else {
      // we'll only highlight as many occurrences of this letter as are not correct yet
      if (numOccurrencesTarget - numThisLetterCorrect > inWordFlaggedAlready) {
        return { ...IN_WORD, inWordFlaggedAlready: inWordFlaggedAlready + 1 }
      } else {
        return { ...INCORRECT, inWordFlaggedAlready: inWordFlaggedAlready }
      }
    }
  }

  let grid = []
  let emojis = Object.fromEntries([...Array(NUM_GUESSES).keys()].map(i => [i, []]))
  for (let rowIndex = 0; rowIndex < NUM_GUESSES; rowIndex++) {
    const guess = guesses[rowIndex]
    const inWordFlaggedAlready = Object.fromEntries(guess.map(letter => [letter, 0]))

    // add letters which have been guessed on this row
    guess.forEach((letter, columnIndex) => {
      const status = rowIndex >= currentGuessIndex
        ? { name: "unused", emoji: "" }
        : getGuessLetterStatus(guess, letter, columnIndex, inWordFlaggedAlready[letter])
      inWordFlaggedAlready[letter] = status.inWordFlaggedAlready || 0

      const props = {
        letter: letter,
        status: status.name,
        column: columnIndex + 1,
        row: rowIndex + 1
      }
      grid.push(
        <Letter {...props} key={props.column + "," + props.row} />
      )
      emojis[rowIndex].push(status.emoji)
    })

    // add yet to be guessed for this row - don't care about emojis here as game isn't finished
    for (let column = guess.length + 1; column <= NUM_LETTERS; column++) {
      const props = {
        letter: "",
        status: "unused",
        column: column,
        row: rowIndex + 1
      }
      grid.push(
        <Letter {...props} key={props.column + "," + props.row} />
      )
    }
  }

  return (
    <div className="App">
      <h2>
        <span>Wordle </span>
        <Button variant="light" onClick={handleShowGameModal}>
          <ImStatsDots size={28} />
        </Button>
        <Button variant="light" onClick={handleShowInfoModal}>
          <AiOutlineInfoCircle size={28} />
        </Button>
      </h2>

      <Container className="word-grid">
        {grid}
      </Container>

      <GameModal
        message={finishMessage}
        gameHistory={gameHistory}
        winHistory={winHistory}
        emojis={emojis !== undefined ? getEmojis(emojis) : ""}
        show={showGameModal}
        handleClose={handleCloseGameModal} />

      <InfoModal
        show={showInfoModal}
        handleClose={handleCloseInfoModal} />

      <Container className="keyboard-ctn">
        <Keyboard
          targetWord={targetWord}
          guesses={guesses}
          currentGuessIndex={currentGuessIndex}
          onClickLetter={onClickLetter}
          onDelete={onDelete}
          onEnter={onEnter} />
      </Container>
    </div >
  );
}

export default App;

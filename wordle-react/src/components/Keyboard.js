import './Keyboard.css';
import Button from 'react-bootstrap/Button'

function Keyboard({ targetWord, guesses, currentGuessIndex, onClickLetter, onEnter, onDelete }) {

  const keysByRow = ["Q W E R T Y U I O P", "A S D F G H J K L", "✓ Z X C V B N M ␡"]

  const guessedLetters = new Set();
  Object.entries(guesses || {}).filter(([index, _]) => index < currentGuessIndex)
    .forEach(([_, guess]) => guess.forEach(letter => guessedLetters.add(letter)))

  const keyboardRows = keysByRow.map((row, rowIndex) => {
    const keyboardRow = row.split(" ").map((letter, columnIndex) => {
      const style = {
        'gridColumnStart': columnIndex + 1,
        'gridColumnEnd': columnIndex + 2,
        'gridRowStart': 0,
        'gridRowEnd': 0
      }

      let onClick, variant;
      if (letter === '✓') {
        onClick = onEnter
        variant = "success"
      } else if (letter === '␡') {
        onClick = onDelete
        variant = "danger"
      } else {
        onClick = () => onClickLetter(letter)
        if (!targetWord.includes(letter) && guessedLetters.has(letter)) {
          variant = "dark"
        } else {
          variant = "secondary"
        }
      }

      return (
        <Button variant={variant} style={style} key={columnIndex + "," + rowIndex} onClick={onClick}>
          {letter}
        </Button>
      )
    })

    return (
      <div className="keyboard-row" key={rowIndex}>
        {keyboardRow}
      </div>
    )
  })

  return (
    <div className="Keyboard">
      {keyboardRows}
    </div>
  );
}

export default Keyboard;

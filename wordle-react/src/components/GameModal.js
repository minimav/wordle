import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import './GameModal.css';

function GameModal({
    message,
    gameHistory,
    winHistory,
    emojis,
    show,
    handleClose
}) {
    const statsMode = !message
    const wonGame = !statsMode && message.includes("guessed")

    let title
    if (statsMode) {
        title = "Stats"
    } else if (wonGame) {
        title = "Success"
    } else {
        title = "Fail"
    }

    const gameHistoryDiv = (
        <div>
            {message ? <p>{message}</p> : ""}

            {gameHistory.numGames !== undefined
                ? <p>You've won {gameHistory.numWins}/{gameHistory.numGames} games{wonGame || statsMode ? " (winning streak of " + gameHistory.streak + ")." : "."}</p>
                : <p>You haven't played any games yet :/</p>
            }

        </div>
    )

    let emojiDiv
    if (!statsMode) {
        // better way to remove the speech marks?
        const emojisForDisplay = emojis.slice(1, emojis.length - 1)
        const copyEmojis = () => navigator.clipboard.writeText(emojisForDisplay.replaceAll("<br>", "\n"));
        emojiDiv = (
            <div>
                <pre className="emojis" dangerouslySetInnerHTML={{ __html: emojisForDisplay }}></pre>
                <Button variant="secondary" size="sm" onClick={copyEmojis}>
                    Copy me
                </Button>
            </div>
        )
    } else {
        emojiDiv = ""
    }

    const winGuessDistribution = gameHistory.wonGames > 0 || wonGame
        ? (
            <div>
                <p>Win guess distribution:</p>
                <ol>
                    {Object.entries(winHistory).map(([numGuesses, numGames]) => {
                        return <li key={numGuesses}>{"#".repeat(numGames)}</li>
                    })}
                </ol>
            </div>
        )
        : ""

    const clearStats = () => {
        window.localStorage.clear();
        window.location.reload();
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {gameHistoryDiv}
                {emojiDiv}
                {winGuessDistribution}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={clearStats}>
                    Clear stats
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default GameModal;
import argparse
from enum import Enum
import random
import string
import typing as tp


class LetterStatus(Enum):
    NOT_IN_WORD = "\U00002B1B"
    IN_WORD = "\U0001F7E8"
    CORRECT = "\U0001F7E9"


ALL_LETTERS = string.ascii_lowercase
with open("words.txt") as f:
    ALL_WORDS = set(word.rstrip("\n") for word in f.readlines())


class WordleGame:
    """Play a game of Wordle."""

    def __init__(self, num_guesses: int = 6, target_word: str = None):
        self.num_guesses = num_guesses
        self.target_word: str
        if target_word is None or len(target_word) != 5 or target_word not in ALL_WORDS:
            self.target_word: str = random.choice(tuple(ALL_WORDS))
        else:
            self.target_word = target_word
        self.guesses: tp.List[str] = []
        self.emojis_per_guess: tp.List[str] = []

    def check_letter(
        self, guess, index, num_already_flagged
    ) -> tp.Dict[str, tp.Union[LetterStatus, int]]:
        """Check a single letter at a particular index."""
        letter = guess[index]
        if self.target_word[index] == letter:
            return {"status": LetterStatus.CORRECT}
        elif letter not in self.target_word:
            return {"status": LetterStatus.NOT_IN_WORD}

        num_this_letter_in_target = sum(
            1 for target_letter in self.target_word if letter == target_letter
        )
        num_this_letter_correct = sum(
            1
            for guess_index, guess_letter in enumerate(guess)
            if letter == guess_letter and self.target_word[guess_index] == guess_letter
        )

        if num_this_letter_in_target == num_this_letter_correct:
            return {"status": LetterStatus.NOT_IN_WORD}
        elif num_this_letter_in_target - num_this_letter_correct > num_already_flagged:
            return {"status": LetterStatus.IN_WORD, "flagged": 1}
        else:
            return {"status": LetterStatus.NOT_IN_WORD, "flagged": 0}

    def check_guess(self, guess) -> tp.List[LetterStatus]:
        """Check each letter in a valid guess."""
        self.guesses.append(guess)
        checks = []
        # want to keep track of highlighted letters in case of multiple occurrences in the
        # guess, e.g. 'zooms' guessed for target word 'hello', only one 'o' should be highlighted
        num_already_flagged = {letter: 0 for letter in guess}
        for index, letter in enumerate(guess):
            check = self.check_letter(guess, index, num_already_flagged[letter])
            num_already_flagged[letter] += check.get("flagged", 0)
            checks.append(check["status"])
        return checks

    def print_status(self) -> None:
        """Show guessed letter statuses and unused letters."""
        guessed_letters = set.union(*[set(guess) for guess in self.guesses])
        unused = [letter for letter in ALL_LETTERS if letter not in guessed_letters]
        for guess, emojis_for_guess in zip(self.guesses, self.emojis_per_guess):
            print(" ".join(guess))
            print(emojis_for_guess)

        if unused:
            print(f"{''.join(unused)} have not been used in a guess yet")
        print()

    def play(self) -> None:
        """Play a game of Wordle."""
        won = False
        for round_index in range(self.num_guesses):
            guess = ""
            while True:
                guess = input(
                    f"Round {round_index + 1}, guess a 5-letter word: "
                ).lower()
                if len(guess) != 5:
                    print(f"{guess} is not 5 letters long")
                    continue
                elif guess not in ALL_WORDS:
                    print(f"{guess} is not in the word list")
                    continue
                break

            letter_statuses = self.check_guess(guess)
            emojis = "".join([status.value for status in letter_statuses])
            self.emojis_per_guess.append(emojis)
            if all(
                letter_status == LetterStatus.CORRECT
                for letter_status in letter_statuses
            ):
                won = True
                break
            else:
                print("Your guess was not correct, try again")

            self.print_status()

        if won:
            print(f"You won after {round_index + 1} words, congratulations!")
        else:
            print(f"Unlucky, the correct word was {self.target_word}")

        print("\n".join(self.emojis_per_guess))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Play a game of Wordle.")
    parser.add_argument(
        "--num_guesses",
        type=int,
        help="Number of guesses allowed to guess the target word",
        default=6,
    )
    parser.add_argument(
        "--target_word", type=str, default=None, help="Word to be guessed"
    )
    args = parser.parse_args()

    game = WordleGame(target_word=args.target_word, num_guesses=args.num_guesses)
    game.play()

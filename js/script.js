let gameOver = false;
let currentRow = 0;
const row = 6;
const column = 5
let answer;
const vineboom = new Audio("sounds/vine-boom.mp3");

const submitBtn = document.querySelector("#submit");

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)]
}

fetch("data/words.json")
    .then(response => response.json())
    .then(words => {
        answer = getRandomElement(words).toLowerCase();
    })

function getTile(row, col) {
    return document.getElementById(`tile-${row}-${col}`);
}

let currentStreak = parseInt(localStorage.getItem("currentStreak")) || 0;
let bestStreak = parseInt(localStorage.getItem("bestStreak")) || 0;

function updateStreaks() {
    document.getElementById("currentStreak").textContent = `${currentStreak}`;
    document.getElementById("bestStreak").textContent = `${bestStreak}`;
}

updateStreaks();

function compareWords(guess, answer) {
    const answerLetters = answer.split("");
    for (let i = 0; i < guess.length; i++) {
        const tile = getTile(currentRow, i)
        if (guess[i] === answer[i]) {
            tile.classList.add("correct");
            answerLetters[i] = null;
            setTimeout(() => {
                vineboom.play();
            }, 250)
        }
    }
    for (let i = 0; i < guess.length; i++) {
        const tile = getTile(currentRow, i);
        if (tile.classList.contains("correct")) {
            continue;
        }
        const index = answerLetters.indexOf(guess[i]);

        if (index !== -1) {
            tile.classList.add("present");
            answerLetters[index] = null;
        }
    }
    for (let i = 0; i < column; i++) {
        getTile(currentRow, i).disabled = true;
    }

    currentRow++;

    const header = document.querySelector("h2")

    if (guess === answer) {
        currentStreak++;
        if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
        }

        localStorage.setItem("currentStreak", currentStreak);
        localStorage.setItem("bestStreak", bestStreak);

        updateStreaks();

        header.textContent = "You guessed the word!"
        gameOver = true;

        document.querySelectorAll(".input").forEach(input => {
            input.disabled = true;

            submitBtn.textContent = "Play Again"
        });
    }
    else if (currentRow < row) {
        for (let x = 0; x < column; x++) {
            const nextTile = getTile(currentRow, x)
            nextTile.disabled = false;
        }
        getTile(currentRow, 0).focus();
    }
    else {
        currentStreak = 0;
        localStorage.setItem("currentStreak", currentStreak);
        updateStreaks();
        header.textContent = `The correct word was: ${answer.toUpperCase()}`;
        gameOver = true;
        submitBtn.textContent = "Play Again"
    }
};

for (let r = 0; r < row; r++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    for (let c = 0; c < column; c++) {
        const Input = document.createElement("input");
        Input.classList.add("input");
        Input.id = `tile-${r}-${c}`;
        Input.disabled = r !== 0;

        rowDiv.appendChild(Input);
    }
    document.querySelector(".answerContainer").appendChild(rowDiv);
}

document.querySelectorAll(".row").forEach((rowDiv) => {
    const inputs = rowDiv.querySelectorAll("input");

    inputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            const letters = input.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
            input.value = letters.slice(0, 1);

            if (letters.length >= 1 && inputs[index + 1]) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && inputs[index - 1]) {
                inputs[index - 1].focus();
            }
        });
    });
});

document.querySelector("#submit").addEventListener("click", () => {
    if (gameOver) {
        location.reload();
        return;
    };

    let guess = "";

    for (let y = 0; y < column; y++) {
        guess += getTile(currentRow, y).value;
    }
    guess = guess.toLowerCase();

    if (guess.length < column) return;

    const result = compareWords(guess, answer);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        submitBtn.click();
    }
});
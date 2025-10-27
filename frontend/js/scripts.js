window.addEventListener('load', function () {
    // Delay for loading the container on the homepage only
    setTimeout(function () {
        const container = document.getElementById('container');
        if (container) {
            container.classList.add('container-visible'); // Container wird sichtbar
        }
    }, 1000); // 1000ms = 1s

});

//snake game

//board
var blockSize = 25;
var rows = 18;
var columns = 18;
var board;
var context;

//snake head

var snakeX = blockSize * 5;
var snakeY = blockSize * 5;

var velocityX = 0;
var velocityY = 0;

var snakeBody = [];

//food
var foodX
var foodY

var gameOver = false;

window.onload = function () {
    // makes sure an exeption is not thrown because board is null on the other pages
    if (window.location.href.includes("about")) {
        board = document.getElementById("board");
        board.height = rows * blockSize; //one block is one square, so we need 20 squares in height and length
        board.width = columns * blockSize;
        context = board.getContext("2d") //Used for drawing on the board

        placeFood();
        document.addEventListener("keyup", changeDirection)
        //update(); it is needed to call update several times a second to refresg the canvas
        setInterval(update, 1000 / 10); // 100 milliseconds

    }

    //this clears the textboxes on the Contact Us page
    if (window.location.href.includes("contact")) {
        document.getElementById("textbox1").value = "";
        document.getElementById("textbox2").value = "";
        document.getElementById("textbox3").value = "";

    }
    if (window.location.href.includes("logIn")) {
        document.getElementById("textbox1").value = "";
        document.getElementById("textbox2").value = "";
    }
}

function update() {
    if (gameOver) {
        return;
    }

    // reload the canvas every 100ms because the color doesnt work otherwise
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);

    context.fillStyle = "red";
    context.fillRect(foodX, foodY, blockSize, blockSize); // Draw food

    // Check if snake eats the food
    if (snakeX == foodX && snakeY == foodY) {
        snakeBody.push([foodX, foodY]); // Add a segment to the body
        placeFood();
    }

    // Move the snake's body
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1]; // Shift each segment of the body
    }
    // new head at the beginning
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    // Move the snake's head
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;

    // Draw snake's head
    context.fillStyle = "lime";
    context.fillRect(snakeX, snakeY, blockSize, blockSize);

    // Draw the body
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    //game over conditions

    // collision with walls
    if (snakeX < 0 || snakeX >= columns * blockSize || snakeY < 0 || snakeY >= rows * blockSize) {
        gameOver = true;
        alert("Game Over");
    }

    // collision with itself
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            gameOver = true;
            alert("Game Over");
        }
    }
}

// trigger for movement are the arrow keys
function changeDirection(e) {

    e.preventDefault(); //prevets scrolling with the arrow keys

    if (e.code == "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    }
    else if (e.code == "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    }
    else if (e.code == "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
    else if (e.code == "ArrowLeft" && velocityX != -1) {
        velocityX = -1;
        velocityY = 0;
    }

}
//place good at random position
function placeFood() {

    foodX = Math.floor(Math.random() * columns) * blockSize;
    foodY = Math.floor(Math.random() * columns) * blockSize;
}

//function for sending message

function sendMessage() {

    //check if required fields are not empty
    if (document.getElementById("textbox1").value == "" ||
        document.getElementById("textbox3").value == "") {
        document.getElementById("textbox1").style.borderColor = "red";
        document.getElementById("textbox2").style.borderColor = "red";
        document.getElementById("textbox3").style.borderColor = "red";

        //error message
        document.getElementById("errorMessage").style.display = "block";

    }
    else {

        //hide textboxes
        document.getElementById("textbox1").style.display = "none";
        document.getElementById("textbox2").style.display = "none";
        document.getElementById("textbox3").style.display = "none";
        document.querySelector("button").style.display = "none";

        //blend in thank you message

        document.getElementById("thankYouMessage").style.display = "block";
        document.getElementById("errorMessage").style.display = "none"
    }

}

//loggin into account

function logIn() {
    if (document.getElementById("textbox1").value == "" ||
        document.getElementById("textbox2").value == "") {
        document.getElementById("textbox1").style.borderColor = "red";
        document.getElementById("textbox2").style.borderColor = "red";

        // show error message

        document.getElementById("errorMessage").style.display = "block";
    }
    if (document.getElementById("textbox1").value != "" &&
        document.getElementById("textbox2").value != "") {
        document.getElementById("textbox1").style.display = "none";
        document.getElementById("textbox2").style.display = "none";
        document.querySelector("button").style.display = "none";
        document.getElementById("logInMessage").style.display = "block";
        document.getElementById("errorMessage").style.display = "none"
    }
}



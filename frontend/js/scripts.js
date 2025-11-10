(() => {
    const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

    window.addEventListener('load', () => {
        // Delay the container reveal to allow background assets to load smoothly.
        window.setTimeout(() => {
            const container = document.getElementById('container');
            if (container) {
                container.classList.add('container-visible');
            }
        }, 1000);
    });

    const toggleInputError = (field, hasError) => {
        if (!field) {
            return;
        }
        field.classList.toggle('input-error', hasError);
    };

    const showElement = (element) => {
        if (!element) {
            return;
        }
        element.classList.remove('is-hidden');
    };

    const hideElement = (element) => {
        if (!element) {
            return;
        }
        element.classList.add('is-hidden');
    };

    const showMessage = (element) => {
        if (!element) {
            return;
        }
        element.classList.remove('is-hidden');
        element.classList.add('is-visible');
    };

    const hideMessage = (element) => {
        if (!element) {
            return;
        }
        element.classList.remove('is-visible');
        element.classList.add('is-hidden');
    };

    const Scoreboard = (() => {
        const storageKey = 'snakeScoreboard';
        const maxEntries = 10;

        let container;
        let listElement;
        let emptyStateElement;
        let formElement;
        let nameInput;
        let playAgainButton;
        let playAgainContainer;
        let scoreLabel;
        let pendingScore = null;
        let restartHandler = () => {};

        const init = () => {
            container = document.getElementById('scoreboardSection');
            if (!container) {
                return;
            }

            listElement = document.getElementById('scoreboardList');
            emptyStateElement = document.getElementById('scoreboardEmptyState');
            formElement = document.getElementById('scoreboardForm');
            nameInput = document.getElementById('scoreboardName');
            playAgainButton = document.getElementById('playAgainButton');
            playAgainContainer = playAgainButton ? playAgainButton.parentElement : null;
            scoreLabel = document.getElementById('currentScore');

            renderList(loadScores());

            if (scoreLabel) {
                scoreLabel.textContent = 'Current score: 0';
            }

            if (formElement) {
                hideElement(formElement);
                formElement.addEventListener('submit', handleSubmit);
            }

            if (nameInput) {
                nameInput.addEventListener('input', () => toggleInputError(nameInput, false));
            }

            if (playAgainButton) {
                hideElement(playAgainButton);
                if (playAgainContainer) {
                    hideElement(playAgainContainer);
                }
                playAgainButton.addEventListener('click', () => {
                    clearPrompt();
                    if (typeof restartHandler === 'function') {
                        restartHandler();
                    }
                });
            }
        };

        const handleSubmit = (event) => {
            event.preventDefault();

            if (!formElement) {
                return;
            }

            const name = (nameInput?.value ?? '').trim();
            if (!name) {
                toggleInputError(nameInput, true);
                return;
            }

            if (pendingScore === null) {
                return;
            }

            persistScore({
                name,
                score: pendingScore,
                timestamp: Date.now(),
            });

            renderList(loadScores());
            formElement.reset();
            clearPrompt();

            if (typeof restartHandler === 'function') {
                restartHandler();
            }
        };

        const clearPrompt = () => {
            pendingScore = null;

            if (formElement) {
                hideElement(formElement);
            }

            if (playAgainButton) {
                hideElement(playAgainButton);
            }

            if (playAgainContainer) {
                hideElement(playAgainContainer);
            }

            if (nameInput) {
                toggleInputError(nameInput, false);
            }
        };

        const handleGameOver = (score) => {
            if (!container) {
                return false;
            }

            pendingScore = score;

            if (scoreLabel) {
                scoreLabel.textContent = `Final score: ${score}`;
            }

            if (formElement) {
                showElement(formElement);
            }

            if (playAgainButton) {
                showElement(playAgainButton);
            }

            if (playAgainContainer) {
                showElement(playAgainContainer);
            }

            if (nameInput) {
                nameInput.value = '';
                toggleInputError(nameInput, false);
                window.requestAnimationFrame(() => nameInput.focus());
            }

            return true;
        };

        const updateCurrentScore = (score) => {
            if (scoreLabel) {
                scoreLabel.textContent = `Current score: ${score}`;
            }
        };

        const registerRestartHandler = (handler) => {
            restartHandler = handler;
        };

        const persistScore = (entry) => {
            const scores = loadScores();
            scores.push({
                name: entry.name,
                score: entry.score,
                timestamp: entry.timestamp,
            });
            scores.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.timestamp - b.timestamp;
            });
            saveScores(scores.slice(0, maxEntries));
        };

        const renderList = (scores) => {
            if (!listElement) {
                return;
            }

            listElement.innerHTML = '';

            if (!scores.length) {
                hideElement(listElement);
                if (emptyStateElement) {
                    emptyStateElement.classList.remove('is-hidden');
                }
                return;
            }

            showElement(listElement);
            if (emptyStateElement) {
                emptyStateElement.classList.add('is-hidden');
            }

            scores.forEach(({ name, score }) => {
                const item = document.createElement('li');
                item.textContent = `${name} — ${score}`;
                listElement.appendChild(item);
            });
        };

        const loadScores = () => {
            try {
                const raw = window.localStorage.getItem(storageKey);
                if (!raw) {
                    return [];
                }

                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed)) {
                    return [];
                }

                return parsed
                    .filter((entry) => entry && typeof entry.name === 'string' && typeof entry.score === 'number')
                    .map((entry) => ({
                        name: entry.name,
                        score: entry.score,
                        timestamp: typeof entry.timestamp === 'number' ? entry.timestamp : Date.now(),
                    }));
            } catch {
                return [];
            }
        };

        const saveScores = (scores) => {
            try {
                window.localStorage.setItem(storageKey, JSON.stringify(scores));
            } catch {
                // Ignore storage failures silently to keep the flow smooth.
            }
        };

        return {
            init,
            handleGameOver,
            registerRestartHandler,
            updateCurrentScore,
        };
    })();

    const SnakeGame = (() => {
        const config = {
            blockSize: 25,
            rows: 18,
            columns: 18,
            speed: 10,
        };

        let canvas;
        let context;
        let head;
        let velocity;
        let body;
        let food;
        let gameOver;
        let score;
        let updateTimer;

        const init = () => {
            canvas = document.getElementById('board');
            if (!canvas) {
                return;
            }

            context = canvas.getContext('2d');
            canvas.height = config.rows * config.blockSize;
            canvas.width = config.columns * config.blockSize;

            resetState();
            placeFood();
            update();
            document.addEventListener('keydown', handleInput, { passive: false });
            if (!updateTimer) {
                updateTimer = window.setInterval(update, 1000 / config.speed);
            }
            Scoreboard.registerRestartHandler(restart);
        };

        const resetState = () => {
            head = { x: config.blockSize * 5, y: config.blockSize * 5 };
            velocity = { x: 0, y: 0 };
            body = [];
            food = { x: 0, y: 0 };
            gameOver = false;
            score = 0;
            Scoreboard.updateCurrentScore(score);
        };

        const update = () => {
            if (gameOver) {
                return;
            }

            clearBoard();
            drawFood();
            handleFoodCollision();
            moveBody();
            moveHead();
            drawSnake();
            evaluateGameState();
        };

        const clearBoard = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#000000';
            context.fillRect(0, 0, canvas.width, canvas.height);
        };

        const drawFood = () => {
            context.fillStyle = '#ff0000';
            context.fillRect(food.x, food.y, config.blockSize, config.blockSize);
        };

        const handleFoodCollision = () => {
            if (head.x === food.x && head.y === food.y) {
                body.push([food.x, food.y]);
                score += 1;
                Scoreboard.updateCurrentScore(score);
                placeFood();
            }
        };

        const moveBody = () => {
            for (let index = body.length - 1; index > 0; index -= 1) {
                body[index] = [...body[index - 1]];
            }
            if (body.length) {
                body[0] = [head.x, head.y];
            }
        };

        const moveHead = () => {
            head.x += velocity.x * config.blockSize;
            head.y += velocity.y * config.blockSize;
        };

        const drawSnake = () => {
            context.fillStyle = '#00ff00';
            context.fillRect(head.x, head.y, config.blockSize, config.blockSize);
            context.fillStyle = '#00ff00';
            body.forEach(([x, y]) => {
                context.fillRect(x, y, config.blockSize, config.blockSize);
            });
        };

        const evaluateGameState = () => {
            if (isOutOfBounds(head) || isSelfCollision()) {
                gameOver = true;
                const handled = Scoreboard.handleGameOver(score);
                if (!handled) {
                    window.alert('Game Over');
                }
            }
        };

        const isOutOfBounds = ({ x, y }) => {
            return x < 0
                || x >= config.columns * config.blockSize
                || y < 0
                || y >= config.rows * config.blockSize;
        };

        const isSelfCollision = () => {
            return body.some(([x, y]) => x === head.x && y === head.y);
        };

        const handleInput = (event) => {
            if (!ARROW_KEYS.includes(event.code)) {
                return;
            }

            event.preventDefault();

            switch (event.code) {
                case 'ArrowUp':
                    if (velocity.y !== 1) {
                        velocity.x = 0;
                        velocity.y = -1;
                    }
                    break;
                case 'ArrowDown':
                    if (velocity.y !== -1) {
                        velocity.x = 0;
                        velocity.y = 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (velocity.x !== 1) {
                        velocity.x = -1;
                        velocity.y = 0;
                    }
                    break;
                case 'ArrowRight':
                    if (velocity.x !== -1) {
                        velocity.x = 1;
                        velocity.y = 0;
                    }
                    break;
                default:
                    break;
            }
        };

        const placeFood = () => {
            food.x = Math.floor(Math.random() * config.columns) * config.blockSize;
            food.y = Math.floor(Math.random() * config.rows) * config.blockSize;
        };

        const restart = () => {
            resetState();
            placeFood();
            update();
        };

        return { init };
    })();

    const ContactForm = (() => {
        let nameField;
        let orderField;
        let messageField;
        let submitButton;
        let thankYouMessage;
        let errorMessage;

        const init = () => {
            nameField = document.getElementById('textbox1');
            orderField = document.getElementById('textbox2');
            messageField = document.getElementById('textbox3');
            submitButton = document.getElementById('contactSubmit');
            thankYouMessage = document.getElementById('thankYouMessage');
            errorMessage = document.getElementById('errorMessage');

            if (!nameField || !messageField || !submitButton) {
                return;
            }

            resetForm();
            submitButton.addEventListener('click', handleSubmit);
            [nameField, orderField, messageField].forEach((field) => {
                if (!field) {
                    return;
                }
                field.addEventListener('input', () => handleInput(field));
            });
        };

        const resetForm = () => {
            [nameField, orderField, messageField].forEach((field) => {
                if (!field) {
                    return;
                }
                field.value = '';
                toggleInputError(field, false);
                showElement(field);
            });
            hideMessage(errorMessage);
            hideMessage(thankYouMessage);
            showElement(submitButton);
        };

        const handleInput = (field) => {
            toggleInputError(field, false);
            hideMessage(errorMessage);
        };

        const handleSubmit = () => {
            const hasName = Boolean(nameField.value.trim());
            const hasMessage = Boolean(messageField.value.trim());

            toggleInputError(nameField, !hasName);
            toggleInputError(messageField, !hasMessage);

            if (!hasName || !hasMessage) {
                showMessage(errorMessage);
                return;
            }

            [nameField, orderField, messageField].forEach(hideElement);
            hideElement(submitButton);
            showMessage(thankYouMessage);
            hideMessage(errorMessage);
        };

        return { init };
    })();

    const LoginForm = (() => {
        let emailField;
        let passwordField;
        let submitButton;
        let successMessage;
        let errorMessage;

        const init = () => {
            emailField = document.getElementById('textbox1');
            passwordField = document.getElementById('textbox2');
            submitButton = document.getElementById('loginSubmit');
            successMessage = document.getElementById('logInMessage');
            errorMessage = document.getElementById('errorMessage');

            if (!emailField || !passwordField || !submitButton) {
                return;
            }

            resetForm();
            submitButton.addEventListener('click', handleSubmit);
            [emailField, passwordField].forEach((field) => {
                field.addEventListener('input', () => handleInput(field));
            });
        };

        const resetForm = () => {
            [emailField, passwordField].forEach((field) => {
                field.value = '';
                toggleInputError(field, false);
                showElement(field);
            });
            hideMessage(successMessage);
            hideMessage(errorMessage);
            showElement(submitButton);
        };

        const handleInput = (field) => {
            toggleInputError(field, false);
            hideMessage(errorMessage);
        };

        const handleSubmit = () => {
            const hasEmail = Boolean(emailField.value.trim());
            const hasPassword = Boolean(passwordField.value.trim());

            toggleInputError(emailField, !hasEmail);
            toggleInputError(passwordField, !hasPassword);

            if (!hasEmail || !hasPassword) {
                showMessage(errorMessage);
                return;
            }

            [emailField, passwordField].forEach(hideElement);
            hideElement(submitButton);
            showMessage(successMessage);
            hideMessage(errorMessage);
        };

        return { init };
    })();

    document.addEventListener('DOMContentLoaded', () => {
        Scoreboard.init();
        SnakeGame.init();
        ContactForm.init();
        LoginForm.init();
    });
})();

// Global variables

let gameId = null; // Speichert die Spiel-ID global
let gameDirection = "clockwise";  // Spielrichtung - default im Uhrzeigersinn
let playerNames = [];  // Spielernamen
let globalResult = Object();  // Players: [Player{ Cards{}, Score}]
let playerIndexMap = {};   // Player : Index
let currentPlayer = null;   // Name des Spielers, der am Zug ist
let selectedCard = null;   // Karte, die gespielt werden soll
let submitting = false;  //To control error messages; tracks if a form submission attempt is being made

//Check if player names are unique
function checkUniqueNames() {
    const playerInputs = [
        document.getElementById('player1').value.trim(),
        document.getElementById('player2').value.trim(),
        document.getElementById('player3').value.trim(),
        document.getElementById('player4').value.trim()
    ];
    //Filter out empty fields
    const filledInputs = playerInputs.filter(name => name !== '');

    //Set stores only unique values -> automatically ignores/removes duplicates
    const uniqueNames = new Set(filledInputs);

    //If the number of unique names is less than the number of filled inputs, there are duplicates
    if (uniqueNames.size !== filledInputs.length) {
        document.getElementById('message').textContent = 'Alle Spielernamen müssen einzigartig sein.';
    }
    //Clear any previous error message
    else {
        document.getElementById('message').textContent = '';
    }
}

// Starten eines neuen Spiel mit Spielernamen & initialisiert globale Variablen
function submitPlayerNames() {
    // submitting = true; //Prevents multiple submissions & indicated that a form submission is being attempted

    // const player1 = document.getElementById('player1').value.trim();
    // const player2 = document.getElementById('player2').value.trim();
    // const player3 = document.getElementById('player3').value.trim();
    // const player4 = document.getElementById('player4').value.trim();

    // // Spieler-Namen in einem Array speichern
    // playerNames = [player1, player2, player3, player4];

    playerNames = ['Melissa', 'Ajla', 'Sophia', 'Anja']; //THIS IS HARD CODED FOR TESTING-REMOVE IT WHEN NOT NEEDED

    // //Prepares the form for new validation
    // document.getElementById('message').textContent = '';

    // //Check if there is any empty fields
    // if (playerNames.some(name => name === '')) {
    //   document.getElementById('message').textContent = 'Bitte gib für alle Spieler einen Namen ein.';
    //   submitting = false;  //Reset the flag because the form is not fully submitted
    //   return;
    // }

    // //Double check the uniqueness
    // const uniqueNames = new Set(players);

    // if (uniqueNames.size !== playerNames.length) {
    //   document.getElementById('message').textContent = 'Alle Spielernamen müssen einzigartig sein.';
    //   submitting = false;
    //   return;
    // }
    // else {
    //   document.getElementById('message').textContent = '';
    // }

    // // Modal schließen
    // const playerModal = bootstrap.Modal.getInstance(document.getElementById('playerModal'));
    // playerModal.hide();

    // Startet das Spiel mit den eingegebenen Spielernamen
    startGame();
    submitting = false; //Reset the flag because the form is fully submitted
}

// Reset the game and clear player inputs
// resetGame() is called when the "Neues Spiel" button is clicked
function resetGame() {
    //Clear each player input field
    document.getElementById('player1').value = '';
    document.getElementById('player2').value = '';
    document.getElementById('player3').value = '';
    document.getElementById('player4').value = '';

    document.getElementById('message').textContent = '';

    playerNames = [];
    submitting = false;
    gameId = null;
    globalResult = null;
    currentPlayer = null;
    selectedCard = null;

    document.getElementById('change-players-btn').style.display = 'block'; //Show the button to change players
}

// //Listener to check for all input changes in real time
// document.getElementById('playerForm').addEventListener('input', checkUniqueNames);

// //Listener for Enter key in the form
// document.getElementById('playerForm').addEventListener('keypress', function(event){
//   if(event.key === 'Enter'){
//     event.preventDefault(); //Prevent the form from submitting
//     submitPlayerNames(); //Manually handle the form submission with validations
//   }
// });


// Start new game: set gameId, card setup, currentPlayer
function startGame() {
    fetch('https://nowaunoweb.azurewebsites.net/api/Game/Start', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(playerNames)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(gameData => {
            if (!gameData || !gameData.Id || !gameData.Players || gameData.Players.length === 0) {
                throw new Error("Ungültige Datenstruktur");
            }

            gameId = gameData.Id;
            globalResult = gameData.Players;
            console.log(globalResult);
            currentPlayer = gameData.NextPlayer;  // name of player who starts
            console.log(currentPlayer);  // Check the value of currentPlayer
            console.log("Next Player: " + gameData.NextPlayer);  // DELETE AGAIN
            console.log("Current Player: " + currentPlayer);  // DELETE AGAIN

            // Initialize player index map
            // "Melissa": 0,
            //     "Ajla": 1,
            //     "Sophia": 2,
            //     "Anja": 3

            globalResult.forEach((player, index) => {
                playerIndexMap[player.Player] = index;
            });

            console.log(playerIndexMap);   // DELETE AGAIN

            document.getElementById('top-section').firstElementChild.innerHTML = '';
            document.getElementById('start-game').textContent = 'Start New Game';
            let gameinfo = document.getElementById('game-info');
            gameinfo.style.display = 'block';
            gameinfo.style.backgroundImage = `url('imgs/table.jpg')`;

            displayPlayersCards();
            displayTopCard();
            displayGameDirection();



        })
        .catch(error => console.error('Fehler beim Starten des Spiels:', error));
}


function getColorName(colorCode) {
    switch (colorCode) {
        case 'r': return 'Red';
        case 'b': return 'Blue';
        case 'y': return 'Yellow';
        case 'g': return 'Green';
        case 'black': return 'Black';
        default: return colorCode;  // fallback if color is unrecognized
    }
}

function getCardImagePath(color, text) {
    let colorCode;
    let textCode;

    if (text.toLowerCase() === 'changecolor') {
        //handle change color cards specifically
        colorCode = 'Black';
        textCode = '14';
    }
    else if (text.toLowerCase() === 'draw4') {
        //handle wild cards specifically
        colorCode = 'Black';
        textCode = '13';
        //for all other card types -> standard colors and numbers
    } else {
        colorCode = getColorName(color.charAt(0).toLowerCase());
        switch (text.toLowerCase()) {
            case 'zero': textCode = '0'; break;
            case 'one': textCode = '1'; break;
            case 'two': textCode = '2'; break;
            case 'three': textCode = '3'; break;
            case 'four': textCode = '4'; break;
            case 'five': textCode = '5'; break;
            case 'six': textCode = '6'; break;
            case 'seven': textCode = '7'; break;
            case 'eight': textCode = '8'; break;
            case 'nine': textCode = '9'; break;
            case 'draw2': textCode = '10'; break;
            case 'reverse': textCode = '12'; break;
            case 'skip': textCode = '11'; break;
            default:
                console.warn('Unknown Card:', text);
                textCode = text.toLowerCase(); //fallback for unknown card types
        }
    }
    return `imgs/Cards/${colorCode}${textCode}.png`;
}

// display each players cards
function displayPlayersCards() {

    const allPlayersContainer = document.getElementById('players-cards');
    allPlayersContainer.innerHTML = '';

    globalResult.forEach(player => {
        // create card section for every player
        const playerSection = document.createElement('div');
        playerSection.classList.add('player-section');
        playerSection.innerHTML = `<h4>${player.Player}</h4>`;

        const playerCardsList = document.createElement('div');
        playerCardsList.classList.add('player-cards-container');
        playerCardsList.id = `${player.Player}`;

        // show, activate & highlight current player cards
        if (player.Player === currentPlayer) {

            // highlight the background of current players deck
            playerCardsList.classList.add('active');

            player.Cards.forEach(card => {
                if (card.Color.toLowerCase() === 'black' && (card.Text.toLowerCase() === 'changecolor' || card.Text.toLowerCase() === 'wild')) {
                    return;
                }

                // create active card image
                const activeCardImg = document.createElement('img');
                activeCardImg.classList.add('active-card');  // card is active
                activeCardImg.addEventListener('click', playCard);  // card is clickable

                activeCardImg.src = getCardImagePath(card.Color, card.Text);
                activeCardImg.alt = `${card.Color} ${card.Text}`;

                //set unique ID for the card 
                const colorCode = card.Color.charAt(0).toLowerCase(); // 'r', 'b', 'y', 'g'
                const textCode = card.Text.toLowerCase();
                activeCardImg.id = `${colorCode}${textCode}`;

                playerCardsList.appendChild(activeCardImg);

            });
        }
        else {
            // hide cards of inactive player
            player.Cards.forEach(() => {
                //   for (let i = 0; i < player.Cards.length; i++) {
                const backCardImg = document.createElement('img');
                backCardImg.src = 'imgs/Cards/back0.png'; // Pfad zur Rückseite der UNO-Karte
                backCardImg.alt = 'Inactive Card';
                playerCardsList.appendChild(backCardImg);
                // remove 'active-card' class and click listener
                backCardImg.removeEventListener('click', playCard); // deactivate click
                backCardImg.className = 'inactive-card';  //change class name to 'inactive-card'
            });

            // de-highlight background for inactive player
            playerCardsList.classList.remove('active');
        }

        // append card list to all player sections
        playerSection.appendChild(playerCardsList);
        allPlayersContainer.appendChild(playerSection);
    });
}


// display game direction
function displayGameDirection() {
    let directionDiv = document.getElementById('game-direction');
    let directionImg = document.createElement('img');
    directionImg.src = "imgs/clockwise.png";
    directionImg.alt = `${gameDirection}`;
    directionImg.id = "game-direction-image";
    directionImg.className = "img-fluid";
    directionDiv.appendChild(directionImg);
}


// switch game direction and display it (flip image)
function changeDirection() {

    let directionImg = document.getElementById('game-direction-image');

    // if img is clockwise
    if (gameDirection === "clockwise") {
        // mirror img and change direction to counterclockwise
        directionImg.src = "imgs/counterclockwise.png";
        gameDirection = "counterclockwise";
        directionImg.alt = `${gameDirection}`;
        directionImg.classList.add("rotate-scale-up"); // rotate animation

        // if img is counterclockwise
    } else if (gameDirection === "counterclockwise") {
        // mirror img and change direction to clockwise
        directionImg.src = "imgs/clockwise.png";
        gameDirection = "clockwise";
        directionImg.alt = `${gameDirection}`;
        directionImg.classList.add("rotate-scale-up"); //rotate animation
    }

    // remove animation class after animation
    setTimeout(() => {
        directionImg.classList.remove("rotate-scale-up");
    }, 700);

}


// update variable currentPlayer
function nextPlayer() {

    let direction = (gameDirection === "counterclockwise") ? -1 : 1;  // clockwise = 1, counterclockwise = -1
    let currentPlayerIndex = playerIndexMap[currentPlayer]; // find index of active player in player array


    // update current player (considering direction)
    if (currentPlayerIndex !== undefined) {
        let nextIndex = (currentPlayerIndex + direction + globalResult.length) % globalResult.length;
        currentPlayer = globalResult[nextIndex].Player;
    } else {
        console.error("Player not found in playerIndexMap!");
    }
}


// play selected card
async function playCard(event, wildColor = null) {
    console.log("Karte wurde geklickt!")
    console.log(event);  // DELETE
    console.log("Current Player: " + currentPlayer);  //DELETE
    let playerIndex = playerIndexMap[currentPlayer];
    console.log("Global Result Player: " + globalResult[playerIndex]);   // DELETE

    selectedCard = event.target.id;  // card selected by active player
    console.log(`Selected Card ID: ${selectedCard}`);
    let value = selectedCard.slice(1);  // removes first character
    let color = selectedCard.charAt(0);  // char on index 0

    //TODO if anyone has a better idea to convert the card value to the API value, please let me know :)
    switch (value) {
        case 'zero': value = '0'; break;
        case 'one': value = '1'; break;
        case 'two': value = '2'; break;
        case 'three': value = '3'; break;
        case 'four': value = '4'; break;
        case 'five': value = '5'; break;
        case 'six': value = '6'; break;
        case 'seven': value = '7'; break;
        case 'eight': value = '8'; break;
        case 'nine': value = '9'; break;
        case 'draw2': value = 'd2'; break;
        case 'reverse': value = 'r'; break;
        case 'skip': value = 's'; break;
        case 'Black13': color = 'w', value = 'd4'; break;
        case 'Black14': value = 'changecolor'; break;
        default:
            console.warn('Unknown card value:', value);
    }

    console.log(`Value: ${value}`);
    console.log(`Color: ${color}`);


    console.log('Current player:', currentPlayer);

    console.log('gameId:', gameId);
    console.log('wildColor:', wildColor);

    // ToDo: Add CSS Animation
    animateCard(event.target);

    let url = `https://nowaunoweb.azurewebsites.net/api/Game/PlayCard/${gameId}?value=${value}&color=${color}&wildColor=${wildColor}`;

    // if (wildColor) {
    //     url += `&wildColor=${wildColor}`;
    // }

    console.log("URL ____ :::: " + url);

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            }

        });
        console.log(response);

        if (!response.ok) {
            throw new Error(`Fehler beim Spielen einer Karte! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Karte wurde gespielt!");
        console.log(result);
        getCardImagePath(color, value);
        // update active player cards
        await updatePlayerCardsAndScore(currentPlayer);  // update cards of player after turn
        nextPlayer();  // change player after turn
        displayPlayersCards();


    } catch (error) {
        console.error('Fehler beim Spielen einer Karte:', error);
        alert('Fehler beim Spielen der Karte!');
    }

}

// let discarded card disapear
// TODO: cooler animation --> card moves to discard pile
function animateCard(cardElement) {
    cardElement.classList.add('card-animate');
    setTimeout(() => {
        cardElement.classList.remove('card-animate');
    }, 1000);
}


// TODO: check if globalResult is changed --> selector????
// update cards and score of active player after turn
async function updatePlayerCardsAndScore(playerName) {

    let URL = `https://nowaunoweb.azurewebsites.net/api/Game/GetCards/${gameId}?playerName=${playerName}`;

    let response = await fetch(URL, {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });

    let apiResponseToUpdatePlayerCards = await response.json();
    let playerIndex = playerIndexMap[currentPlayer];


    if (response.ok) {
        globalResult[playerIndex].Cards = apiResponseToUpdatePlayerCards.Cards;  //update cards
        globalResult[playerIndex].Score = apiResponseToUpdatePlayerCards.Score;  // update score
        alert("HTTP-Error: " + response.status);
    }
}


// Show top card
async function displayTopCard() {
    fetch(`https://nowaunoweb.azurewebsites.net/api/Game/TopCard/${gameId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP-Fehler beim Abrufen der Top Card! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(topCard => {
            const topCardContainer = document.getElementById('top-card');
            topCardContainer.innerHTML = '';

            const topCardImg = document.createElement('img');
            topCardImg.classList.add('active-card');

            topCardImg.src = getCardImagePath(topCard.Color, topCard.Text);
            topCardImg.alt = `${topCard.Color} ${topCard.Text}`;

            topCardContainer.appendChild(topCardImg);
        })
        .catch(error => console.error('Fehler beim Abrufen der Top Card:', error));
}


// Funktion zum Ziehen einer Karte

function drawCard() {

    fetch(`https://nowaunoweb.azurewebsites.net/api/Game/DrawCard/${gameId}`, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fehler beim Ziehen einer Karte! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(newCard => {
            console.log("Gezogene Karte:", newCard);
        })
        .catch(error => console.error('Fehler beim Ziehen einer Karte:', error));

}


// Funktion zum Abrufen der Kartenhand eines Spielers
function getPlayerHand(gameId, playerName) {
    fetch(`https://nowaunoweb.azurewebsites.net/api/Game/GetCards/${gameId}?playerName=${playerName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fehler beim Abrufen der Kartenhand von ${playerName}! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(hand => {
            console.log(`Kartenhand von ${playerName}:`, hand);
        })
        .catch(error => console.error('Fehler beim Abrufen der Kartenhand:', error));
}

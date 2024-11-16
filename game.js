
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
    submitting = true; //Prevents multiple submissions & indicated that a form submission is being attempted

    const player1 = document.getElementById('player1').value.trim();
    const player2 = document.getElementById('player2').value.trim();
    const player3 = document.getElementById('player3').value.trim();
    const player4 = document.getElementById('player4').value.trim();

    // Spieler-Namen in einem Array speichern
    playerNames = [player1, player2, player3, player4];

    // playerNames = ['Melissa', 'Ajla', 'Sophia', 'Anja']; //THIS IS HARD CODED FOR TESTING-REMOVE IT WHEN NOT NEEDED

    // //Prepares the form for new validation
    document.getElementById('message').textContent = '';

    //Check if there is any empty fields
    if (playerNames.some(name => name === '')) {
        document.getElementById('message').textContent = 'Bitte gib für alle Spieler einen Namen ein.';
        submitting = false;  //Reset the flag because the form is not fully submitted
        return;
    }

    //Double check the uniqueness
    const uniqueNames = new Set(playerNames);

    if (uniqueNames.size !== playerNames.length) {
        document.getElementById('message').textContent = 'Alle Spielernamen müssen einzigartig sein.';
        submitting = false;
        return;
    }
    else {
        document.getElementById('message').textContent = '';
    }

    // Modal schließen
    const playerModal = bootstrap.Modal.getInstance(document.getElementById('playerModal'));
    playerModal.hide();

    // Startet das Spiel mit den eingegebenen Spielernamen
    startGame();
    submitting = false; //Reset the flag because the form is fully submitted
}

// Reset the game and clear player inputs
// resetGame() is called when the "Neues Spiel" button is clicked
function resetGame() {
    //WITHOUT THIS THE GAME WILL NOT RESET PROPERLY
    //hide modals
    const winnerModal = bootstrap.Modal.getInstance(document.getElementById('winnerModal'));
    const playerModal = bootstrap.Modal.getInstance(document.getElementById('playerModal'));
    if (winnerModal) winnerModal.hide();
    if (playerModal) playerModal.hide();

    //WITHOUT THIS THE GAME WILL NOT RESET PROPERLY
    //remove modal backdrops
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');

    //Clear each player input field
    document.getElementById('player1').value = '';
    document.getElementById('player2').value = '';
    document.getElementById('player3').value = '';
    document.getElementById('player4').value = '';

    document.getElementById('message').textContent = '';

    playerNames = [];
    submitting = false;
    gameId = null;
    globalResult = [];
    currentPlayer = null;
    selectedCard = null;
    playerIndexMap = {};
    gameDirection = "clockwise";

    //WITHOUT THIS THE GAME WILL NOT RESET PROPERLY
    document.getElementById('top-section').style.display = 'block';
    document.getElementById('game-info').style.display = 'none';
    console.log("Spiel zurückgesetzt!");

    submitPlayerNames();
}

function startNewRound() {
    //hide winner modal
    const winnerModal = bootstrap.Modal.getInstance(document.getElementById('winnerModal'));
    winnerModal.hide();

    //WITHOUT THIS THE GAME WILL NOT RESET PROPERLY
    //remove any lingering modal backdrops
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');

    submitting = false;
    gameId = null;
    globalResult = [];
    currentPlayer = null;
    selectedCard = null;
    gameDirection = "clockwise";

    //startet das Spiel mit den eingegebenen Spielernamen
    startGame();
}

//Listener to check for all input changes in real time
document.getElementById('playerForm').addEventListener('input', checkUniqueNames);

//Listener for Enter key in the form
document.getElementById('playerForm').addEventListener('keypress', function(event){
    if(event.key === 'Enter'){
        event.preventDefault(); //Prevent the form from submitting
        submitPlayerNames(); //Manually handle the form submission with validations
    }
});


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
            document.getElementById('top-section').style.display = 'none'; //hide top section
            document.getElementById('game-info').style.display = 'block'; //show game section
            document.getElementById('game-controls').style.display = 'flex'; //show game controls
            if (!gameData || !gameData.Id || !gameData.Players || gameData.Players.length === 0) {
                throw new Error("Ungültige Datenstruktur");
            }

            gameId = gameData.Id;
            globalResult = gameData.Players;
            console.log("From server: ", globalResult);
            currentPlayer = gameData.NextPlayer;  // name of player who starts
            console.log("Current Player: ", currentPlayer);  // DELETE AGAIN

            // Retain scores from the previous rounds
            gameData.Players.forEach(player => {
                const existingPlayer = globalResult.find(p => p.Player === player.Player);
                if (existingPlayer) {
                    player.Score = existingPlayer.Score;
                }
            });

            // Initialize player index map
            // "Melissa": 0,
            //     "Ajla": 1,
            //     "Sophia": 2,
            //     "Anja": 3

            globalResult.forEach((player, index) => {
                playerIndexMap[player.Player] = index;
            });

            console.log("PlayersIndexMap: ", playerIndexMap);   // DELETE AGAIN

            document.getElementById('top-section').firstElementChild.innerHTML = '';
            document.getElementById('start-game').textContent = 'Start New Game';
            let gameinfo = document.getElementById('game-info');
            gameinfo.style.display = 'block';
            gameinfo.style.backgroundImage = `url('imgs/table.jpg')`;

            //display top card
            const topCard = gameData.TopCard;
            displayTopCard(topCard);

            //check if the top card is "Reverse" and apply the effect
            if (topCard.Text === 'Reverse') {
                console.log("Initial top card is 'Reverse'. Changing game direction.");
                changeDirection(); //reverse direction at the start
            }

            displayPlayersCards();
            displayGameDirection();
        })
        .catch(error => console.error('Fehler beim Starten des Spiels:', error));
}
// Define a mapping between server and local text codes
const serverToLocalCardMap = {
    'Zero': '0',
    'One': '1',
    'Two': '2',
    'Three': '3',
    'Four': '4',
    'Five': '5',
    'Six': '6',
    'Seven': '7',
    'Eight': '8',
    'Nine': '9',
    'Draw2': '10',
    'Skip': '11',
    'Reverse': '12',
    'Draw4': '13',
    'ChangeColor': '14'
};

const localToServerCardMap = {
    '0': 'Zero',
    '1': 'One',
    '2': 'Two',
    '3': 'Three',
    '4': 'Four',
    '5': 'Five',
    '6': 'Six',
    '7': 'Seven',
    '8': 'Eight',
    '9': 'Nine',
    '10': 'Draw2',
    '11': 'Skip',
    '12': 'Reverse',
    '13': 'Draw4',
    '14': 'ChangeColor'
};

function getCardImagePath(color, serverText) {
    let localText = convertServerToLocal(serverText);

    if (!localText) {
        console.warn('Unbekannte Karte:', serverText);
        return '';
    }
    return `imgs/Cards/${color}${localText}.png`;
}

function convertServerToLocal(serverValue) {
    if (serverToLocalCardMap[serverValue]) {
        return serverToLocalCardMap[serverValue];
    } else {
        console.error(`Unknown server card value: ${serverValue}`);
        return null;
    }
}

function convertLocalToServer(localValue) {
    if (localToServerCardMap[localValue]) {
        return localToServerCardMap[localValue];
    } else {
        console.error(`Unknown local card value: ${localValue}`);
        return null;
    }
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
        playerSection.classList.add('player-section');
        playerSection.innerHTML = `<h4>${player.Player}</h4>    
         <p id="${player.Player}-score" class="player-score">Score: ${player.Score}</p>`;


        const playerCardsList = document.createElement('div');
        playerCardsList.classList.add('player-cards-container');
        playerCardsList.id = `${player.Player}`;

        // show, activate & highlight current player cards
        if (player.Player === currentPlayer) {

            // highlight the background of current players deck
            playerCardsList.classList.add('active');

            player.Cards.forEach(card => {
                //validate card has Color and Text properties
                if (!card.Color || !card.Text) {
                    console.error("Fehler: Die Karte hat keine gültigen Eigenschaften:", card);
                    return; //skip this card if it doesn't have valid properties
                }


                // create active card image
                const activeCardImg = document.createElement('img');
                activeCardImg.classList.add('active-card');  // card is active
                activeCardImg.addEventListener('click', playCard);  // card is clickable

                activeCardImg.src = getCardImagePath(card.Color, card.Text);
                activeCardImg.alt = `${card.Color} ${card.Text}`;
                activeCardImg.id = `${card.Color}${convertServerToLocal(card.Text)}`;

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
    directionDiv.innerHTML = ''; //clear existing content -> so the circle is not added multiple times
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

    console.log("Spielrichtung geändert zu:", gameDirection);
}

// DELETE function when not needed anymore (only for testing)
// update variable currentPlayer
function nextPlayer() {

    let direction = (gameDirection === "counterclockwise") ? -1 : 1;  // clockwise = 1, counterclockwise = -1
    let currentPlayerIndex = playerIndexMap[currentPlayer]; // find index of active player in player array


    // update current player (considering direction)
    if (currentPlayerIndex !== undefined) {
        let nextIndex = (currentPlayerIndex + direction + globalResult.length) % globalResult.length;
        currentPlayer = globalResult[nextIndex].Player;
        console.log(`Next player is: ${currentPlayer}`);
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

    selectedCard = event.target.id;  // card selected by active player; "Red10"
    console.log(`Selected Card ID: ${selectedCard}`); //DELETE

    //split the card ID to get color and value
    let color = selectedCard.match(/[A-Za-z]+/g)[0];
    let value = selectedCard.match(/[0-9]+/g)[0];

    //convert local card value to server representation
    const serverValue = convertLocalToServer(value);

    console.log(`Selected Card(server value): ${color} ${value}`);  //DELETE
    if (!serverValue) {
        console.error("Kartenwert kann nicht umgerechnet werden:", value);
        wrongCardAnimation(event.target);  //highlight card as a wrong move
        return;
    }

    let topCard = await getTopCard();
    //convert top card value to local representation for comparison
    const topCardValueLocal = convertServerToLocal(topCard.Text);
    if (!topCardValueLocal) {
        console.error("Der oberste Kartenwert konnte nicht konvertiert werden:", topCard.Text);
        return;
    }

    //validate if the selected card can be played
    if (!isCardPlayable(value, color, topCardValueLocal, topCard.Color)) {
        console.error("Ungültige Karte gespielt:", serverValue);
        wrongCardAnimation(event.target);  //highlight card as a wrong move
        return;
    }
    console.log('Karte ist gültig, mit dem Spiel fortfahren...');


    //DELETE
    console.log(`Value: ${serverValue}`);
    console.log(`Color: ${color}`);
    console.log('Current player:', currentPlayer);
    console.log('gameId:', gameId);
    console.log('wildColor:', wildColor);

    // ToDo: Add CSS Animation
    animateCard(event.target);

    let url = `https://nowaunoweb.azurewebsites.net/api/Game/PlayCard/${gameId}?value=${value}&color=${color}&wildColor=${wildColor}`;

    console.warn("Spielen Karte, URL:", url);


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
        console.log(result); //DELETE

        await updatePlayerCardsAndScore(currentPlayer);  //update cards of the current player

        //TODO: Draw4, ChangeColor
        handleSpecialCards(serverValue);  //handle special cards like Skip, Draw2, Reverse 
        
        //UPDATE THE GAME STATE
        updateGameState();

    } catch (error) {
        console.error('Fehler beim Spielen einer Karte:', error);
        alert('Fehler beim Spielen der Karte!');
    }
}

async function updateGameState() {
    await updatePlayerCardsAndScore(currentPlayer);
    await displayTopCard();
    nextPlayer();
    displayPlayersCards();
}

//card validity
function isCardPlayable(cardValue, cardColor, topCardValue, topCardColor) {
    //the card is playable if it matches the top card's color or value or if it is a wildcard
    console.log(`Comparing played card (Color: ${cardColor}, Value: ${cardValue}) with Top Card (Color: ${topCardColor}, Value: ${topCardValue})`);

    if (cardColor === topCardColor) {
        return true;
    }
    if (cardValue === topCardValue) {
        return true;
    }
    if (cardColor === "Black") {
        return true;
    }

    //card does not match any valid criteria
    return false;
}

function wrongCardAnimation(cardElement) {
    cardElement.classList.add('wrong-card');
    setTimeout(() => {
        cardElement.classList.remove('wrong-card');
    }, 2000);  //animation lasts for 2 seconds
}

//TODO: Draw4, ChangeColor
async function handleSpecialCards(serverValue) {
    if (serverValue === 'Skip') {
        skipPlayer();
    } else if (serverValue === 'Draw2') {
        //the server already adds cards to the next player -> just need to skip that player's turn
        console.log(`Der Spieler muss 2 Karten ziehen und seinen Zug verlieren.`);
        nextPlayer();
        await updatePlayerCardsAndScore(currentPlayer);
    } else if (serverValue === "Reverse") {
            console.log("Umgekehrte Karte gespielt! Richtungswechsel.");
            changeDirection();  //update the game direction visually and in the game state
    }
}

function skipPlayer() {
    nextPlayer();
    console.log("Spieler übersprungen! Neuer currentPlayer:", currentPlayer);
    displayPlayersCards();
}

// let discarded card disapear
// TODO: cooler animation --> card moves to discard pile
function animateCard(cardElement) {
    cardElement.classList.add('card-animate');
    setTimeout(() => {
        cardElement.classList.remove('card-animate');
        displayPlayersCards();  //update the player card displays
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

    if(response.ok) {
        let apiResponseToUpdatePlayerCards = await response.json();
        let playerIndex = playerIndexMap[playerName];
        console.log('PlayerIndex: ', playerIndex);

        if (playerIndex !== undefined) {
            globalResult[playerIndex].Cards = apiResponseToUpdatePlayerCards.Cards;  //update cards
            globalResult[playerIndex].Score = apiResponseToUpdatePlayerCards.Score;  // update score
            console.log(`Updated cards for ${playerName}:`, globalResult[playerIndex].Cards); // Log updated cards

            //check if the player has one or no cards left
            let cardsRemaining = globalResult[playerIndex].Cards.length;
            if (cardsRemaining === 1) {
                console.log(`${playerName} has only one card left!`);
                alert(`${playerName} has UNO!`); //TODO: CALL UNO FUNCTION?
            } else if (cardsRemaining === 0) {
                endGame(playerName);
            }
        } else {
            console.error("Spielerindex nicht gefunden für: ", playerName);
        }
    } else {
        console.error('Karten konnten nicht aktualisiert werden für:', playerName);
    }
}

//fetch the current top card
async function getTopCard() {
    const response = await fetch(`https://nowaunoweb.azurewebsites.net/api/Game/TopCard/${gameId}`);
    if (response.ok) {
        let topCard = await response.json();
        return topCard;
    } else {
        console.error('Error fetching the top card:', response.status);
        return null;
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


// draw a card from pile
async function drawCard() {

    try {
        const response = await fetch(`https://nowaunoweb.azurewebsites.net/api/Game/DrawCard/${gameId}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        });

        if (!response.ok) {
            throw new Error(`Fehler beim Ziehen einer Karte! Status: ${response.status}`);
        }

        // wait for json result
        const result = await response.json();
        console.log('Karte wurde gezogen:', result);

        console.log('Karte wurde gezogen:', drawCard);
        addCardToDeck(result); // start css animation
        updatePlayerCardsAndScore(currentPlayer);  //update cards and score of the current player
        setTimeout(() => {
            currentPlayer = result.NextPlayer; // change player after turn
            displayPlayersCards();
        }, 2000);
    } catch (error) {
        console.error('Fehler beim Ziehen einer Karte:', error);
    }
}


// CSS Animation - draw card and append to currentPlayers deck
function addCardToDeck(result) {

    let drawPile = document.getElementById("draw-pile-card");
    let newCard = document.createElement("img");
    newCard.classList.add("new-card");
    newCard.src = getCardImagePath(result.Card.Color, result.Card.Text);  // card front
    newCard.alt = `${result.Card.Color} ${result.Card.Text}`;
    let playerCardsList = document.getElementById(currentPlayer);

    // position of newCard over stack
    const stackRect = drawPile.getBoundingClientRect();
    // Set new card position
    newCard.style.top = `${stackRect.top}px`;
    newCard.style.left = `${stackRect.left}px`;

    document.body.appendChild(newCard);  // insert card into DOM

    // calculate destination: players hand
    const handRect = playerCardsList.getBoundingClientRect();
    const cardPositionInDeck = {
        top: handRect.top + 10,
        left: handRect.left + playerCardsList.children.length * 70,  // placed in row
    };

    // start animation
    setTimeout(() => {
        newCard.style.top = `${cardPositionInDeck.top}px`;
        newCard.style.left = `${cardPositionInDeck.left}px`;

        // move card to players deck
        setTimeout(() => {
            newCard.style.position = "static"; // reset position
            playerCardsList.appendChild(newCard);
            newCard.classList.remove("new-card");
            newCard.classList.add("active-card");

            //set unique ID for the new card 
            let colorCode = result.Card.Color.charAt(0).toLowerCase(); // 'r', 'b', 'y', 'g'
            let textCode = result.Card.Text.toLowerCase();
            newCard.id = `${colorCode}${textCode}`;

            displayPlayersCards();

        }, 600);
    }, 100);
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

function endGame(winnerName) {
    let totalPoints = 0;

    //calculate points from other players' cards
    globalResult.forEach(player => {
        if (player.Player !== winnerName) {
            player.Cards.forEach(card => {
                const cardPoints = calculateCardPoints(card); //..for each card
                totalPoints += cardPoints;
                console.log(`Player: ${player.Player}, Card: ${card.Text}, Points: ${cardPoints}`); //DELETE
            });

            //reset the current round's points for this player
            console.log(`Resetting cards for ${player.Player}. Previous score: ${player.Score}`);
            player.Cards = []; //clear their cards to not affect their cumulative score
        }
    });

    //add total points to the winner's score
    let winner = globalResult.find(player => player.Player === winnerName);
    if (winner) {
        winner.Score += totalPoints;
        console.log(`${winnerName} gewinnt diese Runde und erhält ${totalPoints} Punkte! Gesamtpunktzahl: ${winner.Score}`);
    }

    //is winner a round or overall winner
    const isOverallWinner = winner.Score >= 500;

    //UPDATE MODAL CONTENT
    const modalTitle = document.getElementById('winnerModalLabel');
    const winnerNameElement = document.getElementById('winnerName');
    const winnerTypeElement = document.getElementById('winnerType');
    const winnerScoreElement = document.getElementById('winnerScore');
    const scoreList = document.getElementById('scoreList');
    const newRoundButton = document.getElementById('newRoundButton');

    //modal title and buttons
    modalTitle.textContent = isOverallWinner ? '🏆 Gewinner des Spiels 🏆' : '🎉 Rundengewinner 🎉';
    newRoundButton.style.display = isOverallWinner ? 'none' : 'block'; //hide "New Round" for overall winner

    //winner details
    winnerNameElement.textContent = winnerName;
    winnerTypeElement.textContent = isOverallWinner ? 'Herzlichen Glückwunsch zum Gewinn des Spiels!' : 'Du hast diese Runde gewonnen!';
    winnerScoreElement.textContent = `Gesamtpunktzahl: ${winner.Score}`;

    //display updated scores
    scoreList.innerHTML = '';
    globalResult.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.Player}: ${player.Score} Punkte`;
        scoreList.appendChild(li);
    });

    //show modal
    const winnerModal = new bootstrap.Modal(document.getElementById('winnerModal'));
    winnerModal.show();

    //reset the game if overall win
    if (isOverallWinner) {
        resetGame();
    }
}

//calculate points for cards
function calculateCardPoints(cards) {
    const cardValues = {
        'Zero': 0,
        'One': 1,
        'Two': 2,
        'Three': 3,
        'Four': 4,
        'Five': 5,
        'Six': 6,
        'Seven': 7,
        'Eight': 8,
        'Nine': 9,
        'Draw2': 20,
        'Skip': 20,
        'Reverse': 20,
        'Draw4': 50,
        'ChangeColor': 50
    };

    return cardValues[cards.Text] || 0;
}

//display scores
function displayScores() {
    return globalResult.map(player => `${player.Player}: ${player.Score} Punkte`).join('\n');
}

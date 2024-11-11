
// Global variables

let globalResult = Object();
let gameId = null; // Speichert die Spiel-ID global
let gameDirection = "clockwise";  // Spielrichtung - default im Uhrzeigersinn
let players = [];  // Spielernamen
let playerCardDecks = null;  // alle Player samt Cards
let activePlayer = null;   // Name des Spielers, der am Zug ist
let selectedCard = null;   // Karte, die gespielt werden soll



// Starten eines neuen Spiel mit Spielernamen & initialisiert globale Variablen
function submitPlayerNames() {
    const player1 = document.getElementById('player1').value;
    const player2 = document.getElementById('player2').value;
    const player3 = document.getElementById('player3').value;
    const player4 = document.getElementById('player4').value;

    // Spieler-Namen in einem Array speichern
    players = [player1, player2, player3, player4];

    // Prüfen, ob alle Namen eingegeben wurden
    if (players.some(name => name.trim() === "")) {
        alert("Bitte Namen für alle Spieler eingeben.");
        return;
    }

    // Modal schließen
    const playerModal = bootstrap.Modal.getInstance(document.getElementById('playerModal'));
    playerModal.hide();

    // Startet das Spiel mit den eingegebenen Spielernamen
    startGame(players);
}


// Start new game: set gameId, card setup, activePlayer
function startGame(players) {
    fetch('https://nowaunoweb.azurewebsites.net/api/Game/Start', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(players)
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
            playerCardDecks = gameData.Players;
            activePlayer = gameData.NextPlayer;  // name of player who starts
            console.log(activePlayer);  // Check the value of activePlayer
            // setPlayerCardsToActive();
            document.getElementById('game-id').textContent = gameId;

            displayPlayersCards(gameData.Players);
            displayTopCard(gameId);
            displayGameDirection();

            document.getElementById('game-info').style.display = 'block';
        })
        .catch(error => console.error('Fehler beim Starten des Spiels:', error));
}


// display each players cards
function displayPlayersCards(players) {
    const playersCardsContainer = document.getElementById('players-cards');
    playersCardsContainer.innerHTML = '';

    players.forEach(player => {
        const playerSection = document.createElement('div');
        playerSection.classList.add('player-section');
        playerSection.id = `${player.Player}`;
        playerSection.innerHTML = `<h4>${player.Player}</h4>`;

        const playerCardsList = document.createElement('div');
        playerCardsList.classList.add('player-cards-container');

        player.Cards.forEach(card => {
            if (card.Color.toLowerCase() === 'black' && (card.Text.toLowerCase() === 'changecolor' || card.Text.toLowerCase() === 'wild')) {
                return;
            }

            const cardImg = document.createElement('img');
            cardImg.classList.add('card');

            let colorCode = card.Color.charAt(0).toLowerCase();
            let textCode = card.Text.toLowerCase();

            switch (textCode) {
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
                case 'draw2': textCode = 'd2'; break;
                case 'reverse': textCode = 'r'; break;
                case 'skip': textCode = 's'; break;
                case 'draw4':
                    colorCode = 'wd';
                    textCode = '4';
                    break;
                case 'changecolor':
                    colorCode = '';
                    textCode = 'wild';
                    break;
                default:
                    console.warn('Unbekannte Spezialkarte:', textCode);
            }

            cardImg.id = `${colorCode}${textCode}`
            cardImg.src = `https://nowaunoweb.azurewebsites.net/Content/Cards/${colorCode}${textCode}.png`;
            cardImg.alt = `${card.Color} ${card.Text}`;
            playerCardsList.appendChild(cardImg);
        });

        playerSection.appendChild(playerCardsList);
        playersCardsContainer.appendChild(playerSection);
    });
}

// Hilfsfunktion zum Konvertieren des Kartentextes in Code
function getCardTextCode(text) {
    switch (text) {
        case 'zero': return '0';
        case 'one': return '1';
        case 'two': return '2';
        case 'three': return '3';
        case 'four': return '4';
        case 'five': return '5';
        case 'six': return '6';
        case 'seven': return '7';
        case 'eight': return '8';
        case 'nine': return '9';
        case 'draw2': return 'd2';
        case 'reverse': return 'r';
        case 'skip': return 's';
        case 'draw4': return '4';
        case 'changecolor': return 'wild';
        default:
            console.warn('Unbekannte Spezialkarte:', text);
            return text; // Fallback für unbekannte Texte
    }
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


// change direction of game and display it (flip image)
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


// remove 'active-card' class and click listener again to set new one
function removeActivePlayer() {

    const activeCards = document.getElementsByClassName('active-card');

    Array.from(activeCards).forEach(card => {
        card.removeEventListener('click', playCard); // deactivate click
        card.className = 'card';  //change class name back to 'card'
    })

    // de-highlight the background of players deck
    const currentActiveSection = document.querySelector('.active');
    if (currentActiveSection) {
        currentActiveSection.classList.remove('active');
    }
}


function setPlayerCardsToActive() {

    const activePlayerSection = document.getElementById(activePlayer); // card container of active player
    const playerCards = Array.from(activePlayerSection.getElementsByClassName('player-cards-container')[0].getElementsByTagName('img')); // all cards from active player

    // change card class to 'active-card' and add click listener to each active player card
    playerCards.forEach(card => {
        card.className = 'active-card';
        card.addEventListener('click', playCard);
    });

    // highlight the background of new active players deck
    activePlayerSection.classList.add('active');
}


// TODO:
// make active player cards clickable (set player id class and click listener)
// highlight active player section
// update variable activePlayer
function nextPlayer() {

    removeActivePlayer();  // first remove active-card class from current active player

    let direction = (gameDirection === "counterclockwise") ? -1 : 1;  // clockwise = 1, counterclockwise = -1
    let activePlayerIndex = players.findIndex(player => player.name === activePlayer);  // find index of active player in player array

    // update active player (considering direction)
    if (activePlayerIndex !== -1) {
        let nextIndex = (activePlayerIndex + direction + players.length) % players.length;
        activePlayer = players[nextIndex].name;  //set new active player name
    } else {
        console.error("player not found in array players!");
    }

    setPlayerCardsToActive();  // set new active player cards to active

}



// ToDo: play card - set selected card and add cardId
function playCard(event, wildColor = null) {
    console.log("Karte wurde geklickt!")
    selectedCard = event.target.id;  // card selected by active player
    let value = selectedCard.slice(1);  // removes first character
    let color = selectedCard.charAt(0);  // char on index 0

    // ToDo: Add CSS Animation

    let url = `https://nowaunoweb.azurewebsites.net/api/Game/PlayCard/${gameId}?value=${value}&color=${color}`;

    if (wildColor) {
        url += `&wildColor=${wildColor}`;
    }

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fehler beim Spielen einer Karte! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            console.log("Karte wurde gespielt!");
            // result: Player, Cards, Score
            // TODO: Reset or update UI after a successful turn
            // update active player cards
            updateActivePlayerCards(activePlayer);  // update cards of player after turn
            nextPlayer();  // change player after turn
        })
        .catch(error => console.error('Fehler beim Spielen einer Karte:', error));
}



// update cards and score of active player after turn
async function updatePlayerCardsAndScore(playerName) {
    // let name = globalResult.Players[playerId].Player;
    let URL = `https://nowaunoweb.azurewebsites.net/api/Game/GetCards/${gameID}?playerName=${playerName}`;

    let response = await fetch(URL, {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });

    let apiResponseToUpdatePlayerCards = await response.json();

    if (response.ok) {
        globalResult.Players[playerName].Cards = apiResponseToUpdatePlayerCards.Cards;  //update cards
        globalResult.Players[playerName].Score = apiResponseToUpdatePlayerCards.Score;  // update score
        alert("HTTP-Error: " + response.status);
    }
}


// Funktion zum Anzeigen der obersten Karte (Top Card)
async function displayTopCard(gameId) {
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
            topCardImg.classList.add('card');

            let colorCode = topCard.Color.charAt(0).toLowerCase();
            let textCode = getCardTextCode(topCard.Text.toLowerCase());

            topCardImg.src = `https://nowaunoweb.azurewebsites.net/Content/Cards/${colorCode}${textCode}.png`;
            topCardImg.alt = `${topCard.Color} ${topCard.Text}`;

            topCardContainer.appendChild(topCardImg);
        })
        .catch(error => console.error('Fehler beim Abrufen der Top Card:', error));
}


// Funktion zum Ziehen einer Karte
function drawCard(gameId) {
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

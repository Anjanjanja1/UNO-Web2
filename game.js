let gameId = null; // Speichert die Spiel-ID global
let playerCardDecks = null;  // alle Player samt Cards
let activePlayer = null;   // Spieler, der am Zug ist
let selectedCard = null;   // Karte, die gespielt werden soll


// Starten eines neuen Spiels mit Spielernamen & globale Variablen initialisieren
function submitPlayerNames() {
    const player1 = document.getElementById('player1').value;
    const player2 = document.getElementById('player2').value;
    const player3 = document.getElementById('player3').value;
    const player4 = document.getElementById('player4').value;

    // Spieler-Namen in einem Array speichern
    const players = [player1, player2, player3, player4];

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
            activePlayer = gameData.NextPlayer;
            document.getElementById('game-id').textContent = gameId;

            displayPlayersCards(gameData.Players);
            displayTopCard(gameId);

            document.getElementById('game-info').style.display = 'block';
        })
        .catch(error => console.error('Fehler beim Starten des Spiels:', error));
}

// display cards from each player
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


// make active player cards clickable (set player id class and click listener)
function setActivePlayer() {

    removeActivePlayer();

    let activePlayerSection = document.getElementById(activePlayer);

    // set class to 'active-player' and add click listener to each active player card
    activePlayerSection.querySelector(`.player-cards-container`).forEach(card => {
        card.className = 'active-player';
        card.addEventListener('click', playCard);
    });
}


// remove 'active-player' class and click listener again to set new one
function removeActivePlayer() {

    document.getElementsByClassName('active-player').removeEventListener('click', playCard); // deactivate click
    document.getElementsByClassName('active-player').className = 'card';  //change class name back to 'card'
}


// set selected card and add cardId
function playCard(event, wildColor = null) {
    selectedCard = event.target.id;
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
            // TODO: Reset or update UI after a successful play
            activePlayer = result.NextPlayer;  // update active player
            // score = 
            // updated player card deck = 
            setActivePlayer();
        })
        .catch(error => console.error('Fehler beim Spielen einer Karte:', error));
}



// Funktion zum Anzeigen der obersten Karte (Top Card)
function displayTopCard(gameId) {
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

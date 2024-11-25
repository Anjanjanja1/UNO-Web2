//TO FIND ALL THE DEBUGGING CODES, SEARCH FOR "DEBUG" IN THE FILE


//GLOBAL VARIABLES

let gameId = null; //Game ID -> to uniquely identify the game
let gameDirection = "clockwise";  //Game direction -> default is clockwise
let playerNames = [];  //List of player names participating in the game
let globalResult = Object();  //Global result object containing player data: {Player: {Cards{}, Score}}
let playerIndexMap = {};   //Mapping of player names to their respective index in the game
let currentPlayer = null;   //Name of the player whose turn it is
let selectedCard = null;   //The card selected by the player to be played


//Check if player names are unique and display an error message if duplicates are found
function checkUniqueNames() {
    //Get the player names from the input fields and trim whitespace
    const playerInputs = [
        document.getElementById('player1').value.trim(),
        document.getElementById('player2').value.trim(),
        document.getElementById('player3').value.trim(),
        document.getElementById('player4').value.trim()
    ];
    //Filter out empty fields to only consider names that have been entered
    const filledInputs = playerInputs.filter(name => name !== '');

    //Use a Set to automatically filter out duplicate names since Sets only store unique values
    const uniqueNames = new Set(filledInputs);

    //If the size of the Set is smaller than the number of filled inputs, duplicates exist
    if (uniqueNames.size !== filledInputs.length) {
        //Display an error message to indicate all names must be unique
        document.getElementById('message').textContent = 'Alle Spielernamen müssen einzigartig sein.';
    }
    //Clear any previously displayed error message if all names are unique
    else {
        document.getElementById('message').textContent = '';
    }
}

//Start a new game with the provided player names and initialize global variables
function submitPlayerNames() {
    const submitButton = document.getElementById('newRoundButton'); 
    submitButton.disabled = true; //Disable the button to prevent multiple submissions

    //Retrieve and trim whitespace from player name inputs
    const player1 = document.getElementById('player1').value.trim();
    const player2 = document.getElementById('player2').value.trim();
    const player3 = document.getElementById('player3').value.trim();
    const player4 = document.getElementById('player4').value.trim();

    //Store player names in an array
    playerNames = [player1, player2, player3, player4];

    // playerNames = ['Melissa', 'Ajla', 'Sophia', 'Anja']; //THIS IS HARD CODED FOR TESTING-REMOVE IT WHEN NOT NEEDED

    //Clear any previous validation message(prepares the form for new validation)
    document.getElementById('message').textContent = '';

    //Check if any player name input is empty
    if (playerNames.some(name => name === '')) {
        //Display an error message if any field is left blank
        document.getElementById('message').textContent = 'Bitte gib für alle Spieler einen Namen ein.';
        submitButton.disabled = false; //Re-enable the button for correction
        return;
    }

    //Double check the uniqueness of all player names
    const uniqueNames = new Set(playerNames);

    if (uniqueNames.size !== playerNames.length) {
        //Display an error message if duplicate names are found
        document.getElementById('message').textContent = 'Alle Spielernamen müssen einzigartig sein.';
        submitButton.disabled = false; //Re-enable the button for correction
        return;
    }
    else {
        //Clear validation message if all names are valid
        document.getElementById('message').textContent = '';
    }

    //Close the player name modal using Bootstrap modal instance
    const playerModal = bootstrap.Modal.getInstance(document.getElementById('playerModal'));
    playerModal.hide();

    //Start the game with the validated player names
    startGame();
}

//Remove any leftover modal backdrops and reset the body class to avoid modal issues
function removeBackdrop() {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
}

//Reset the game and clear all player inputs
//resetGame() is called when the "Neues Spiel" button is clicked
function resetGame() {
    //WITHOUT THIS THE GAME WILL NOT RESET PROPERLY
    //Hide all modals
    const winnerModal = bootstrap.Modal.getInstance(document.getElementById('winnerModal'));
    const playerModal = bootstrap.Modal.getInstance(document.getElementById('playerModal'));
    if (winnerModal) winnerModal.hide(); //Hide the winner modal if it is open
    if (playerModal) playerModal.hide(); //Hide the player modal if it is open

    //WITHOUT THIS THE GAME WILL NOT RESET PROPERLY
    removeBackdrop(); //Remove any leftover modal backdrops

    //Clear all player input fields to allow fresh input for a new game
    document.getElementById('player1').value = '';
    document.getElementById('player2').value = '';
    document.getElementById('player3').value = '';
    document.getElementById('player4').value = '';

    //Clear any displayed validation or error messages
    document.getElementById('message').textContent = '';

    //Reset all game-related variables to their initial states
    playerNames = [];
    gameId = null;
    globalResult = [];
    currentPlayer = null;
    selectedCard = null;
    playerIndexMap = {};
    gameDirection = "clockwise";

    //WITHOUT THIS THE GAME WILL NOT RESET PROPERLY
     //Ensure proper UI state by resetting visibility of sections
    document.getElementById('top-section').style.display = 'block'; //Show the top section
    document.getElementById('game-info').style.display = 'none'; //Hide the game info section
    
    console.log("Spiel zurückgesetzt!"); //DEBUG

    //Prepare the game for a new round by calling submitPlayerNames()
    submitPlayerNames();
}

//Starts a new round by resetting variables and cleaning up modal elements
function startNewRound() {
    //Hide the winner modal
    const winnerModal = bootstrap.Modal.getInstance(document.getElementById('winnerModal'));
    winnerModal.hide();

    //WITHOUT THIS THE GAME WILL NOT RESET PROPERLY
    removeBackdrop(); //Remove any leftover modal backdrops

    //Reset game state variables
    gameId = null;
    globalResult = [];
    currentPlayer = null;
    selectedCard = null;
    gameDirection = "clockwise";

    //Restart the game with the current player setup
    startGame();
}

//Listener to validate player names in real-time whenever there is an input change
document.getElementById('playerForm').addEventListener('input', checkUniqueNames);

//Listener to handle Enter key press within the player form
document.getElementById('playerForm').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); //Prevent default form submission behavior
        submitPlayerNames(); //Trigger form submission manually with validations
    }
});


//Start a new game by initializing game data, setting up players, and preparing the UI
function startGame() {
    //Send a POST request to the server to start the game with the provided player names
    fetch('https://nowaunoweb.azurewebsites.net/api/Game/Start', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(playerNames) //Send the player names as the request payload
    })
        .then(response => {
            if (!response.ok) {
                //Throw an error if the server response is not successful
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }
            return response.json(); //Parse the server's response as JSON
        })
        .then(gameData => {
            //Update the UI to display the game interface
            document.getElementById('top-section').style.display = 'none'; //Hide the top section
            document.getElementById('game-info').style.display = 'block'; //Show game section
            document.getElementById('game-controls').style.display = 'flex'; //Show game controls
            
            //Validate the structure of the received game data
            if (!gameData || !gameData.Id || !gameData.Players || gameData.Players.length === 0) {
                throw new Error("Ungültige Datenstruktur");
            }

            //Initialize game variables with data from the server response
            gameId = gameData.Id; //Store the unique game ID
            globalResult = gameData.Players; //Store player information
            console.log("From server: ", globalResult); //DEBUG
            currentPlayer = gameData.NextPlayer;  //Set the starting player
            console.log("Current Player: ", currentPlayer);  //DEBUG

            //Create a mapping of player names to their index
            globalResult.forEach((player, index) => {
                playerIndexMap[player.Player] = index;
            });

            console.log("PlayersIndexMap: ", playerIndexMap);   //DEBUG

            //Update the UI for the game interface
            document.getElementById('top-section').firstElementChild.innerHTML = ''; //Clear the top section
            document.getElementById('start-game').textContent = 'Start New Game'; //Update button text
            let gameinfo = document.getElementById('game-info');
            gameinfo.style.display = 'block'; //Show the game section
            gameinfo.style.backgroundImage = `url('imgs/table.jpg')`; //Set background image

            //Display the top card from the deck
            const topCard = gameData.TopCard;
            displayTopCard(topCard);

            //Check if the first top card is "Reverse" and change the game direction accordingly
            if (topCard.Text === 'Reverse') {
                console.log("Initial top card is 'Reverse'. Changing game direction.");
                changeDirection(); //Reverse the game direction
            }

            //Display players' cards and the current game direction
            displayPlayersCards();
            displayGameDirection();
        })
        .catch(error => console.error('Fehler beim Starten des Spiels:', error)); //Log any errors during the process
}

//Maps server-defined card codes to local representations ('Zero' -> '0')
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

//Maps local card representations to server-defined codes ('0' -> 'Zero')
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

//Returns the file path for the card image based on the card's color and text code
function getCardImagePath(color, serverText) {
    let localText = convertServerToLocal(serverText);  //Convert server text to local text

    if (!localText) {
        console.warn('Unbekannte Karte:', serverText); //Log a warning for unknown cards
        return '';
    }
    return `imgs/Cards/${color}${localText}.png`; //Return the path to the card image
}

//Converts a server-defined card text code to its local representation
function convertServerToLocal(serverValue) {
    if (serverToLocalCardMap[serverValue]) {
        return serverToLocalCardMap[serverValue];
    } else {
        console.error(`Unknown server card value: ${serverValue}`); //Log an error for unrecognized values
        return null;
    }
}

//Converts a local card text code to its server-defined representation
function convertLocalToServer(localValue) {
    if (localToServerCardMap[localValue]) {
        return localToServerCardMap[localValue];
    } else {
        console.error(`Unknown local card value: ${localValue}`); //Log an error for unrecognized values
        return null;
    }
}

//Display each player's cards in the game interface
function displayPlayersCards() {
    const allPlayersContainer = document.getElementById('players-cards');
    allPlayersContainer.innerHTML = ''; //Clear previous content

    globalResult.forEach(player => {
        //Create a section for the current player's cards and details
        const playerSection = document.createElement('div');
        playerSection.classList.add('player-section');
        playerSection.innerHTML = `<h4>${player.Player}</h4>`;
        playerSection.classList.add('player-section');
        playerSection.innerHTML = `<h4>${player.Player}</h4>    
        <p id="${player.Player}-score" class="player-score">Score: ${player.Score}</p>`;

        //Create a container for the player's cards
        const playerCardsList = document.createElement('div');
        playerCardsList.classList.add('player-cards-container');
        playerCardsList.id = `${player.Player}`;

        //Highlight and activate the current player's cards
        if (player.Player === currentPlayer) {
            playerCardsList.classList.add('active'); //Highlight the background of current players deck

            player.Cards.forEach(card => {
                //Validate card has Color and Text properties
                if (!card.Color || !card.Text) {
                    console.error("Fehler: Die Karte hat keine gültigen Eigenschaften:", card);
                    return; //Skip invalid cards
                }

                //Create an image element for the active card
                const activeCardImg = document.createElement('img');
                activeCardImg.classList.add('active-card');  //Mark card as active
                activeCardImg.addEventListener('click', playCard);  //Make the card clickable

                activeCardImg.src = getCardImagePath(card.Color, card.Text); //Set card image source
                activeCardImg.alt = `${card.Color} ${card.Text}`; //Set alternative text
                activeCardImg.id = `${card.Color}${convertServerToLocal(card.Text)}`;  //Set unique card ID

                playerCardsList.appendChild(activeCardImg); //Add card to player's card list
            });
        }
        //Hide inactive player's cards by displaying the back of the cards
        else {
            player.Cards.forEach(() => {
                const backCardImg = document.createElement('img');
                backCardImg.src = 'imgs/Cards/back0.png';  //Path to card back image
                backCardImg.alt = 'Inactive Card'; //Set alternative text for inactive card
                playerCardsList.appendChild(backCardImg); //Add card back to player's card list
                
                //Remove 'active-card' class and click listener
                backCardImg.removeEventListener('click', playCard); //Deactivate click
                backCardImg.className = 'inactive-card';  //Change class name to 'inactive-card'
            });

            //Remove the highlight for inactive players
            playerCardsList.classList.remove('active');
        }
        //Add the player's card container to their section and display it
        playerSection.appendChild(playerCardsList);
        allPlayersContainer.appendChild(playerSection);
    });
}

//Display the current game direction (e.g., clockwise or counterclockwise)
function displayGameDirection() {
    //Get the container for the game direction indicator
    let directionDiv = document.getElementById('game-direction');
    directionDiv.innerHTML = ''; //clear existing content -> so the circle is not added multiple times

    //Create an image element to represent the game direction
    let directionImg = document.createElement('img');
    directionImg.src = "imgs/clockwise.png"; //Path to the default clockwise image
    directionImg.alt = `${gameDirection}`; //Set the alt text to the current game direction
    directionImg.id = "game-direction-image"; //Assign a unique ID for styling or updates
    directionImg.className = "img-fluid"; //Ensure the image is responsive

    directionDiv.appendChild(directionImg); //Add the game direction image to the container
}

//Switch the game direction and update the displayed image to reflect the change
function changeDirection() {
    let directionImg = document.getElementById('game-direction-image');  //Get the current direction image element

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
        directionImg.classList.add("rotate-scale-up"); // rotate animation
    }

    // remove animation class after animation
    setTimeout(() => {
        directionImg.classList.remove("rotate-scale-up");
    }, 700);

    console.log("Spielrichtung geändert zu:", gameDirection); //DEBUG
}

// DELETE function when not needed anymore (only for testing)
//Update the variable `currentPlayer` to the next player based on game direction
function nextPlayer() {
    let direction = (gameDirection === "counterclockwise") ? -1 : 1;  // clockwise = 1, counterclockwise = -1
    let currentPlayerIndex = playerIndexMap[currentPlayer];  //Find the current player's index in the player array

    //Update the `currentPlayer` to the next player in the sequence (considering direction)
    if (currentPlayerIndex !== undefined) {
        //Calculate the next index, wrapping around the array if needed
        let nextIndex = (currentPlayerIndex + direction + globalResult.length) % globalResult.length;
        currentPlayer = globalResult[nextIndex].Player; //Set the next player as active
        console.log(`Next player is: ${currentPlayer}`); //DEBUG
    } else {
        console.error("Player not found in playerIndexMap!"); //DEBUG
    }
}


//Play the selected card and update the game state
async function playCard(event, wildColor = null) {
    //DEBUG
    console.log("Karte wurde geklickt!")
    console.log(event); 
    console.log("Current Player: " + currentPlayer);
    //Get the index of the current player in the player array
    let playerIndex = playerIndexMap[currentPlayer]; 
    console.log("Global Result Player: " + globalResult[playerIndex]); //DEBUG

    //Get the selected card's ID (e.g., "Red10") from the clicked element(active player's card)
    selectedCard = event.target.id;
    console.log(`Selected Card ID: ${selectedCard}`); //DEBUG

    //Extract the color and value from the selected card's ID
    let color = selectedCard.match(/[A-Za-z]+/g)[0]; //Extract the color part
    let value = selectedCard.match(/[0-9]+/g)[0]; //Extract the numeric value part

    //Convert the local card value to the server's format
    const serverValue = convertLocalToServer(value);

    console.log(`Selected Card(server value): ${color} ${value}`);  //DEBUG
    if (!serverValue) {
        console.error("Kartenwert kann nicht umgerechnet werden:", value); //DEBUG
        return;
    }

    let topCard = await getTopCard(); //Fetch the current top card from the deck
    const topCardValueLocal = convertServerToLocal(topCard.Text); //Convert the top card's server value to local format for comparison
    
    if (!topCardValueLocal) {
        console.error("Der oberste Kartenwert konnte nicht konvertiert werden:", topCard.Text); //DEBUG
        return;
    }

    //Check if the selected card is playable
    if (!isCardPlayable(value, color, topCardValueLocal, topCard.Color)) {
        console.error("Ungültige Karte gespielt:", serverValue); //DEBUG
        wrongCardAnimation(event.target);  //Highlight the card to indicate an invalid move
        return;
    }
    console.log('Karte ist gültig, mit dem Spiel fortfahren...'); //DEBUG

    //DEBUG
    console.log(`Value: ${serverValue}`);
    console.log(`Color: ${color}`);
    console.log('Current player:', currentPlayer);
    console.log('gameId:', gameId);
    console.log('wildColor:', wildColor);

    playCardAnimation(event.target); //Play card animation for the selected card

    //Construct the server URL for playing the selected card
    let url = `https://nowaunoweb.azurewebsites.net/api/Game/PlayCard/${gameId}?value=${value}&color=${color}&wildColor=${wildColor}`;
    console.warn("Spielen Karte, URL:", url); //DEBUG

    try {
        //Send a PUT request to the server to play the card
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

        const result = await response.json(); //Parse the server's response
        //DEBUG
        console.log("Karte wurde gespielt!"); 
        console.log(result);

        await updatePlayerCardsAndScore(currentPlayer);  //Update the player's cards and score

        //TODO: Draw4, ChangeColor
        handleSpecialCards(serverValue);  //Process any special card effects (e.g., Skip, Draw2, Reverse)

        //Update the game's state after the card is played
        updateGameState();

    } catch (error) {
        console.error('Fehler beim Spielen einer Karte:', error); //DEBUG
        alert('Fehler beim Spielen der Karte!'); //Display an error message to the user
    }
}

//Update the game state after a card is played
async function updateGameState() {
    await displayTopCard(); //Display the updated top card on the game interface
    
    //Wait briefly before moving to the next player and updating the display
    setTimeout(() => {
        nextPlayer(); //Determine the next player's turn
        displayPlayersCards(); //Update the card display for all players
    }, 800); //Delay for smooth transitions
}

//Check if the selected card is valid for play based on the top card
function isCardPlayable(cardValue, cardColor, topCardValue, topCardColor) {
    //DEBUG
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
    //The card is not playable if it doesn't meet any criteria
    return false;
}

//Add a visual animation to indicate an invalid card play
function wrongCardAnimation(cardElement) {
    cardElement.classList.add('wrong-card'); //Add the 'wrong-card' class to the card element to trigger the animation

    //Remove the 'wrong-card' class after the animation ends (2 seconds)
    setTimeout(() => {
        cardElement.classList.remove('wrong-card');
    }, 2000);
}

//TODO: Draw4, ChangeColor
//Handle the effects of special cards (e.g., Skip, Draw2, Reverse, Draw4, ChangeColor)
async function handleSpecialCards(serverValue) {
    if (serverValue === 'Skip') {
        skipPlayer();
        //TODO: display skipPlayer Popup here
    } else if (serverValue === 'Draw2') {
        //The server automatically adds cards to the next player's hand; skip their turn
        console.log(`Der Spieler muss 2 Karten ziehen und seinen Zug verlieren.`); //DEBUG
        nextPlayer(); //Move to the next player
        await updatePlayerCardsAndScore(currentPlayer); //Update the cards and score of the next player
    } else if (serverValue === "Reverse") {
        console.log("Umgekehrte Karte gespielt! Richtungswechsel."); //DEBUG
        changeDirection();  //Update the game direction visually and in the game state
    }
}
//Skip the current player's turn and move to the next player
function skipPlayer() {
    nextPlayer();
    console.log("Spieler übersprungen! Neuer currentPlayer:", currentPlayer); //DEBUG
}


//CSS animation: Move the played card to the top-card stack visually
function playCardAnimation(cardElement) {

    const topCardStack = document.getElementById("top-card"); //Get the top card stack element

    // start and destination positions
    const cardRect = cardElement.getBoundingClientRect();
    const stackRect = topCardStack.getBoundingClientRect();

    // calculate difference between start & destination
    const moveX = stackRect.left + window.scrollX + stackRect.width / 2 - (cardRect.left + window.scrollX + cardRect.width / 2);
    const moveY = stackRect.top + window.scrollY + stackRect.height / 2 - (cardRect.top + window.scrollY + cardRect.height / 2);

    // set css variables for moving card and add class for animation
    cardElement.style.setProperty('--move-x', `${moveX}px`);
    cardElement.style.setProperty('--move-y', `${moveY}px`);

    // ensure the card is absolutely positioned for smooth animation
    cardElement.style.position = 'absolute';
    cardElement.style.zIndex = '10';

    // set the starting position of the card
    cardElement.style.top = `${cardRect.top + window.scrollY}px`;
    cardElement.style.left = `${cardRect.left + window.scrollX}px`;

    cardElement.classList.add('played-card');

    setTimeout(() => {
        // end animation, fix card on stack
        cardElement.classList.remove('played-card');
        cardElement.style.position = 'static';
        cardElement.style.zIndex = '';
        // add card to stack div
        topCardStack.innerHTML = "";  // delete old top card
        topCardStack.appendChild(cardElement);  // add new top card

        //displayPlayersCards();
    }, 600);
}


//Update the cards and score of the active player after their turn
async function updatePlayerCardsAndScore(playerName) {
    //Construct the API URL for fetching updated player data
    let URL = `https://nowaunoweb.azurewebsites.net/api/Game/GetCards/${gameId}?playerName=${playerName}`;

    //Send a GET request to fetch the updated cards and score for the player
    let response = await fetch(URL, {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });

    if (response.ok) {
        let apiResponseToUpdatePlayerCards = await response.json(); //Parse the API response
        let playerIndex = playerIndexMap[playerName]; //Find the player's index in the global result array
        console.log('PlayerIndex: ', playerIndex); //DEBUG

        //Update the player's cards and score in the global result object
        if (playerIndex !== undefined) {
            globalResult[playerIndex].Cards = apiResponseToUpdatePlayerCards.Cards;  //update cards
            globalResult[playerIndex].Score = apiResponseToUpdatePlayerCards.Score;  // update score
            console.log(`Updated cards for ${playerName}:`, globalResult[playerIndex].Cards); //DEBUG

            //Check the number of cards remaining for the player
            let cardsRemaining = globalResult[playerIndex].Cards.length;
            if (cardsRemaining === 1) {
                console.log(`${playerName} has only one card left!`); //DEBUG
                unoPopUp();
            } 
            //End the game if the player has no cards left
            else if (cardsRemaining === 0) {
                endGame(playerName); 
            }
        } else {
            console.error("Spielerindex nicht gefunden für: ", playerName); //DEBUG
        }
    } else {
        console.error('Karten konnten nicht aktualisiert werden für:', playerName); //DEBUG
    }
}

//Fetch and return the current top card from the server
async function getTopCard() {
    //Send a GET request to retrieve the top card of the game
    const response = await fetch(`https://nowaunoweb.azurewebsites.net/api/Game/TopCard/${gameId}`);
    //Parse and return the top card data from the response
    if (response.ok) {
        let topCard = await response.json();
        return topCard;
    } else {
        console.error('Error fetching the top card:', response.status); //DEBUG
        return null;
    }
}

//Fetch and display the current top card on the game interface
async function displayTopCard() {
    getTopCard() //Fetch the top card using the reusable getTopCard method
        .then(topCard => {
            if (!topCard) {
                console.error('Failed to fetch the top card.');
                return;
            }
            //Get the top card container and clear its existing content
            const topCardContainer = document.getElementById('top-card');
            topCardContainer.innerHTML = '';
            
            //Create an image element for the top card and set its attributes
            const topCardImg = document.createElement('img');
            topCardImg.classList.add('active-card'); //Add the appropriate class for styling
            topCardImg.src = getCardImagePath(topCard.Color, topCard.Text); //Set the image path
            topCardImg.alt = `${topCard.Color} ${topCard.Text}`; //Set the alternative text

            //Add the image to the top card container
            topCardContainer.appendChild(topCardImg);
        })
        .catch(error => console.error('Fehler beim Abrufen der Top Card:', error)); //Log any errors during the process
}


//Draw a card from the pile for the current player
async function drawCard() {
    try {
        //Send a PUT request to the server to draw a card
        const response = await fetch(`https://nowaunoweb.azurewebsites.net/api/Game/DrawCard/${gameId}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        });

        if (!response.ok) {
            throw new Error(`Fehler beim Ziehen einer Karte! Status: ${response.status}`);
        }

        //Parse the response from the server
        const result = await response.json();
        console.log('Karte wurde gezogen:', result); //DEBUG
        drawTwoPopUp();
        console.log('Karte wurde gezogen:', drawCard); //DEBUG
        addCardToDeckAnimation(result); //Trigger an animation to add the drawn card to the player's deck
        await updatePlayerCardsAndScore(currentPlayer);  //Update the current player's cards and score
        
        //After a delay, update the current player and refresh the UI
        setTimeout(() => {
            currentPlayer = result.NextPlayer; //Switch to the next player
            displayPlayersCards(); //Update the display for all players' cards
        }, 2000); //Delay to allow the animation to complete
    } catch (error) {
        console.error('Fehler beim Ziehen einer Karte:', error); //Log any errors during the process
    }
}


// css animation: draw card and append to currentPlayers deck
function addCardToDeckAnimation(result) {

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

//Fetch and log the hand cards of a specified player
function getPlayerHand(gameId, playerName) {
    //Send a GET request to fetch the player's hand cards
    fetch(`https://nowaunoweb.azurewebsites.net/api/Game/GetCards/${gameId}?playerName=${playerName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fehler beim Abrufen der Kartenhand von ${playerName}! Status: ${response.status}`);
            }
            return response.json(); //Parse the response as JSON
        })
        .then(hand => {
            console.log(`Kartenhand von ${playerName}:`, hand); //DEBUG
        })
        .catch(error => console.error('Fehler beim Abrufen der Kartenhand:', error)); //Log any errors during the process
}

//End the game by calculating points, declaring a winner, and displaying the results
function endGame(winnerName) {
    let totalPoints = 0;

    //Calculate the total points from all other players' cards
    globalResult.forEach(player => {
        if (player.Player !== winnerName) {
            player.Cards.forEach(card => {
                const cardPoints = calculateCardPoints(card); //Calculate points for each card
                totalPoints += cardPoints;
            });
        }
    });

    //Add the calculated points to the winner's total score
    let winner = globalResult.find(player => player.Player === winnerName);
    if (winner) {
        winner.Score += totalPoints;
        console.log(`${winnerName} gewinnt diese Runde und erhält ${totalPoints} Punkte! Gesamtpunktzahl: ${winner.Score}`);
    }

    //Update the modal content with the winner's details
    const winnerNameElement = document.getElementById('winnerName');
    const winnerScoreElement = document.getElementById('winnerScore');
    winnerNameElement.textContent = winnerName;
    winnerScoreElement.textContent = `Gesamtpunktzahl: ${winner.Score}`;

    //Display the winner modal immediately 
    const winnerModal = new bootstrap.Modal(document.getElementById('winnerModal'));
    winnerModal.show();
    console.log("Winner modal should now be visible."); //DEBUG

    //Trigger the falling cards animation for the winner's celebration
    setTimeout(() => {
        startUnoCardsAnimation();
    }, 500); //Slight delay to ensure modal is fully visible
}

//Calculate the points for a single card
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
    //Return the card's value or 0 if it's not found
    return cardValues[cards.Text] || 0;
}
/*
//Start the Uno cards animation at the end of the game
function startUnoCardsAnimation() {
    let myElem = document.body; //Use body for global animation overlay

    //Array of card image paths
    const cardImages = [
        "imgs/Cards/back0.png",
        "imgs/Cards/Blue6.png",
        "imgs/Cards/Black14.png",
        "imgs/Cards/Yellow0.png",
        "imgs/Cards/Green6.png",
        "imgs/Cards/Red5.png",
        "imgs/Cards/back0.png",
        "imgs/Cards/back0.png"
    ];

    //Create a container for the animated cards
    const divCards = document.createElement("div");
    divCards.id = "uno-cards";
    myElem.appendChild(divCards);

    //Generate 10 animated card elements with random images
    for (let i = 0; i < 10; i++) {
        const divElem = document.createElement("div");
        divElem.classList.add("uno-card");

        const randomImage = cardImages[Math.floor(Math.random() * cardImages.length)];
        divElem.style.backgroundImage = `url('${randomImage}')`;
        divCards.appendChild(divElem);
    }
    //Remove the animation after 15 seconds
    setTimeout(() => {
        divCards.remove();
        console.log("UNO-Karten Animation gestoppt.");
    }, 15000);
}
*/




//Start the Uno cards animation at the end of the game 
//It displays 10 cards from an array of cards as the endgame
function startUnoCardsAnimation() {
    let myElem = document.body;
    const cardImages = ["imgs/Cards/back0.png", "imgs/Cards/Blue6.png", "imgs/Cards/Black14.png", "imgs/Cards/Yellow0.png", "imgs/Cards/Green6.png", "imgs/Cards/Red5.png", "imgs/Cards/back0.png", "imgs/Cards/back0.png"];
    const divCards = document.createElement("div");
    divCards.id = "uno-cards";
    myElem.appendChild(divCards);
    for (let i = 0; i < 10; i++) {
        const divElem = document.createElement("div");
        divElem.classList.add("uno-card");
        const randomImage = cardImages[Math.floor(Math.random() * cardImages.length)];
        divElem.style.backgroundImage = `url('${randomImage}')`;
        divCards.appendChild(divElem);
    }
    setTimeout(() => {
        divCards.remove();
    }, 5000);
}

// Animation displays "UNO!!"
function unoPopUp() {
    if (document.getElementById("uno-popup"))
        return;
    const unoPopup = document.createElement("div");
    unoPopup.id = "uno-popup";
    unoPopup.classList.add("popup-animation");
    const unoImage = document.createElement("img");
    unoImage.src = "imgs/uno_animation.png";
    unoImage.alt = "UNO Animation";
    unoImage.classList.add("popup-animation-image");
    unoPopup.appendChild(unoImage);
    document.body.appendChild(unoPopup);
    setTimeout(() => {
        unoPopup.remove();
    }, 500);
}

// Animation displays  "+2"
function drawTwoPopUp() {

    if (document.getElementById("draw-two-popup"))
        return;
    const drawTwoPopup = document.createElement("div");
    drawTwoPopup.id = "draw-two-popup";
    drawTwoPopup.classList.add("popup-animation");
    const drawTwoImage = document.createElement("img");
    drawTwoImage.src = "imgs/2_animation.png";
    drawTwoImage.alt = "Draw Two Animation";
    drawTwoImage.classList.add("popup-animation-image");
    drawTwoPopup.appendChild(drawTwoImage);
    document.body.appendChild(drawTwoPopup);
    setTimeout(() => {
        drawTwoPopup.remove();
    }, 500);
}

// Animation displays  "+4"
function drawFourPopUp() {
    if (document.getElementById("draw-four-popup"))
        return;
    const drawFourPopup = document.createElement("div");
    drawFourPopup.id = "draw-four-popup";
    drawFourPopup.classList.add("popup-animation");
    const drawFourImage = document.createElement("img");
    drawFourImage.src = "imgs/4_animation.png";
    drawFourImage.alt = "Draw Four Animation";
    drawFourImage.classList.add("popup-animation-image");
    drawFourPopup.appendChild(drawFourImage);
    document.body.appendChild(drawFourPopup);
    setTimeout(() => {
        drawFourPopup.remove();
    }, 500);
}


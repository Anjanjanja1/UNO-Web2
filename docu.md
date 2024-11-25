
**UNO GAME DOCUMENTATION**


**game.js**
The JavaScript code includes functions for starting and resetting a card game, handling
player actions like playing cards and drawing cards, updating game state, displaying game elements,
and ending the game with a Uno animation.

**style.css**
The CSS stylesheet defines the styles for the UNO card game interface.

**index.html**
The html code provides the basic framework of the website: home screen, Start Game button, Help button, game interface, player cards section, draw pile, top card, game direction area, player names input modal, help modal and winner modal. It also imports the Bootstrap source used.

--------------------------------------------------------------------------------------------------------------------------

`checkUniqueNames`
Checks if player names entered in input fields are
unique and displays an error message if duplicates are found.
 

`submitPlayerNames`
initializes a new game with player names, validates the input, and starts the game if the input is valid.
The function [returns] either nothing (undefined) or it may return early with a return statement
if certain conditions are met. If any player name field is empty or if there are duplicate player names, 
the function will return early without proceeding to start the game. 
If all conditions are met successfully, the function will start the game and then return.


`resetGame()`
resets the game by clearing player inputs, hiding modals, removing modal
backdrops, and resetting game variables.


`startNewRound`
resets the game state and starts a new round with the specified players.


`startGame`
initiates a new game by sending a POST request to a specified API endpoint,
processing the response data, setting up game elements, and handling game logic.


`getCardImagePath`
takes a color and server text as input, converts the server text to a local text using `convertServerToLocal`
and [returns] the path to the corresponding card image.
*color* - a string representing the color of the card, such as "red", "blue", "green", or "yellow".
*serverText* - refers to the text representation of a card on the server side and contains information about the card's type, value, or any other relevant details needed for gameplay.
If the local text is not found, it logs a warning message and returns an empty string.


`convertServerToLocal`
takes a server card value as input and [returns] the corresponding local card value based on a mapping stored in `serverToLocalCardMap`.
The function is logging an error message and returning null, if the server value is not found in the map.
*serverValue* - value of a card on the server side that needs to be converted to its corresponding local value.


`convertLocalToServer`
converts a local card value to its corresponding server card value using a mapping object (localToServerCardMap).
*localValue* - represents the local value of a card.
If the localValue is found in the map, the function [returns] its corresponding server value. If it is not found,
an error message is logged to the console and 'null' is returned.


`displayPlayersCards`
dynamically creates and displays player sections with their respective cards,
highlighting the active player's cards and hiding the inactive player's cards.


`displayGameDirection`
displays the default game direction by displaying an image of a clockwise arrow.


`changeDirection`
toggles between clockwise and counterclockwise game directions
by flipping the displayed image and adding a rotation animation.


`nextPlayer`
determines the next player based on the current player and game direction.


`playCard`
handles the logic for playing a card, including validation, animations, API calls, and updating the game state.
It also catches and logs any errors that occur during the process.
*event* - this parameter represents the event object that is generated when a card is clicked (played) in the game. It contains information about the event, such as the target element that triggered the event.
*wildColor=null* - this parameter is used to specify the color chosen when playing a wild card in the game.


`updateGameState`
asynchronously updates player cards and score, displays the top card, switches to the next player,
and displays the players' cards after a delay of 800 milliseconds.


`isCardPlayable`
determines if a card can be played based on matching color, value, or being a wildcard.
*cardValue* - represents the value of the card being played. It could be a number (0-9) or a special card ("Skip", "Reverse", "Draw Two", "Wild").
*cardColor* - represents the color of the card being played. It could be "Red", "Blue", "Green", "Yellow", or "Black" (wild card).
*topCardValue* - represents the value of the top card on the playing stack.
*topCardColor* - represents the color of the top card and determines whether a new card can be played based on matching colors or values.
The function [returns] true if the played card matches the top card's color and/or value, or if it is a wildcard.
Otherwise, it returns false indicating that the card is not playable.


`wrongCardAnimation` 
adds a CSS class to a card element to trigger an shake animation effect for 2 seconds before removing the class.
*cardElement* - is a reference to the HTML element that represents a clicked (not playable) card.


`handleSpecialCards`
processes special card actions based on the server value received.
*serverValue* - represents the value recieved from the server


`skipPlayer`
skips to the next player and logs the new current player.


`playCardAnimation`
animates a card moving from its current position to the position of the top card stack and then fixes the card on the stack.
*cardElement* - represents the HTML element of the card to animate. This element will be moved from its current position
to the top of the top card stack with a smooth animation effect.


`updatePlayerCardsAndScore`
fetches updated cards and score for a player in a game, updates the player's data, and triggers actions based on the remaining cards.
*playerName* - represents the name of the player whose cards and score are being updated after their turn. This function fetches
the player's updated cards and score from the API endpoint and then updates the global result object with this new information.


`getTopCard` 
fetches the current top card from the API endpoint asynchronously. It [returns] the top card fetched from the API endpoint.
If the response is successful (status code 200), it returns the top card object in JSON format. If there is an error in fetching
the top card, it logs an error message and returns null.


`displayTopCard`
fetches and displays the current top card of the game using data from the API.


`drawCard`
asynchronously fetches a new card value from the API and handles errors.
It triggers the animation for moving the drawn card from the drawing pile to the player's deck
and the function to update the game state.


`addCardToDeckAnimation`
animates drawing a card from the draw pile and appending it to the current player's deck in the game interface.
*result* - an json object containing information about the card being added to the deck.


`endGame`
calculates points from other players' cards and adds them to the winner's score.
It also updates the modal content to display the winner's name and total score.
*winnerName* - represents the name of the player who won the game. 


`calculateCardPoints`
assigns point values to different types of cards based on their text.
*cards* - object which represents all types of cards.
The function looks up the corresponding point value for the card types in the cardValues object and returns it.
If the card's text is found, the corresponding point value is returned. If the card's text is not it returns 0.


`startUnoCardsAnimation`
creates a dynamic animation of falling Uno cards displayed for 15 seconds.
 
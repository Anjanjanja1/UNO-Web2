//Funktion zum Starten eines neuen Spiels
document.getElementById("start-game").addEventListener("click", () => {
  fetch("https://nowaunoweb.azurewebsites.net/api/Game/Start", {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    //Array mit 4 Spielernamen als JSON-Body
    body: JSON.stringify(["Lisa", "Leon", "Anna", "Tom"]),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((gameData) => {
      // Überprüfung auf gültige Spiel-Datenstruktur
      if (
        !gameData ||
        !gameData.Id ||
        !gameData.Players ||
        gameData.Players.length === 0
      ) {
        throw new Error("Ungültige Datenstruktur!");
      }

      // Spiel-ID anzeigen
      document.getElementById("game-id").textContent = gameData.Id;

      // Karten der Spieler anzeigen
      const playersCardsContainer = document.getElementById("players-cards");
      playersCardsContainer.innerHTML = ""; // Container leeren

      gameData.Players.forEach((player) => {
        // Spielerabschnitt erstellen
        const playerSection = document.createElement("div");
        playerSection.classList.add("player-section");
        playerSection.innerHTML = `<h4>${player.Player}</h4>`;

        // Kartenliste für jeden Spieler
        const playerCardsList = document.createElement("div");

        player.Cards.forEach((card) => {
          const cardImg = document.createElement("img");
          cardImg.classList.add("card");

          // URL basierend auf Kartenfarbe und Text erstellen
          let colorCode = card.Color.charAt(0).toLowerCase(); // Erstes Zeichen der Farbe
          let textCode = card.Text.toLowerCase();

          // Umwandlung ausgeschriebener Zahlen in Ziffern
          switch (textCode) {
            case "zero":
              textCode = "0";
              break;
            case "one":
              textCode = "1";
              break;
            case "two":
              textCode = "2";
              break;
            case "three":
              textCode = "3";
              break;
            case "four":
              textCode = "4";
              break;
            case "five":
              textCode = "5";
              break;
            case "six":
              textCode = "6";
              break;
            case "seven":
              textCode = "7";
              break;
            case "eight":
              textCode = "8";
              break;
            case "nine":
              textCode = "9";
              break;

            // Spezialkarten
            case "draw2":
              textCode = "d2";
              break;
            case "reverse":
              textCode = "r";
              break;
            case "skip":
              textCode = "s";
              break;
            case "draw4":
              colorCode = "w"; // Wild-Karten haben "w" als Farbkürzel
              textCode = "d4";
              break;
            case "changecolor":
              colorCode = "";
              textCode = "wild";
              break;
            default:
              console.warn("Unbekannte Spezialkarte:", textCode);
          }

          // Bild-URL zusammensetzen
          cardImg.src = `https://nowaunoweb.azurewebsites.net/Content/Cards/${colorCode}${textCode}.png`;
          cardImg.alt = `${card.Color} ${card.Text}`;

          playerCardsList.appendChild(cardImg);
        });

        // Kartenliste zum Spielerabschnitt hinzufügen
        playerSection.appendChild(playerCardsList);
        playersCardsContainer.appendChild(playerSection);
      });

      // Spiel-Info anzeigen
      document.getElementById("game-info").style.display = "block";
    })
    .catch((error) => console.error("Fehler beim Starten des Spiels:", error));
});

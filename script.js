document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    let ugcId = params.get("ugc");

    if (!ugcId) {
        document.getElementById("ugc-container").innerHTML = "<p>Kein UGC ausgewählt.</p>";
        return;
    }

    // Falls die ID mit "-" beginnt, entfernen wir es für die Suche
    ugcId = ugcId.startsWith("-") ? ugcId.substring(1) : ugcId;

    try {
        const response = await fetch("https://raw.githubusercontent.com/Shambhala222/pixelsugcviewer/main/ugc.json");
        const ugcData = await response.json();

        // 1️⃣ Suche mit und ohne Präfix
        const itmKey = `itm_ugc-${ugcId}`;
        const objKey = `obj_ugc-${ugcId}`;

        let itmEntry = ugcData[itmKey] || ugcData[ugcId];
        if (!itmEntry || !itmEntry.onUse || !itmEntry.onUse.placeObject) {
            document.getElementById("ugc-container").innerHTML = "<p>Kein animiertes UGC gefunden.</p>";
            return;
        }

        // 2️⃣ Suche `obj_ugc-` für die Animation
        let objEntry = ugcData[objKey] || ugcData[itmEntry.onUse.placeObject];

        if (!objEntry || !objEntry.sprite || !objEntry.sprite.isSpritesheet) {
            document.getElementById("ugc-container").innerHTML = "<p>Dieses UGC ist nicht animiert.</p>";
            return;
        }

        // 3️⃣ Extrahiere die richtige Sprite-URL
        let spriteUrl = objEntry.sprite.image;
        if (spriteUrl.startsWith("//")) {
            spriteUrl = "https:" + spriteUrl; // Korrektur der URL
        }

        const frameCount = objEntry.sprite.frames;
        const frameRate = objEntry.sprite.frameRate;
        const spriteWidth = objEntry.sprite.size.width;
        const spriteHeight = objEntry.sprite.size.height;

        // 4️⃣ Erstelle das Canvas für die Animation
        const canvas = document.createElement("canvas");
        canvas.width = spriteWidth;
        canvas.height = spriteHeight;
        document.getElementById("ugc-container").appendChild(canvas);

        const ctx = canvas.getContext("2d");
        const spriteImage = new Image();
        spriteImage.src = spriteUrl;

        let currentFrame = 0;
        function animateSprite() {
            ctx.clearRect(0, 0, spriteWidth, spriteHeight);
            ctx.drawImage(spriteImage, currentFrame * spriteWidth, 0, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
            currentFrame = (currentFrame + 1) % frameCount;
        }

        spriteImage.onload = function () {
            setInterval(animateSprite, 1000 / frameRate);
        };
    } catch (error) {
        console.error("Fehler beim Laden der UGC JSON:", error);
        document.getElementById("ugc-container").innerHTML = "<p>Fehler beim Laden der Daten.</p>";
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    let ugcId = params.get("ugc");

    if (!ugcId) {
        document.getElementById("ugc-container").innerHTML = "<p>Kein UGC ausgewählt.</p>";
        return;
    }

    // 🔹 Die korrekten UGC-Schlüssel bilden (mit richtigem Minus!)
    const itmKey = `itm_ugc-${ugcId}`;
    const objKey = `obj_ugc-${ugcId}`;

    try {
        // 🔹 JSON-Daten von GitHub abrufen
        const response = await fetch("https://raw.githubusercontent.com/Shambhala222/pixelsugcviewer/main/ugc.json");
        const ugcData = await response.json();

        // 🔹 1️⃣ Prüfe, ob `itm_ugc-` vorhanden ist
        const itmEntry = ugcData[itmKey];
        if (!itmEntry || !itmEntry.onUse || !itmEntry.onUse.placeObject) {
            document.getElementById("ugc-container").innerHTML = "<p>Kein animiertes UGC gefunden.</p>";
            return;
        }

        // 🔹 2️⃣ `obj_ugc-` suchen (für die Animation)
        const objEntry = ugcData[objKey];
        if (!objEntry || !objEntry.sprite || !objEntry.sprite.isSpritesheet) {
            document.getElementById("ugc-container").innerHTML = "<p>Dieses UGC ist nicht animiert.</p>";
            return;
        }

        // 🔹 3️⃣ Die Sprite-Animation-Parameter auslesen
        let spriteUrl = objEntry.sprite.image.startsWith("//") ? "https:" + objEntry.sprite.image : objEntry.sprite.image;
        const frameCount = objEntry.sprite.frames;
        const frameRate = objEntry.sprite.frameRate;
        const frameWidth = objEntry.sprite.size.width;  // Breite eines einzelnen Frames
        const frameHeight = objEntry.sprite.size.height; // Höhe eines einzelnen Frames

        // 🔹 4️⃣ `<canvas>` für die Animation erzeugen
        const canvas = document.createElement("canvas");
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        document.getElementById("ugc-container").appendChild(canvas);

        const ctx = canvas.getContext("2d");
        const spriteImage = new Image();
        spriteImage.src = spriteUrl;

        let currentFrame = 0;

        function animateSprite() {
            ctx.clearRect(0, 0, frameWidth, frameHeight);
            ctx.drawImage(
                spriteImage,
                currentFrame * frameWidth, 0, // 🟢 Schneidet den aktuellen Frame aus
                frameWidth, frameHeight,     // Größe des Ausschnitts (Frame)
                0, 0, frameWidth, frameHeight // 🟢 Zeichnet den Frame auf das Canvas
            );
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

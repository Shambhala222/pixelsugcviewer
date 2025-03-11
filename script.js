document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    let ugcId = params.get("ugc");

    if (!ugcId) {
        console.warn("⚠️ Keine UGC-ID übergeben.");
        document.getElementById("ugc-container").innerHTML = "<p>Kein UGC ausgewählt.</p>";
        return;
    }

    console.log("🔍 Gesuchte UGC-ID:", ugcId);

    try {
        const response = await fetch("https://raw.githubusercontent.com/Shambhala222/pixelsugcviewer/main/ugc.json");
        const ugcData = await response.json();

        console.log("✅ JSON geladen, Gesamtanzahl UGCs:", Object.keys(ugcData).length);

        // Prüfen, ob das UGC existiert
        const itmKey = `itm_ugc-${ugcId}`;
        const itmEntry = ugcData[itmKey];

        if (!itmEntry || !itmEntry.onUse || !itmEntry.onUse.placeObject) {
            console.error("❌ itm_ugc nicht gefunden oder keine placeObject-Verknüpfung.");
            document.getElementById("ugc-container").innerHTML = "<p>Kein animiertes UGC gefunden.</p>";
            return;
        }

        const objKey = itmEntry.onUse.placeObject;
        const objEntry = ugcData[objKey];

        if (!objEntry) {
            console.error("❌ obj_ugc nicht gefunden:", objKey);
            document.getElementById("ugc-container").innerHTML = "<p>Dieses UGC existiert nicht in den Objekten.</p>";
            return;
        }

        let spriteUrl = objEntry.sprite?.image || itmEntry.image;
        if (spriteUrl.startsWith("//")) {
            spriteUrl = "https:" + spriteUrl;
        }

        const isSpritesheet = objEntry.sprite?.isSpritesheet || false;
        const frameCount = objEntry.sprite?.frames || 1; // Standardwert: 1 Frame für statische Bilder
        const frameRate = objEntry.sprite?.frameRate || 1; // Standard: 1 FPS für statische Bilder
        const frameWidth = objEntry.sprite?.size?.width || 80;
        const frameHeight = objEntry.sprite?.size?.height || 80;

        console.log("🎨 Sprite-URL:", spriteUrl);
        console.log("🖼 Frame-Größe:", frameWidth, "x", frameHeight);
        console.log("🎞 Frames:", frameCount);
        console.log("⏳ Framerate:", frameRate, "FPS");
        console.log("🖼 Ist ein SpriteSheet?", isSpritesheet);

        const canvas = document.createElement("canvas");
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        document.getElementById("ugc-container").appendChild(canvas);

        const ctx = canvas.getContext("2d");
        const spriteImage = new Image();
        spriteImage.src = spriteUrl;

        if (isSpritesheet) {
            let currentFrame = 0;
            function animateSprite() {
                ctx.clearRect(0, 0, frameWidth, frameHeight);
                ctx.drawImage(spriteImage, currentFrame * frameWidth, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                currentFrame = (currentFrame + 1) % frameCount;
            }

            spriteImage.onload = function () {
                setInterval(animateSprite, 1000 / frameRate);
            };
        } else {
            spriteImage.onload = function () {
                ctx.drawImage(spriteImage, 0, 0, frameWidth, frameHeight);
                document.getElementById("ugc-container").innerHTML += "<p>Dieses UGC ist nicht animiert.</p>";
            };
        }

    } catch (error) {
        console.error("❌ Fehler beim Laden der UGC JSON:", error);
        document.getElementById("ugc-container").innerHTML = "<p>Fehler beim Laden der Daten.</p>";
    }
});

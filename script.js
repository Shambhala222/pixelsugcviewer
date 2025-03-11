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
        // Lade die UGC JSON von GitHub
        const response = await fetch("https://raw.githubusercontent.com/Shambhala222/pixelsugcviewer/main/ugc.json");
        const ugcData = await response.json();
        
        console.log("✅ JSON geladen, Gesamtanzahl UGCs:", Object.keys(ugcData).length);

        // 🚨 WICHTIG: UGC-ID darf NICHT verändert werden! Sie bleibt exakt, wie sie ist.
        const itmKey = `itm_ugc-${ugcId}`;
        const objKey = `obj_ugc-${ugcId}`;

        console.log("🔎 Suche nach itm_ugc:", itmKey);
        console.log("🔎 Suche nach obj_ugc:", objKey);

        // 1️⃣ ITM-UGC suchen
        const itmEntry = ugcData[itmKey];
        if (!itmEntry || !itmEntry.onUse || !itmEntry.onUse.placeObject) {
            console.error("❌ itm_ugc nicht gefunden oder keine placeObject-Verknüpfung.");
            console.log("🔍 Verfügbare itm_ugc Keys:", Object.keys(ugcData).filter(k => k.startsWith("itm_ugc-")));
            document.getElementById("ugc-container").innerHTML = "<p>Kein animiertes UGC gefunden.</p>";
            return;
        }

        // 2️⃣ OBJ-UGC suchen
        const objEntry = ugcData[objKey];
        if (!objEntry) {
            console.error("❌ obj_ugc nicht gefunden:", objKey);
            console.log("🔍 Verfügbare obj_ugc Keys:", Object.keys(ugcData).filter(k => k.startsWith("obj_ugc-")));
            document.getElementById("ugc-container").innerHTML = "<p>Dieses UGC hat keine Animation.</p>";
            return;
        }

        if (!objEntry.sprite || !objEntry.sprite.isSpritesheet) {
            console.error("❌ Kein Sprite-Sheet vorhanden.");
            document.getElementById("ugc-container").innerHTML = "<p>Dieses UGC ist nicht animiert.</p>";
            return;
        }

        // 3️⃣ Animation laden
        let spriteUrl = objEntry.sprite.image;
        if (spriteUrl.startsWith("//")) {
            spriteUrl = "https:" + spriteUrl; // Korrektur der URL
        }

        const frameCount = objEntry.sprite.frames;
        const frameRate = objEntry.sprite.frameRate;
        const frameWidth = objEntry.sprite.size.width;
        const frameHeight = objEntry.sprite.size.height;

        console.log("✅ Animation gefunden!");
        console.log("🎨 Sprite-URL:", spriteUrl);
        console.log("🖼 Frame-Größe:", frameWidth, "x", frameHeight);
        console.log("🎞 Frames:", frameCount);
        console.log("⏳ Framerate:", frameRate, "FPS");

        // 4️⃣ Canvas erstellen für Animation
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
            ctx.drawImage(spriteImage, currentFrame * frameWidth, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
            currentFrame = (currentFrame + 1) % frameCount;
        }

        spriteImage.onload = function () {
            setInterval(animateSprite, 1000 / frameRate);
        };

    } catch (error) {
        console.error("❌ Fehler beim Laden der UGC JSON:", error);
        document.getElementById("ugc-container").innerHTML = "<p>Fehler beim Laden der Daten.</p>";
    }
});

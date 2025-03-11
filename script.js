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
        // JSON laden
        const response = await fetch("https://raw.githubusercontent.com/Shambhala222/pixelsugcviewer/main/ugc.json");
        const ugcData = await response.json();
        
        console.log("✅ JSON geladen, Hauptkategorien:", Object.keys(ugcData));

        // Korrekte Keys setzen
        const itmKey = `itm_ugc-${ugcId}`;
        const objKey = `obj_ugc-${ugcId}`;

        console.log("🔎 Suche in items nach:", itmKey);
        console.log("🔎 Suche in objects nach:", objKey);

        // Prüfen, ob die Kategorien existieren
        if (!ugcData.items || !ugcData.objects) {
            console.error("❌ Die JSON enthält keine gültigen 'items' oder 'objects'.");
            document.getElementById("ugc-container").innerHTML = "<p>Fehlerhafte JSON-Struktur.</p>";
            return;
        }

        // Suche nach `itm_ugc` in `items`
        const itmEntry = ugcData.items[itmKey];
        if (!itmEntry) {
            console.error(`❌ ${itmKey} nicht in items gefunden.`);
            console.log("🔍 Verfügbare itm_ugc Keys:", Object.keys(ugcData.items).slice(0, 10)); // Debugging: Zeige die ersten 10 Keys
            document.getElementById("ugc-container").innerHTML = "<p>Kein animiertes UGC gefunden.</p>";
            return;
        }

        if (!itmEntry.onUse || !itmEntry.onUse.placeObject) {
            console.error("❌ Keine placeObject-Verknüpfung für dieses itm_ugc.");
            document.getElementById("ugc-container").innerHTML = "<p>Kein animiertes UGC gefunden.</p>";
            return;
        }

        // Suche nach `obj_ugc` in `objects`
        const objEntry = ugcData.objects[itmEntry.onUse.placeObject];
        if (!objEntry) {
            console.error(`❌ ${objKey} nicht in objects gefunden.`);
            console.log("🔍 Verfügbare obj_ugc Keys:", Object.keys(ugcData.objects).slice(0, 10)); // Debugging: Zeige die ersten 10 Keys
            document.getElementById("ugc-container").innerHTML = "<p>Dieses UGC hat keine Animation.</p>";
            return;
        }

        if (!objEntry.sprite || !objEntry.sprite.isSpritesheet) {
            console.error("❌ Kein Sprite-Sheet vorhanden.");
            document.getElementById("ugc-container").innerHTML = "<p>Dieses UGC ist nicht animiert.</p>";
            return;
        }

        // Bild-URL & Animationseigenschaften extrahieren
        let spriteUrl = objEntry.sprite.image;
        if (spriteUrl.startsWith("//")) {
            spriteUrl = "https:" + spriteUrl;
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

        // Canvas für die Animation erstellen
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

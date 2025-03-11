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
        // JSON-Datei laden
        const response = await fetch("https://raw.githubusercontent.com/Shambhala222/pixelsugcviewer/main/ugc.json");
        const ugcData = await response.json();
        
        console.log("✅ JSON geladen, Hauptkategorien:", Object.keys(ugcData));

        // Prüfen, ob `items` und `objects` existieren
        if (!ugcData.items || !ugcData.objects) {
            console.error("❌ Die JSON enthält keine gültigen 'items' oder 'objects'.");
            document.getElementById("ugc-container").innerHTML = "<p>Fehlerhafte JSON-Struktur.</p>";
            return;
        }

        // UGC-Keys definieren
        const itmKey = `itm_ugc-${ugcId}`;
        const objKey = `obj_ugc-${ugcId}`;

        console.log("🔎 Suche in items nach:", itmKey);
        console.log("🔎 Suche in objects nach:", objKey);

        // `itm_ugc` in `items` suchen
        const itmEntry = ugcData.items[itmKey];
        if (!itmEntry) {
            console.error(`❌ ${itmKey} nicht in items gefunden.`);
            console.log("🔍 Verfügbare itm_ugc Keys:", Object.keys(ugcData.items).slice(0, 10)); // Zeigt die ersten 10 Einträge
            document.getElementById("ugc-container").innerHTML = "<p>Kein UGC gefunden.</p>";
            return;
        }

        // `obj_ugc` aus `placeObject` extrahieren, falls vorhanden
        let objEntry = null;
        if (itmEntry.onUse && itmEntry.onUse.placeObject) {
            objEntry = ugcData.objects[itmEntry.onUse.placeObject];
        }

        // **Bild-URL herausfinden**
        let spriteUrl = objEntry?.sprite?.image || itmEntry.image;
        if (!spriteUrl) {
            console.error("❌ Kein Bild gefunden für dieses UGC.");
            document.getElementById("ugc-container").innerHTML = "<p>Fehler: Kein Bild gefunden.</p>";
            return;
        }

        if (spriteUrl.startsWith("//")) {
            spriteUrl = "https:" + spriteUrl;
        }

        // **Überprüfen, ob UGC animiert ist oder nicht**
        const isSpritesheet = objEntry?.sprite?.isSpritesheet || false;
        const frameCount = objEntry?.sprite?.frames || 1; 
        const frameRate = objEntry?.sprite?.frameRate || 1;
        const frameWidth = objEntry?.sprite?.size?.width || 80;
        const frameHeight = objEntry?.sprite?.size?.height || 80;

        console.log("🎨 Sprite-URL:", spriteUrl);
        console.log("🖼 Frame-Größe:", frameWidth, "x", frameHeight);
        console.log("🎞 Frames:", frameCount);
        console.log("⏳ Framerate:", frameRate, "FPS");
        console.log("🖼 Ist ein SpriteSheet?", isSpritesheet);

        // **Container für das Bild erzeugen**
        const canvas = document.createElement("canvas");
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        document.getElementById("ugc-container").appendChild(canvas);

        const ctx = canvas.getContext("2d");
        const spriteImage = new Image();
        spriteImage.src = spriteUrl;

        if (isSpritesheet) {
            // **Falls das UGC animiert ist, abspielen**
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
            // **Falls das UGC nicht animiert ist, einfach anzeigen**
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

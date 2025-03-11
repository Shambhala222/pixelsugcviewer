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

        // Sicherstellen, dass `items` und `objects` existieren
        if (!ugcData.items || !ugcData.objects) {
            console.error("❌ Die JSON enthält keine gültigen 'items' oder 'objects'.");
            document.getElementById("ugc-container").innerHTML = "<p>Fehlerhafte JSON-Struktur.</p>";
            return;
        }

        // Korrekte Keys setzen
        const itmKey = `itm_ugc-${ugcId}`;
        const objKey = `obj_ugc-${ugcId}`;

        console.log("🔎 Suche in items nach:", itmKey);
        console.log("🔎 Suche in objects nach:", objKey);

        // `itm_ugc` in `items` suchen
        const itmEntry = ugcData.items[itmKey];
        if (!itmEntry) {
            console.error(`❌ ${itmKey} nicht in items gefunden.`);
            console.log("🔍 Verfügbare itm_ugc Keys:", Object.keys(ugcData.items).slice(0, 10));
            document.getElementById("ugc-container").innerHTML = "<p>Kein UGC gefunden.</p>";
            return;
        }

        // Prüfen, ob `placeObject` existiert
        if (!itmEntry.onUse || !itmEntry.onUse.placeObject) {
            console.error("❌ Keine placeObject-Verknüpfung für dieses itm_ugc.");
            document.getElementById("ugc-container").innerHTML = "<p>Kein animiertes UGC gefunden.</p>";
            return;
        }

        // `obj_ugc` in `objects` suchen
        const objEntry = ugcData.objects[itmEntry.onUse.placeObject];
        if (!objEntry) {
            console.error(`❌ ${objKey} nicht in objects gefunden.`);
            console.log("🔍 Verfügbare obj_ugc Keys:", Object.keys(ugcData.objects).slice(0, 10));
            document.getElementById("ugc-container").innerHTML = "<p>Dieses UGC hat keine Animation.</p>";
            return;
        }

        // **Überprüfen, ob UGC animiert ist oder nicht**
        const isSpritesheet = objEntry?.sprite?.isSpritesheet || false;
        const frameCount = objEntry?.sprite?.frames || 1; 
        const frameRate = objEntry?.sprite?.frameRate || 1;

        // **Breite & Höhe für animierte UGCs**
        let frameWidth = objEntry?.sprite?.size?.width;
        let frameHeight = objEntry?.sprite?.size?.height;

        // **Breite & Höhe für NICHT animierte UGCs aus `physics.size`**
        if (!isSpritesheet) {
            frameWidth = objEntry?.physics?.size?.width; // Falls undefined → Standardwert
            frameHeight = objEntry?.physics?.size?.height;
        }

        let imageUrl = objEntry?.sprite?.image || "";

        if (!imageUrl) {
            console.error("❌ Keine Bild-URL gefunden.");
            document.getElementById("ugc-container").innerHTML = "<p>Fehler: Kein Bild gefunden.</p>";
            return;
        }

        if (imageUrl.startsWith("//")) {
            imageUrl = "https:" + imageUrl;
        }

        console.log(`🎨 Image-URL: ${imageUrl}`);
        console.log(`🖼 Bildgröße: ${frameWidth} x ${frameHeight}`);
        console.log(`🎞 Frames: ${frameCount}`);
        console.log(`⏳ Framerate: ${frameRate} FPS`);

        // **Canvas erstellen**
        const canvas = document.createElement("canvas");
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        document.getElementById("ugc-container").innerHTML = ""; // Vorherige Inhalte löschen
        document.getElementById("ugc-container").appendChild(canvas);

        const ctx = canvas.getContext("2d");
        const spriteImage = new Image();
        spriteImage.src = imageUrl;

        if (isSpritesheet) {
            console.log("✅ Animation erkannt!");
            
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
            console.log("🖼 Statisches Bild erkannt!");
            
            spriteImage.onload = function () {
                ctx.drawImage(spriteImage, 0, 0, frameWidth, frameHeight);
            };
        }

    } catch (error) {
        console.error("❌ Fehler beim Laden der UGC JSON:", error);
        document.getElementById("ugc-container").innerHTML = "<p>Fehler beim Laden der Daten.</p>";
    }
});

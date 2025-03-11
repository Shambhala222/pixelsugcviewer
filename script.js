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

        // **Alle verfügbaren Keys anzeigen**
        console.log("🔎 JSON enthält folgende Haupt-Keys:", Object.keys(ugcData));

        // **itm_ugc suchen**
        const itmKey = `itm_ugc-${ugcId}`;
        console.log("🔎 Suche nach itm_ugc:", itmKey);
        const itmEntry = ugcData[itmKey];

        if (!itmEntry) {
            console.error(`❌ itm_ugc nicht gefunden: ${itmKey}`);
            console.log("🔍 Verfügbare itm_ugc Keys:", Object.keys(ugcData).filter(key => key.startsWith("itm_ugc")));
            document.getElementById("ugc-container").innerHTML = "<p>Kein passendes itm_ugc gefunden.</p>";
            return;
        }

        console.log("✅ itm_ugc gefunden:", itmEntry);

        // **obj_ugc suchen**
        const objKey = itmEntry.onUse?.placeObject || "";
        console.log("🔎 Suche nach obj_ugc:", objKey);
        const objEntry = ugcData[objKey];

        if (!objEntry) {
            console.warn(`⚠️ obj_ugc nicht gefunden für ${objKey}, es könnte statisch sein.`);
        } else {
            console.log("✅ obj_ugc gefunden:", objEntry);
        }

        // **Bild-URL ermitteln**
        let spriteUrl = objEntry?.sprite?.image || itmEntry?.image;
        if (!spriteUrl) {
            console.error("❌ Kein Bild gefunden für dieses UGC.");
            document.getElementById("ugc-container").innerHTML = "<p>Fehler: Kein Bild gefunden.</p>";
            return;
        }

        if (spriteUrl.startsWith("//")) {
            spriteUrl = "https:" + spriteUrl;
        }

        // **Animationseigenschaften**
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

        // **Canvas erzeugen**
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

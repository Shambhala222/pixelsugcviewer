document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    let ugcId = params.get("ugc");

    if (!ugcId) {
        console.warn("⚠️ Keine UGC-ID übergeben.");
        document.getElementById("ugc-container").innerHTML = "<p>Kein UGC ausgewählt.</p>";
        return;
    }

    console.log("🔍 Gesuchte UGC-ID:", ugcId);

    const itmKey = `itm_ugc-${ugcId}`;
    const objKey = `obj_ugc-${ugcId}`;

    try {
        // **1️⃣ JSON abrufen**
        const response = await fetch("https://raw.githubusercontent.com/Shambhala222/pixelsugcviewer/main/ugc.json");
        const ugcData = await response.json();

        console.log("✅ JSON geladen, Gesamtanzahl UGCs:", Object.keys(ugcData).length);

        // **2️⃣ Suche nach itm_ugc-**
        const itmEntry = ugcData[itmKey];
        if (!itmEntry) {
            console.error("❌ itm_ugc nicht gefunden:", itmKey);
            document.getElementById("ugc-container").innerHTML = "<p>Kein UGC gefunden.</p>";
            return;
        }

        let objEntry = null;
        let spriteUrl = null;
        let frameCount = 1;
        let frameRate = 1;
        let frameWidth = 80;
        let frameHeight = 80;

        // **3️⃣ Falls animiert, suche obj_ugc-**
        if (itmEntry.onUse && itmEntry.onUse.placeObject) {
            objEntry = ugcData[itmEntry.onUse.placeObject];
        }

        // **4️⃣ Animierte UGCs → Sprite-Sheet verwenden**
        if (objEntry && objEntry.sprite && objEntry.sprite.isSpritesheet) {
            spriteUrl = objEntry.sprite.image.startsWith("//") ? "https:" + objEntry.sprite.image : objEntry.sprite.image;
            frameCount = objEntry.sprite.frames;
            frameRate = objEntry.sprite.frameRate;
            frameWidth = objEntry.sprite.size.width;
            frameHeight = objEntry.sprite.size.height;

            console.log("✅ Animation gefunden!", spriteUrl, frameCount, frameRate, frameWidth, frameHeight);

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
        }
        // **5️⃣ Nicht-animierte UGCs → Einfach nur das Bild anzeigen**
        else {
            spriteUrl = itmEntry.image.startsWith("//") ? "https:" + itmEntry.image : itmEntry.image;

            console.log("🖼 Kein animiertes UGC, zeige statisches Bild:", spriteUrl);

            const imgElement = document.createElement("img");
            imgElement.src = spriteUrl;
            imgElement.style.maxWidth = "100%";
            imgElement.style.height = "auto";
            document.getElementById("ugc-container").appendChild(imgElement);
        }

    } catch (error) {
        console.error("❌ Fehler beim Laden der UGC JSON:", error);
        document.getElementById("ugc-container").innerHTML = "<p>Fehler beim Laden der Daten.</p>";
    }
});

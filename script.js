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

        if (!ugcData.items || !ugcData.objects) {
            console.error("❌ Die JSON enthält keine gültigen 'items' oder 'objects'.");
            document.getElementById("ugc-container").innerHTML = "<p>Fehlerhafte JSON-Struktur.</p>";
            return;
        }

        const itmKey = `itm_ugc-${ugcId}`;
        const objKey = `obj_ugc-${ugcId}`;

        console.log("🔎 Suche in items nach:", itmKey);
        console.log("🔎 Suche in objects nach:", objKey);

        const itmEntry = ugcData.items[itmKey];
        if (!itmEntry) {
            console.error(`❌ ${itmKey} nicht in items gefunden.`);
            document.getElementById("ugc-container").innerHTML = "<p>Kein UGC gefunden.</p>";
            return;
        }

        if (!itmEntry.onUse || !itmEntry.onUse.placeObject) {
            console.error("❌ Keine placeObject-Verknüpfung für dieses itm_ugc.");
            document.getElementById("ugc-container").innerHTML = "<p>Kein animiertes UGC gefunden.</p>";
            return;
        }

        const objEntry = ugcData.objects[itmEntry.onUse.placeObject];
        if (!objEntry) {
            console.error(`❌ ${objKey} nicht in objects gefunden.`);
            document.getElementById("ugc-container").innerHTML = "<p>Dieses UGC existiert nicht.</p>";
            return;
        }

        const isSpritesheet = objEntry?.sprite?.isSpritesheet || false;
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

        // **Container leeren**
        document.getElementById("ugc-container").innerHTML = "";

        // **Skalierungsfaktor setzen**
        let scaleFactor = 1.1; // 🔥 Ändere diesen Wert, um das Bild zu vergrößern/verkleinern

        if (isSpritesheet) {
            console.log("✅ Animation erkannt!");

            let frameCount = objEntry?.sprite?.frames || 1; 
            const frameRate = objEntry?.sprite?.frameRate || 1;
            const frameWidth = objEntry?.sprite?.size?.width;
            const frameHeight = objEntry?.sprite?.size?.height;

            console.log(`🖼 Frame-Größe: ${frameWidth} x ${frameHeight}`);
            console.log(`🎞 Frames (aus JSON): ${frameCount}`);
            console.log(`⏳ Framerate: ${frameRate} FPS`);

            // **Canvas für animierte Sprites**
            const canvas = document.createElement("canvas");
            canvas.width = frameWidth * scaleFactor;
            canvas.height = frameHeight * scaleFactor;
            document.getElementById("ugc-container").appendChild(canvas);

            const ctx = canvas.getContext("2d");
            const spriteImage = new Image();
            spriteImage.src = imageUrl;

            spriteImage.onload = function () {
                const totalImageWidth = spriteImage.width;
                const totalImageHeight = spriteImage.height;

                console.log(`📏 Gesamte Bildgröße: ${totalImageWidth} x ${totalImageHeight}`);

                const framesPerRow = Math.floor(totalImageWidth / frameWidth);
                let totalRows = Math.ceil(frameCount / framesPerRow);

                if (totalImageHeight === frameHeight || totalRows === 1) {
                    totalRows = 1;
                }

                const calculatedFrames = framesPerRow * totalRows;
                if (calculatedFrames < frameCount) {
                    console.warn(`⚠️ Fehlerhafte Frames erkannt! JSON sagt ${frameCount}, Bild hat aber nur ${calculatedFrames}.`);
                    frameCount = calculatedFrames;
                }

                let currentFrame = 0;
                let lastFrameTime = performance.now();

                function animateSprite(timestamp) {
                    const delta = timestamp - lastFrameTime;

                    if (delta >= 1000 / frameRate) {
                        ctx.clearRect(0, 0, frameWidth * scaleFactor, frameHeight * scaleFactor);

                        const col = currentFrame % framesPerRow;
                        const sx = col * frameWidth;

                        ctx.drawImage(spriteImage, sx, 0, frameWidth, frameHeight, 
                            0, 0, frameWidth * scaleFactor, frameHeight * scaleFactor);
                        currentFrame = (currentFrame + 1) % frameCount;
                        lastFrameTime = timestamp;
                    }

                    requestAnimationFrame(animateSprite);
                }

                requestAnimationFrame(animateSprite);
            };

        } else {
            console.log("🖼 Statisches Bild erkannt!");

            // **Direkt ein `<img>`-Tag verwenden für statische Bilder**
            const imgElement = document.createElement("img");
            imgElement.src = imageUrl;
            imgElement.style.display = "block";
            imgElement.style.margin = "0 auto";
            imgElement.style.border = "1px solid black";
            imgElement.style.width = "auto";
            imgElement.style.height = "auto";
            imgElement.style.transform = `scale(${scaleFactor})`; // **Skalierung für statische Bilder**
            document.getElementById("ugc-container").appendChild(imgElement);
        }

        // **DRAG & DROP FUNKTIONALITÄT**
        enableDragAndDrop();

    } catch (error) {
        console.error("❌ Fehler beim Laden der UGC JSON:", error);
        document.getElementById("ugc-container").innerHTML = "<p>Fehler beim Laden der Daten.</p>";
    }
});

// **Drag & Drop Funktion**
function enableDragAndDrop() {
    const container = document.getElementById("ugc-container");
    let offsetX, offsetY, isDragging = false;

    container.style.position = "absolute";
    container.style.cursor = "grab";
    container.style.userSelect = "none";

    container.addEventListener("mousedown", function (e) {
        isDragging = true;
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;
        container.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", function (e) {
        if (!isDragging) return;
        container.style.left = `${e.clientX - offsetX}px`;
        container.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", function () {
        isDragging = false;
        container.style.cursor = "grab";
    });
}

// Sélection des éléments DOM
const inputElement = document.querySelector('#release');
const outputElement = document.querySelector('#out');

/**
* Fonction principale de parsing de la release
* @param {string} name - Le nom de la release brut
* @returns {string} - Le nom parsé et formaté
*/
function parseReleaseName(name)
{
    if (!name) {
        return ""; // Gère le cas où l'input est vidé
    }

    let baseName = name;
    let extension = '';

    // 1. Isoler l'extension (ex: .mkv)
    const lastDotIndex = name.lastIndexOf('.');
    // Heuristique simple : l'extension est courte et à la fin
    if (lastDotIndex > -1 && lastDotIndex > name.length - 6) { 
        baseName = name.substring(0, lastDotIndex);
        extension = name.substring(lastDotIndex);
    }

    // 2. Supprimer la team (ex: -ROMKENT, -LAZARUS)
    // Cible un trait d'union suivi de caractères à la fin du nom de base
    baseName = baseName.replace(/-[\w\d]+$/i, '');

    // 3. Remplacer les . par des espaces
    baseName = baseName.replace(/\./g, ' ');

    // 4. Supprimer les mots clés (Bluray, etc.)
    // \b = "word boundary" (frontière de mot) pour ne pas affecter "BlurayRip"
    // 'gi' = global (tous) et insensible à la casse
    baseName = baseName.replace(/\b(Bluray|blu-Ray)\b/gi, '');

    // 5. Standardiser les résolutions (1080P/1080i -> 1080p)
    // (2160|1080|720) = capture le nombre ($1)
    // [Pi] = P ou i
    baseName = baseName.replace(/\b(2160|1080|720)[Pi]\b/gi, '$1p');

    // 6. Standardiser WEB/WEBDL -> WEBRip
    // WEB-?DL gère "WEBDL" et "WEB-DL"
    baseName = baseName.replace(/\b(WEB|WEB-?DL)\b/gi, 'WEBRip');

    // 7. Standardiser les codecs (H264/X264 -> h264/x264, x 264 -> x264)
    // Remplace les codecs majuscules en minuscules
    baseName = baseName.replace(/\b(H264|H265|X264|X265)\b/gi, (match) => match.toLowerCase());
    // Gère "x 264" -> "x264"
    baseName = baseName.replace(/\b(x)\s(264|265)\b/gi, '$1$2'); 

    // 8. Cas spécial pour 'i' (MULTI -> MULTi)
    // 'g' = global, mais pas 'i' (insensible à la casse) car on cible spécifiquement les majuscules
    baseName = baseName.replace(/\b(MULTI|VFI)\b/g, (match) => {
            // Remplace la dernière lettre par 'i'
            return match.substring(0, match.length - 1) + 'i';
    });

    // 9. Nettoyer les espaces multiples (créés par les remplacements)
    baseName = baseName.replace(/\s{2,}/g, ' '); // Remplace 2 espaces ou plus par un seul
    baseName = baseName.trim(); // Enlève les espaces au début/fin

    // 10. Ré-assembler le nom de base et l'extension
    return baseName + extension;
}

// Ajout de l'écouteur d'événement 'input'
if (inputElement && outputElement) {
    inputElement.addEventListener('input', function() {
        // Récupère la valeur actuelle de l'input
        const rawText = this.value;

        // Appelle la fonction de parsing
        const parsedText = parseReleaseName(rawText);

        // Met à jour le contenu de la balise <pre>
        // .textContent est préférable pour afficher du texte (évite l'interprétation HTML)
        outputElement.textContent = parsedText;
    });
}

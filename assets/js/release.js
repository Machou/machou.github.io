const inputElement = document.querySelector('#release');
const outputElement = document.querySelector('#out');

function parseReleaseName(name)
{
    if (!name) {
        return ""; // Gère le cas où l'input est vidé
    }

    let baseName = name;
    let extension = '';

    // 1. Isoler l'extension (ex: .mkv)
    const lastDotIndex = name.lastIndexOf('.');

    if (lastDotIndex > -1 && lastDotIndex > name.length - 6) {
        baseName = name.substring(0, lastDotIndex);
        extension = name.substring(lastDotIndex);
    }

    // 2. Supprimer la team
    baseName = baseName.replace(/-[\w\d]+$/i, '');

    // 3. Remplacer les . par des espaces
    baseName = baseName.replace(/\./g, ' ');

    // 4. Supprimer les mots clés
    baseName = baseName.replace(/\b(bluray|blu-ray|blu ray)\b/gi, '');

    // 5. Standardiser les résolutions
    baseName = baseName.replace(/\b(2160|1080|720)[Pi]\b/gi, '$1p');

    // 6. Standardiser WEB/WEBDL -> WEBRip
    baseName = baseName.replace(/\b(WEB|WEB-?DL)\b/gi, 'WEBRip');

    // 7. Standardiser les codecs (H264/X264 -> h264/x264, x 264 -> x264)
    // Remplace les codecs majuscules en minuscules
    baseName = baseName.replace(/\b(H264|H265|X264|X265)\b/gi, (match) => match.toLowerCase());
    baseName = baseName.replace(/\b(x)\s(264|265)\b/gi, '$1$2');

    // 8. Cas spécial pour 'i' (MULTI -> MULTi)
    baseName = baseName.replace(/\b(MULTI|VFI)\b/g, (match) => {
        return match.substring(0, match.length - 1) + 'i';
    });

    // 9. Nettoyer les espaces multiples (créés par les remplacements)
    baseName = baseName.replace(/\s{2,}/g, ' ');
    baseName = baseName.trim();

    // 10. Ré-assembler le nom de base et l'extension
    return baseName + extension;
}

if (inputElement && outputElement) {
    inputElement.addEventListener('input', function() {
        const rawText = this.value;
        const parsedText = parseReleaseName(rawText);

        outputElement.textContent = parsedText;
    });
}

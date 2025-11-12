const inputElement = document.querySelector('#release');
const outputElement = document.querySelector('#out');

function parseReleaseName(name)
{
    if (!name) { return ""; }

    let baseName = name;
    let extension = '';

    const lastDotIndex = name.lastIndexOf('.'); // Isoler l'extension (ex: .mkv)

    if (lastDotIndex > -1 && lastDotIndex > name.length - 6) {
        baseName = name.substring(0, lastDotIndex);
        extension = name.substring(lastDotIndex);
    }

    baseName = baseName.replace(/-[\w\d]+$/i, ''); // Supprimer la team

    baseName = baseName.replace(/(\d)\.(\d)/g, '$1<DECIMAL_DOT>$2'); // Protéger les points décimaux (ex: 2.0) avant le remplacement global

    baseName = baseName.replace(/\./g, ' '); // Remplacer les . par des espaces

    baseName = baseName.replace(/\b(WEB-?DL|WEB)\b/gi, 'WEBRip'); // L'ordre est important : WEB-?DL doit être vérifié AVANT WEB.

    // Standardiser les codecs (H.264 -> h264) et WEBRip (WEB-DL -> WEBRip)
    baseName = baseName.replace(/\b(H|x)\.?\s?(264|265)\b/gi, (match, p1, p2) => {
        return p1.toLowerCase() + p2;
    });

    baseName = baseName.replace(/\./g, ' '); // Remplacer les . (séparateurs) restants par des espaces

    baseName = baseName.replace(/<DECIMAL_DOT>/g, '.'); // Restaurer les points décimaux

    baseName = baseName.replace(/\b(bluray|blu-ray|blu ray)\b/gi, ''); // Supprimer les mots clés (Bluray, etc.)

    baseName = baseName.replace(/\b(2160|1080|720)[Pi]\b/gi, '$1p'); // Standardiser les résolutions (1080P/1080i -> 1080p)

    // 9. Cas spécial pour 'i' (MULTI -> MULTi)
    baseName = baseName.replace(/\b(MULTI|VFI)\b/g, (match) => {
        return match.substring(0, match.length - 1) + 'i';
    });

    baseName = baseName.replace(/\s{2,}/g, ' ');
    baseName = baseName.trim();

    return baseName + extension;
}

if (inputElement && outputElement) {
    inputElement.addEventListener('input', function() {
        const rawText = this.value;
        const parsedText = parseReleaseName(rawText);

        outputElement.textContent = parsedText;
    });
}
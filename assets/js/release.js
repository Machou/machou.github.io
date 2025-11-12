const inputElement = document.querySelector('#release');
const outputElement = document.querySelector('#out');

/**
 * Fonction principale de parsing de la release
 * @param {string} name - Le nom de la release brut
 * @returns {string} - Le nom parsé et formaté
 */
function parseReleaseName(name) {
    if (!name) return "";

    let baseName = name;
    let extension = '';

    // 1. Isoler l'extension
    const lastDotIndex = name.lastIndexOf('.');
    if (lastDotIndex > -1 && lastDotIndex > name.length - 6) { 
        baseName = name.substring(0, lastDotIndex);
        extension = name.substring(lastDotIndex);
    }

    // 2. Supprimer la team
    baseName = baseName.replace(/-[\w\d]+$/i, '');

    // 3. Protéger les points décimaux (ex: 2.0)
    baseName = baseName.replace(/(\d)\.(\d)/g, '$1<DECIMAL_DOT>$2');
    
    // 4. Standardiser les codecs (H.264 -> h264) et WEBRip (WEB-DL -> WEBRip)
    baseName = baseName.replace(/\b(H|x)\.?\s?(264|265)\b/gi, (match, p1, p2) => {
        return p1.toLowerCase() + p2;
    });
    baseName = baseName.replace(/\b(WEB-?DL|WEB)\b/gi, 'WEBRip');

    // 5. Remplacer les . (séparateurs) restants par des espaces
    baseName = baseName.replace(/\./g, ' ');

    // 6. Restaurer les points décimaux
    baseName = baseName.replace(/<DECIMAL_DOT>/g, '.');

    // 7. Supprimer les mots clés (Bluray, etc.)
    baseName = baseName.replace(/\b(Bluray|blu-Ray)\b/gi, '');

    // 8. Standardiser les résolutions
    baseName = baseName.replace(/\b(2160|1080|720)[Pi]\b/gi, '$1p');

    // 9. Cas spécial pour 'i' (MULTI -> MULTi) - [MODIFIÉ: insensible à la casse]
    // 'gi' = global et insensible à la casse
    baseName = baseName.replace(/\b(MULTI|VFI)\b/gi, (match) => {
        // Remplace la dernière lettre par 'i'
        return match.substring(0, match.length - 1).toUpperCase() + 'i';
    });

    // *** NOUVELLE ÉTAPE ***
    // 10. Réorganiser la langue pour la placer après l'année/épisode
    const langList = 'MULTi|VFi|VFF|TRUEFRENCH|FRENCH|VOF|SUBFRENCH|VOSTFR';
    // (?:...) est un groupe non-capturant
    // $1 = Ancre (Année/Épisode), $2 = Milieu, $3 = Langue
    const reorderRegex = new RegExp(
        '(\\b(?:S\\d{1,2}E\\d{1,2}|(?:19|20)\\d{2})\\b)' + // $1: Ancre
        '(.*?)' +                                                                         // $2: Milieu
        '(\\b(?:' + langList + ')\\b)',                              // $3: Langue
        'i' // 'i' = insensible à la casse (pour FRENCH vs french)
    );

    if (baseName.match(reorderRegex)) {
        // Remplacement : $1 (Ancre) + Espace + $3 (Langue) + $2 (Milieu)
        baseName = baseName.replace(reorderRegex, '$1 $3 $2');
    }

    // 11. Nettoyer les espaces multiples (anciennement étape 10)
    baseName = baseName.replace(/\s{2,}/g, ' ');
    baseName = baseName.trim(); 

    // 12. Ré-assembler le nom de base et l'extension (anciennement étape 11)
    return baseName + extension;
}

if (inputElement && outputElement) {
    inputElement.addEventListener('input', function() {
        const rawText = this.value;
        const parsedText = parseReleaseName(rawText);

        outputElement.textContent = parsedText;
    });
}
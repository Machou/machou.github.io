const inputElement = document.querySelector('#release');
const outputElement = document.querySelector('#out');

function parseReleaseName(name)
{
        if (!name) {
            return "";
        }

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

        // 3. Protéger les points décimaux (UNIQUEMENT pour l'audio)
        // C'EST LA CORRECTION CRUCIALE.
        baseName = baseName.replace(/(AAC|AC3|DTS)(\d)\.(\d)/gi, '$1$2<DECIMAL_DOT>$3');
        
        // 4. Standardiser les codecs (H.264 -> h264) et WEBRip (WEB-DL -> WEBRip)
        baseName = baseName.replace(/\b(H|x)\.?\s?(264|265)\b/gi, (match, p1, p2) => {
            return p1.toLowerCase() + p2;
        });
        baseName = baseName.replace(/\b(WEB-?DL|WEB)\b/gi, 'WEBRip');

        // 5. Remplacer les . (séparateurs) restants par des espaces
        // Le point de 'S01E10.1080p' sera remplacé ici.
        baseName = baseName.replace(/\./g, ' ');

        // 6. Restaurer les points décimaux (ex: AAC2.0)
        baseName = baseName.replace(/<DECIMAL_DOT>/g, '.');

        // 7. Supprimer les mots clés (Bluray, etc.)
        baseName = baseName.replace(/\b(bluray|blu-ray|blu ray)\b/gi, '');

        // 8. Standardiser les résolutions
        baseName = baseName.replace(/\b(2160|1080|720)[Pi]\b/gi, '$1p');

        // 9. Cas spécial pour 'i' (MULTI -> MULTi)
        // (Corrigé pour gérer 'multi', 'MULTI' ou 'MULTi' en entrée)
        baseName = baseName.replace(/\b(MULTI|VFI)\b/gi, (match) => {
            return match.toUpperCase().substring(0, match.length - 1) + 'i';
        });

        // 10. Réorganiser la langue pour la placer après l'année/épisode
        const langList = 'MULTi|VFi|VFF|TRUEFRENCH|FRENCH|VOF|SUBFRENCH|VOSTFR';
        const reorderRegex = new RegExp(
            '(\\b(?:S\\d{1,2}E\\d{1,2}|(?:19|20)\\d{2})\\b)' +  // $1: Ancre
            '(.*?)' +                                           // $2: Milieu
            '(\\b(?:' + langList + ')\\b)',                     // $3: Langue
            'i'                                                 // 'i' = insensible à la casse
        );

        if (baseName.match(reorderRegex)) {
            baseName = baseName.replace(reorderRegex, '$1 $3 $2');
        }

        // 11. Nettoyer les espaces multiples
        baseName = baseName.replace(/\s{2,}/g, ' ');
        baseName = baseName.trim();

        // 12. Ré-assembler le nom de base et l'extension
        return baseName + extension;
}

if (inputElement && outputElement) {
    inputElement.addEventListener('input', function() {
        const rawText = this.value;
        const parsedText = parseReleaseName(rawText);

        outputElement.textContent = parsedText;
    });
}
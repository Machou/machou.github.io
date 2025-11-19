

const inputElement = document.querySelector('#release');
const outputElement = document.querySelector('#out');

function parseReleaseName(name)
{
    if (!name) { return ""; }

    let baseName = name;
    let extension = '';

    // On cherche une ou plusieurs extensions classiques à la fin (.mkv, .mp4, .avi)
    const extMatch = baseName.match(/(\.(mkv|mp4|avi|srt|sub))+$/i);

    if (extMatch) {
        // On coupe tout ce qui ressemble à des extensions à la fin
        baseName = baseName.substring(0, extMatch.index);

        // On ne garde que la première extension trouvée (ex: .mkv) pour la fin
        extension = extMatch[0].match(/\.\w{3,4}$/)[0].toLowerCase();
    }

    // Supprime la team collée avec un tiret (ex: -mHDgz)
    baseName = baseName.replace(/-[a-zA-Z0-9]+$/i, '');

    // Protège les points décimaux pour l'audio (ex: 5.1) et les codecs (H.264)
    baseName = baseName.replace(/(AAC|AC3|DTS)(\d)\.(\d)/gi, '$1$2<DECIMAL_DOT>$3');
    baseName = baseName.replace(/\b(H|x)\.(264|265)\b/gi, '$1<DOT>$2');

    // Nettoyage global (Points ET Parenthèses -> Espaces)
    baseName = baseName.replace(/[().]/g, ' ');

    // Restauration des points protégés
    baseName = baseName.replace(/<DECIMAL_DOT>/g, '.');
    baseName = baseName.replace(/<DOT>/g, '.');

    // Standardise les codecs (H.264 -> h264)
    baseName = baseName.replace(/\b(H|x)\.?\s?(264|265)\b/gi, (match, p1, p2) => {
        return p1.toLowerCase() + p2;
    });

    // Standardise WEBRip
    baseName = baseName.replace(/\b(WEB-?DL|WEB)\b/gi, 'WEBRip');

    // Supprime les mots clés inutiles
    baseName = baseName.replace(/\b(bluray|blu-ray|blu ray)\b/gi, '');

    // Standardise les résolutions
    baseName = baseName.replace(/\b(2160|1080|720)[Pi]\b/gi, '$1p');

    const langList = 'MULTi|VFi|VFF|TRUEFRENCH|FRENCH|FR|VOF|SUBFRENCH|VOSTFR';
    const reorderRegex = new RegExp('(\\b(?:S\\d{1,2}E\\d{1,2}|(?:19|20)\\d{2})\\b)' + '(.*?)' + '(\\b(?:' + langList + ')\\b)','i');

    if (baseName.match(reorderRegex)) {
        baseName = baseName.replace(reorderRegex, (match, p1, p2, p3) => {
            let lang = p3.toUpperCase();

            if (lang === 'FR') { lang = 'FRENCH'; }

            if (['MULTI', 'VFI'].includes(lang)) {
                lang = lang.slice(0, -1) + 'i';
            }

            return `${p1} ${lang} ${p2}`;
        });
    }

    // Nettoyer les espaces multiples et trim
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
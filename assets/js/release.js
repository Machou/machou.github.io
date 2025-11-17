
const inputElement = document.querySelector('#release');
const outputElement = document.querySelector('#out');

function parseReleaseName(name)
{
    if (!name) { return ""; }

    let baseName = name;
    let extension = '';

    const lastDotIndex = name.lastIndexOf('.');
    if (lastDotIndex > -1 && lastDotIndex > name.length - 6) {
        baseName = name.substring(0, lastDotIndex);
        extension = name.substring(lastDotIndex);
    }

    // Supprime la team
    baseName = baseName.replace(/-[\w\d]+$/i, '');

    // Protège les points décimaux pour l'audio (ex: 5.1) et les codecs (H.264)
    baseName = baseName.replace(/(AAC|AC3|DTS)(\d)\.(\d)/gi, '$1$2<DECIMAL_DOT>$3');
    // On protège aussi temporairement le H.264/265 pour éviter qu'il soit coupé par le nettoyage des points
    baseName = baseName.replace(/\b(H|x)\.(264|265)\b/gi, '$1<DOT>$2');

    // On remplace les points et les parenthèses par des espaces
    baseName = baseName.replace(/[().]/g, ' ');

    // Restauration des points protégés
    baseName = baseName.replace(/<DECIMAL_DOT>/g, '.');
    baseName = baseName.replace(/<DOT>/g, '.'); // Restaure le point du H.264 si présent

    // Standardise les codecs (H.264 -> h264)
    baseName = baseName.replace(/\b(H|x)\.?\s?(264|265)\b/gi, (match, p1, p2) => {
        return p1.toLowerCase() + p2;
    });

    // Standardise WEBRip (WEB-DL -> WEBRip)
    baseName = baseName.replace(/\b(WEB-?DL|WEB)\b/gi, 'WEBRip');

    // Supprime les mots clés inutiles
    baseName = baseName.replace(/\b(bluray|blu-ray|blu ray)\b/gi, '');

    // Standardise les résolutions
    baseName = baseName.replace(/\b(2160|1080|720)[Pi]\b/gi, '$1p');

    // --- CORRECTION 2 : Réorganisation et Majuscule ---
    const langList = 'MULTi|VFi|VFF|TRUEFRENCH|FRENCH|VOF|SUBFRENCH|VOSTFR';
    const reorderRegex = new RegExp(
        '(\\b(?:S\\d{1,2}E\\d{1,2}|(?:19|20)\\d{2})\\b)' +  // $1: Ancre (Année ou SxxExx)
        '(.*?)' +                                           // $2: Milieu (ce qu'il y a entre l'ancre et la langue)
        '(\\b(?:' + langList + ')\\b)',                     // $3: Langue
        'i'
    );

    if (baseName.match(reorderRegex)) {
        baseName = baseName.replace(reorderRegex, (match, p1, p2, p3) => {
            // p1 = Année/Episode, p2 = Milieu, p3 = Langue
            let lang = p3.toUpperCase();

            // Cas spécial pour MULTi et VFi (garder le 'i' minuscule si on veut être puriste, ou tout majuscule selon ton choix)
            // Ici je force le standard : MULTI -> MULTi
            if (['MULTI', 'VFI'].includes(lang)) {
                lang = lang.slice(0, -1) + 'i';
            }

            return `${p1} ${lang} ${p2}`;
        });
    }

    // Nettoyer les espaces multiples résiduels
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
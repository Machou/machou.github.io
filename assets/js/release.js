const inputElement = document.querySelector('#release');
const outputElement = document.querySelector('#out');

function parseReleaseName(name)
{
    if (!name) { return ""; }

    let baseName = name.trim();
    let extension = "";

    // Extensions en fin (.mkv, .mp4, .avi, .srt, .sub) - on garde la dernière
    const extMatch = baseName.match(/(\.(mkv|mp4|avi|srt|sub))+$/i);
    if (extMatch) {
        baseName = baseName.substring(0, extMatch.index);
        const lastExt = extMatch[0].match(/\.(mkv|mp4|avi|srt|sub)$/i);
        extension = lastExt ? lastExt[0].toLowerCase() : "";
    }

    // Supprime la team collée avec un tiret (cas classique)
    baseName = baseName.replace(/-[a-z0-9]+$/i, "");

    // Protéger les canaux audio: 5.1 / 7.1 / 2.0 / 1.0 etc (EAC3.5.1, DTS.5.1, "5.1" isolé, etc.)
    baseName = baseName.replace(/\b(\d{1,2})\.(\d)\b/g, "$1<DECIMAL_DOT>$2");

    // Protéger H.264 / H.265 / x.264 / x.265 (si jamais)
    baseName = baseName.replace(/\b(H|x)\.(264|265)\b/gi, "$1<DOT>$2");

    // Nettoyage global (Points + Parenthèses -> Espaces)
    baseName = baseName.replace(/[().]/g, " ");

    // Restauration des points protégés
    baseName = baseName.replace(/<DECIMAL_DOT>/g, ".");
    baseName = baseName.replace(/<DOT>/g, ".");

    // "10 bits" -> "10bits" (ex: "10.bits" devient "10 bits" après nettoyage)
    baseName = baseName.replace(/\b(\d{1,2})\s*bits?\b/gi, "$1bits");

    // Standardise codecs vidéo: H.264 / x 264 / x264 -> x264 ; pareil pour 265
    baseName = baseName.replace(/\b(H|x)\.?\s?(264|265)\b/gi, (match, p1, p2) => {
        return p1.toLowerCase() + p2;
    });

    // Standardise WEBRip
    baseName = baseName.replace(/\bWEB(?:\s|-)?RIP\b|\bWEB(?:\s|-)?DL\b|\bWEBDL\b|\bWEB\b/gi, "WEBRip");

    // Supprime mots clés inutiles
    baseName = baseName.replace(/\b(bluray|blu-ray|blu ray)\b/gi, "");

    // Standardise résolutions 1080P / 1080i etc.
    baseName = baseName.replace(/\b(2160|1080|720)[Pi]\b/gi, "$1p");

    const langList = "MULTi|VFi|VFF|TRUEFRENCH|FRENCH|FR|VOF|SUBFRENCH|VOSTFR";
    const reorderRegex = new RegExp(
        "(\\b(?:S\\d{1,2}E\\d{1,2}|(?:19|20)\\d{2})\\b)(.*?)(\\b(?:" + langList + ")\\b)",
        "i"
    );

    if (baseName.match(reorderRegex)) {
        baseName = baseName.replace(reorderRegex, (match, p1, p2, p3) => {
            let lang = p3.toUpperCase();

            if (lang === "FR") { lang = "FRENCH"; }

            if (["MULTI", "VFI"].includes(lang)) {
                lang = lang.slice(0, -1) + "i";
            }

            return `${p1} ${lang} ${p2}`;
        });
    }

    // Nettoyage final des espaces
    baseName = baseName.replace(/\s{2,}/g, " ").trim();

    // Suppression team "sans -" (heuristique)
    const tokens = baseName.split(" ").filter(Boolean);
    if (tokens.length > 1) {
        const last = tokens[tokens.length - 1];

        const allowedLast = new Set([
            "x264", "x265", "h264", "h265", "av1", "hevc",
            "WEBRip", "1080p", "720p", "2160p",
            "FRENCH", "TRUEFRENCH", "VOSTFR", "SUBFRENCH", "VFi", "VFF", "MULTi", "VOF",
            "EAC3", "AC3", "AAC", "DTS", "DDP"
        ]);

        const looksLikeTeam =
            /^[A-Za-z0-9]{3,}$/.test(last) &&           // token "propre"
            !/^(19|20)\d{2}$/.test(last) &&             // pas une année
            !allowedLast.has(last) &&                   // pas un tag attendu
            /[A-Za-z]/.test(last) &&                    // contient des lettres
            (/[A-Z]/.test(last) || /[a-z]/.test(last)); // souvent mix/case

        if (looksLikeTeam) {
            tokens.pop();
            baseName = tokens.join(" ");
        }
    }

    return baseName + extension;
}

if (inputElement && outputElement) {
    inputElement.addEventListener('input', function() {
        const rawText = this.value;
        const parsedText = parseReleaseName(rawText);
        outputElement.textContent = parsedText;
    });
}
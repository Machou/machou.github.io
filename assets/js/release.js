function titleCase(str) {
    const smallWords = new Set([
        "a", "an", "and", "as", "at", "but", "by",
        "de", "du", "des", "d'", "de la", "de los", "de las",
        "da", "das", "do", "dos", "der", "den", "die", "el",
        "en", "et", "for", "from", "in", "la", "le", "les",
        "of", "on", "or", "the", "to", "und", "von", "vs", "with"
    ]);
    const words = str.trim().split(/\s+/);
    return words.map((w, i) => {
        const lw = w.toLowerCase();
        if (i !== 0 && (smallWords.has(lw) || lw.endsWith("'"))) return lw;
        if (/^\d+$/.test(w)) return w;
        return w.replace(
            /^([a-zàâäçéèêëîïôöùûüÿœ])|([-'’][a-zàâäçéèêëîïôöùûüÿœ])/gi,
            s => s.toUpperCase()
        );
    }).join(" ");
}

function normalizeTokens(tokens) {
    return tokens.map((t) => {
        // Résolutions
        if (/^2160p$/i.test(t)) return "2160p";
        if (/^1080p$/i.test(t)) return "1080p";
        if (/^720p$/i.test(t)) return "720p";

        // Codecs vidéo
        if (/^h\.?265$/i.test(t)) return "h265";
        if (/^h\.?264$/i.test(t)) return "h264";
        if (/^x265$/i.test(t)) return "x265";
        if (/^x264$/i.test(t)) return "x264";

        // Source: tout devient WEBRip (web, webdl, web-dl, webrip)
        if (/^web(rip)?$/i.test(t)) return "WEBRip";
        if (/^web-?dl$/i.test(t)) return "WEBRip";
        if (/^we?bdl$/i.test(t)) return "WEBRip"; // tolère "webdl"/"wdl" rares

        // BluRay
        if (/^blu[- ]?ray$/i.test(t)) return "BluRay";

        // Langues/variantes courantes
        if (/^multi$/i.test(t)) return "MULTi";
        if (/^vostfr$/i.test(t)) return "VOSTFR";
        if (/^vf$/i.test(t)) return "VF";
        if (/^vo$/i.test(t)) return "VO";

        // HDR/DV
        if (/^hdr$/i.test(t)) return "HDR";
        if (/^dv$/i.test(t)) return "DV";

        // HEVC (si présent)
        if (/^hevc$/i.test(t)) return "HEVC";

        return t;
    });
}

// Fusionner "DD 5.1" -> "DD5.1" et "DD 7.1" -> "DD7.1"
function mergeDD(tokens) {
    const out = [];
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const n = tokens[i + 1];
        if (/^DD(5\.1|7\.1)$/i.test(t)) { out.push(t.replace(/^dd/i, "DD")); continue; }
        if (/^dd$/i.test(t) && /^(5\.1|7\.1)$/i.test(n || '')) { out.push(`DD${n}`); i++; continue; }
        out.push(t);
    }
    return out;
}

// Fusionner "WEB DL" -> "WEBRip" (pour les cas "WEB.DL" qui deviennent "WEB DL")
function mergeWEB(tokens) {
    const out = [];
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i], n = tokens[i + 1];
        if (/^web$/i.test(t) && /^dl$/i.test(n || '')) { out.push("WEBRip"); i++; continue; }
        out.push(t);
    }
    return out;
}

function cleanRelease(input) {
    if (!input || typeof input !== "string") return "";

    // Séparer extension
    const matchExt = input.match(/\.([A-Za-z0-9]{2,5})$/);
    const ext = matchExt ? matchExt[0] : "";
    let base = matchExt ? input.slice(0, -ext.length) : input;

    // 1) Supprimer la team à la fin (dernier "-Group")
    base = base.replace(/\s*-\s*([A-Za-z0-9._]+)$/u, "");

    // 2) Remplacer séparateurs par espaces, mais préserver décimales et H.264/H.265
    let s = base.replace(/[._]/g, (ch, i) => {
        if (ch !== '.') return ' ';
        const prev = base[i - 1], next = base[i + 1], next2 = base[i + 2], next3 = base[i + 3];
        if (i > 0 && /\d/.test(prev) && /\d/.test(next)) return '.';
        if ((prev === 'H' || prev === 'h') && next === '2' && next2 === '6' && (next3 === '4' || next3 === '5')) return '.';
        return ' ';
    }).replace(/\s+/g, ' ').trim();

    // 3) Trouver la 1re année comme pivot Titre/Métadonnées
    const yearRegex = /\b(19|20)\d{2}\b/;
    const yearMatch = s.match(yearRegex);

    let titlePart, metaPart = "";
    if (yearMatch) {
        const idx = yearMatch.index;
        titlePart = s.slice(0, idx).trim();
        metaPart = s.slice(idx).trim();
    } else {
        titlePart = s;
    }

    // 4) Title Case
    const title = titleCase(titlePart);

    // 5) Métadonnées
    let metas = [];
    if (metaPart) {
        metas = metaPart.split(/\s+/);

        // Normalisations
        metas = normalizeTokens(metas);

        // Fusions
        metas = mergeWEB(metas);
        metas = mergeDD(metas);

        // Unifier 'P' -> 'p' pour les résolutions
        metas = metas.map(t => t.replace(/^(\d{3,4})P$/, (_, n) => `${n}p`));
    }

    // 6) Reconstruction
    const result = [title, metas.join(" ").trim()].filter(Boolean).join(" ") + (ext || "");
    return result.replace(/\s+(\.[A-Za-z0-9]{2,5})$/, "$1");
}

// Démo rapide
const inputEl = document.querySelector('input[name="rls"]');
const outEl = document.getElementById('out');

function render() {
    // outEl.textContent = cleanRelease(inputEl.value);

    const inputEl = document.querySelector('input[name="rls"]');
    const outEl = document.getElementById('out');

    function render() {
        const inputValue = inputEl.value.trim();
        if (inputValue === '') {
            outEl.textContent = '';
            outEl.style.display = 'none'; // Masquer le <pre> si l'input est vide
        } else {
            outEl.textContent = cleanRelease(inputValue);
            outEl.style.display = 'block'; // Afficher le <pre> si l'input contient du texte
        }
    }
}

inputEl.addEventListener('input', render);
render();

inputEl.addEventListener('input', render);
render();

// Expose pour tests console
window.cleanRelease = cleanRelease;
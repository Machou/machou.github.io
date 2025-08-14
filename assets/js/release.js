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
        if (/^2160p$/i.test(t)) return "2160p";
        if (/^1080p$/i.test(t)) return "1080p";
        if (/^720p$/i.test(t)) return "720p";

        if (/^h\.?265$/i.test(t)) return "h265";
        if (/^h\.?264$/i.test(t)) return "h264";
        if (/^x265$/i.test(t)) return "x265";
        if (/^x264$/i.test(t)) return "x264";

        if (/^web(rip)?$/i.test(t)) return "WEBRip";
        if (/^web-?dl$/i.test(t)) return "WEBRip";
        if (/^we?bdl$/i.test(t)) return "WEBRip";

        if (/^blu[- ]?ray$/i.test(t)) return "BluRay";

        if (/^multi$/i.test(t)) return "MULTi";
        if (/^vostfr$/i.test(t)) return "VOSTFR";
        if (/^vf$/i.test(t)) return "VF";
        if (/^vo$/i.test(t)) return "VO";

        if (/^hdr$/i.test(t)) return "HDR";
        if (/^dv$/i.test(t)) return "DV";

        if (/^hevc$/i.test(t)) return "HEVC";

        return t;
    });
}

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

    const matchExt = input.match(/\.([A-Za-z0-9]{2,5})$/);
    const ext = matchExt ? matchExt[0] : "";
    let base = matchExt ? input.slice(0, -ext.length) : input;

    base = base.replace(/\s*-\s*([A-Za-z0-9._]+)$/u, "");

    let s = base.replace(/[._]/g, (ch, i) => {
        if (ch !== '.') return ' ';
        const prev = base[i - 1], next = base[i + 1], next2 = base[i + 2], next3 = base[i + 3];
        if (i > 0 && /\d/.test(prev) && /\d/.test(next)) return '.';
        if ((prev === 'H' || prev === 'h') && next === '2' && next2 === '6' && (next3 === '4' || next3 === '5')) return '.';
        return ' ';
    }).replace(/\s+/g, ' ').trim();

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

    const title = titleCase(titlePart);

    let metas = [];
    if (metaPart) {
        metas = metaPart.split(/\s+/);
        metas = normalizeTokens(metas);
        metas = mergeWEB(metas);
        metas = mergeDD(metas);
        metas = metas.map(t => t.replace(/^(\d{3,4})P$/, (_, n) => `${n}p`));
    }

    const result = [title, metas.join(" ").trim()].filter(Boolean).join(" ") + (ext || "");
    return result.replace(/\s+(\.[A-Za-z0-9]{2,5})$/, "$1");
}

/* --- wiring DOM propre --- */
const inputEl = document.querySelector('#release');
const outEl = document.getElementById('out');

function render() {
    const v = inputEl.value.trim();
    if (!v) {
        outEl.textContent = '';
        outEl.style.display = 'none';
    } else {
        outEl.textContent = cleanRelease(v);
        outEl.style.display = 'block';
    }
}

inputEl.addEventListener('input', render);
render(); // initial
window.cleanRelease = cleanRelease;
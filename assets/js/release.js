function titleCase(str) {
    if (!str) return "";

    // Uniquement des mots isolés (le split se fait sur les espaces)
    const smallWords = new Set([
        "a","an","and","as","at","but","by","da","das","de","der","des","die","do","dos","du",
        "el","en","et","for","from","in","la","le","les","of","on","or","the","to","und","von","vs","with"
    ]);

    const words = str.trim().split(/\s+/);
    if (words.length === 0) return "";

    const upperFollowing = (w) => w.replace(/^([a-zàâäçéèêëîïôöùûüÿœ])|([’'][a-zàâäçéèêëîïôöùûüÿœ])|(-[a-zàâäçéèêëîïôöùûüÿœ])/giu, (s) => s.toUpperCase());

    return words.map((raw, i, arr) => {
        const w = raw;
        const lw = w.toLowerCase();

        if (/^\d+$/.test(w)) return w;

        if (i !== 0 && /^(?:d'|l')$/i.test(lw)) return lw;

        const isFirst = i === 0;
        const isLast = i === arr.length - 1;
        const isSmall = smallWords.has(lw) || /^(?:d'|l')$/i.test(lw);

        if (!isFirst && !isLast && isSmall) return lw;

        return upperFollowing(lw);
    })
    .join(" ");
}

function normalizeTokens(tokens) {
    return tokens.map((t) => {
        // Résolutions
        if (/^2160p$/i.test(t)) return "2160p";
        if (/^1080p$/i.test(t)) return "1080p";
        if (/^720p$/i.test(t)) return "720p";
        if (/^2160i/i.test(t)) return "2160p";
        if (/^1080i/i.test(t)) return "1080p";
        if (/^720i$/i.test(t)) return "720p";

        // Codecs
        if (/^h\.?265$/i.test(t)) return "h265";
        if (/^h\.?264$/i.test(t)) return "h264";
        if (/^x265$/i.test(t)) return "x265";
        if (/^x264$/i.test(t)) return "x264";
        if (/^hevc$/i.test(t)) return "HEVC";
        if (/^hsbs$/i.test(t)) return "HSBS";

        // Audio
        if (/^h\.?265$/i.test(t)) return "h265";
        if (/^h\.?264$/i.test(t)) return "h264";
        if (/^ac3$/i.test(t)) return "AC3";
        if (/^eac3$/i.test(t)) return "EAC3";
        if (/^x264$/i.test(t)) return "x264";
        if (/^hevc$/i.test(t)) return "HEVC";
        if (/^hsbs$/i.test(t)) return "HSBS";

        // WEB
        if (/^web(?:rip)?$/i.test(t)) return "WEBRip";
        if (/^web-?dl$/i.test(t)) return "WEBRip";
        if (/^we?bdl$/i.test(t)) return "WEBRip";

        // Blu-ray : supprimé (souvent redondant)
        if (/^blu[- ]?ray$/i.test(t)) return "";

        // Langues / pistes
        if (/^multi$/i.test(t)) return "MULTi";
        if (/^vostfr$/i.test(t)) return "VOSTFR";
        if (/^vff$/i.test(t)) return "VFF";
        if (/^vfi$/i.test(t)) return "VFi";
        if (/^vo$/i.test(t)) return "VO";

        // Divers
        if (/^10[\s-]?bit$/i.test(t)) return "10bit";
        if (/^hdr$/i.test(t)) return "HDR";
        if (/^sdr$/i.test(t)) return "SDR";
        if (/^dv$/i.test(t)) return "DV";
        if (/^hsbs$/i.test(t)) return "HSBS";
        if (/^3d$/i.test(t)) return "3D";
        if (/^integrale$/i.test(t)) return "iNTEGRALE";

        return t;
    });
}

function mergeDD(tokens) {
    const out = [];
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const n = tokens[i + 1];

        if (/^DD(?:5\.1|7\.1)$/i.test(t)) {
            out.push(t.replace(/^dd/i, "DD"));
            continue;
        }

        if (/^dd$/i.test(t) && /^(?:5\.1|7\.1)$/i.test(n || "")) {
                out.push(`DD${n}`);
            i++;
            continue;
        }

        out.push(t);
    }

    return out;
}

function mergeWEB(tokens) {
    const out = [];
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i], n = tokens[i + 1];
        if (/^web$/i.test(t) && /^dl$/i.test(n || "")) {
            out.push("WEBRip");
            i++;
            continue;
        }

        out.push(t);
    }

    return out;
}

function cleanRelease(input) {
    if (!input || typeof input !== "string") return "";

    const matchExt = input.match(/\.([A-Za-z0-9]{2,5})$/);
    const ext = matchExt ? matchExt[0] : "";
    let base = matchExt ? input.slice(0, -ext.length) : input;

    // Retirer un tag groupe final : " - GROUP" ou "-GROUP"
    base = base.replace(/\s*-\s*([A-Za-z0-9._]+)$/u, "");

    // Remplacer . et _ par espace, sauf :
    // a) digits.digits (ex: 3.10) ; b) h264/h265
    let s = base.replace(/[._]/g, (ch, i) => {
        if (ch !== ".") return " ";
        const prev = base[i - 1], next = base[i + 1];
        const next2 = base[i + 2], next3 = base[i + 3];
        if (i > 0 && /\d/.test(prev) && /\d/.test(next)) return ".";
        if ((prev === "H" || prev === "h") && next === "2" && next2 === "6" && (next3 === "4" || next3 === "5")) return ".";
        return " ";
    })
    .replace(/\s+/g, " ")
    .trim();

    // Séparation Titre / Métadonnées à la 1ère année
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
        metas = metas.map((t) => t.replace(/^(\d{3,4})P$/i, (_, n) => `${n}p`));
        metas = metas.filter(Boolean);
    }

    const result = [title, metas.join(" ").trim()].filter(Boolean).join(" ") + (ext || "");
    return result.replace(/\s+(\.[A-Za-z0-9]{2,5})$/, "$1");
}

(function attach() {
    const inputEl = document.querySelector("#release");
    const outEl = document.getElementById("out");
    if (!inputEl || !outEl) {
        window.cleanRelease = cleanRelease;
        return;
    }

    function render() {
        const v = (inputEl.value || "").trim();
        if (!v) {
        outEl.textContent = "";
        outEl.style.display = "none";
        } else {
        outEl.textContent = cleanRelease(v);
        outEl.style.display = "block";
        }
    }

    inputEl.addEventListener("input", render);
    render();
    window.cleanRelease = cleanRelease;
})();
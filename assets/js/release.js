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
        if (/^2160i/i.test(t)) return "2160p";
        if (/^1080i/i.test(t)) return "1080p";
        if (/^720i$/i.test(t)) return "720p";

        if (/^h\.?265$/i.test(t)) return "h265";
        if (/^h\.?264$/i.test(t)) return "h264";
        if (/^x265$/i.test(t)) return "x265";
        if (/^x264$/i.test(t)) return "x264";
        if (/^hevc$/i.test(t)) return "HEVC";
        if (/^hsbs$/i.test(t)) return "HSBS";
        if (/^av1$/i.test(t)) return "AV1";

        if (/^web(rip)?$/i.test(t)) return "WEBRip";
        if (/^web-?dl$/i.test(t)) return "WEBRip";
        if (/^we?bdl$/i.test(t)) return "WEBRip";

        if (/^blu[- ]?ray$/i.test(t)) return "";
        if (/^opus$/i.test(t)) return "";

        if (/^multi$/i.test(t)) return "MULTi";
        if (/^vostfr$/i.test(t)) return "VOSTFR";

        if (/^vff$/i.test(t)) return "VFF";
        if (/^vf2$/i.test(t)) return "VF2";
        if (/^vfi$/i.test(t)) return "VFi";
        if (/^vo$/i.test(t)) return "VO";

        if (/^hdr$/i.test(t)) return "HDR";
        if (/^dv$/i.test(t)) return "DV";
        if (/^version longue$/i.test(t)) return "VERSiON LONGUE";

		if (/^10[\s-]?Bit$/i.test(t)) return "10bit";

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

		const p2 = base[i - 2];
		const p1 = base[i - 1];
		const n1 = base[i + 1];
		const n2 = base[i + 2];
		const n3 = base[i + 3];

		// Conserver pour h.264 / h.265
		if ((p1 === 'H' || p1 === 'h') && n1 === '2' && n2 === '6' && (n3 === '4' || n3 === '5')) {
			return '.';
		}

		const prevIsDigit = /\d/.test(p1);
		const nextIsDigit = /\d/.test(n1);
		const prevPrevIsDigit = /\d/.test(p2 || '');
		const nextNextIsDigit = /\d/.test(n2 || '');

		if (prevIsDigit && nextIsDigit && !prevPrevIsDigit && !nextNextIsDigit) {
			return '.';
		}

		return ' ';
	})
	.replace(/\s+/g, ' ')
	.trim();

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
render();
window.cleanRelease = cleanRelease;
import { VercelRequest, VercelResponse } from '@vercel/node';

const slangs = ["fuck", "cunt", "dick", "cock", "bitch", "whore", "slut", "clit", "pussy", "penis", "peni", "suck", "ass", "asshole", "twat", "wank", "prick"];
let dictionary: string[] = [];

async function initDictionary() {
    if (dictionary.length > 0) return;
    try {
        const res = await fetch("https://githubusercontent.com");
        const text = await res.text();
        dictionary = text.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w.length >= 2 && w.length <= 7);
    } catch (e) {
        dictionary = ["site", "item", "time", "game", "test", "step", "love", "life", "bench", "bough", "chief", "gecko", "back", "bang", "bare", "cafe", "face", "fake", "cake"];
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await initDictionary();
    const input = (req.query.input as string)?.toLowerCase() || '';
    if (input.length > 17) return res.status(400).json({ error: "Max 17 letters allowed" });

    const counts: any = {};
    for (const c of input) counts[c] = (counts[c] || 0) + 1;

    const matchedWords = dictionary.filter(w => {
        const wCounts: any = {};
        for (const c of w) {
            wCounts[c] = (wCounts[c] || 0) + 1;
            if (!counts[c] || wCounts[c] > counts[c]) return false;
        }
        return true;
    });

    const foundSlangs = slangs.filter(s => {
        const sCounts: any = {};
        for (const c of s) {
            sCounts[c] = (sCounts[c] || 0) + 1;
            if (!counts[c] || sCounts[c] > counts[c]) return false;
        }
        return true;
    });

    const goodWordsGrouped: any = {};
    matchedWords.forEach(word => {
        if (slangs.indexOf(word) === -1) {
            const len = word.length;
            if (!goodWordsGrouped[len]) goodWordsGrouped[len] = [];
            goodWordsGrouped[len].push(word);
        }
    });

    return res.status(200).json({ success: true, results: goodWordsGrouped, slangs: foundSlangs });
}

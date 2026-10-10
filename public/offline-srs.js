export function schedule(previous, rating, time) {
    const at = Date.parse(time);
    if (!Number.isFinite(at))
        throw new Error("invalid-time");
    const old = previous ?? { intervalDays: 0, ease: 2.5, streak: 0, dueAt: time, algorithmVersion: 1 };
    let interval = old.intervalDays, ease = old.ease, streak = old.streak;
    if (rating === "Again") {
        interval = 0;
        ease = Math.max(1.3, ease - .2);
        streak = 0;
    }
    if (rating === "Hard") {
        interval = Math.max(1, Math.ceil(Math.max(1, interval) * 1.2));
        ease = Math.max(1.3, ease - .15);
    }
    if (rating === "Good") {
        streak++;
        interval = streak === 1 ? 1 : streak === 2 ? 3 : Math.ceil(interval * ease);
    }
    if (rating === "Easy") {
        streak++;
        interval = Math.max(4, Math.ceil(Math.max(1, interval) * (ease + .3)));
        ease = Math.min(3, ease + .15);
    }
    interval = Math.min(365, interval);
    return { intervalDays: interval, ease, streak, dueAt: new Date(at + (rating === "Again" ? 600000 : interval * 86400000)).toISOString(), algorithmVersion: 1 };
}
export function answerKey(text, caseMode = "fold") {
    const normalized = text.normalize("NFKC").trim().replace(/[‘’]/g, "'").replace(/\s+/g, " ");
    return caseMode === "fold" ? normalized.toLowerCase() : normalized;
}

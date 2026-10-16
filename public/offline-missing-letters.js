/** Only English letters are hidden; spacing and punctuation remain visible. */
export function letterPositions(text) { return [...text].flatMap((letter, index) => /^[a-z]$/i.test(letter) ? [index] : []); }
export function eligibleMissingLetters(text) { return [...text].length <= 80 && letterPositions(text).length >= 2; }
export function missingLetterPositions(text, random = Math.random) {
    if (!eligibleMissingLetters(text))
        return [];
    const pool = letterPositions(text), max = Math.min(3, pool.length - 1), min = Math.min(2, max), count = min + Math.floor(random() * (max - min + 1)), positions = [];
    for (let i = 0; i < count; i++)
        positions.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
    return positions.sort((a, b) => a - b);
}
export function validMissingPositions(text, positions) {
    const letters = letterPositions(text);
    return eligibleMissingLetters(text) && positions.length >= 1 && positions.length <= 3 && positions.length < letters.length && positions.every((index, i) => Number.isInteger(index) && letters.includes(index) && (i === 0 || positions[i - 1] < index));
}
export function missingLetters(text, positions) { const letters = [...text]; return positions.map(index => letters[index]).join(''); }

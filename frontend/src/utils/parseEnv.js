/**
 * Parse a .env file's contents into an array of { key_name, api_key } pairs.
 *
 * Handles:
 *   - blank lines and `# ...` comments
 *   - optional `export ` prefix on lines
 *   - double-quoted values with `\"`, `\\`, `\n` escapes
 *   - single-quoted values (literal — no escapes processed)
 *   - unquoted values (trimmed; trailing inline `# comment` stripped)
 *
 * Throws an Error with a useful message on the first line it cannot parse.
 *
 * @param {string} text Raw .env file contents
 * @returns {Array<{ key_name: string, api_key: string }>}
 */
export function parseEnv(text) {
    if (typeof text !== 'string') {
        throw new Error('parseEnv: input must be a string');
    }

    const lines = text.split(/\r?\n/);
    const out = [];
    const seen = new Set();

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const lineNum = i + 1;
        const trimmed = rawLine.trim();

        // Skip blanks and comments
        if (!trimmed || trimmed.startsWith('#')) continue;

        // Strip optional `export ` keyword
        const stripped = trimmed.startsWith('export ')
            ? trimmed.slice('export '.length).trimStart()
            : trimmed;

        const eqIdx = stripped.indexOf('=');
        if (eqIdx === -1) {
            throw new Error(`Line ${lineNum}: missing '=' in "${trimmed}"`);
        }

        const key = stripped.slice(0, eqIdx).trim();
        if (!key) {
            throw new Error(`Line ${lineNum}: empty key name`);
        }
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
            throw new Error(`Line ${lineNum}: invalid key name "${key}"`);
        }

        let valuePart = stripped.slice(eqIdx + 1).trimStart();

        // Multi-line support: if value starts with a quote and is unterminated
        // on this line, keep reading until we find the closing quote.
        let value;
        if (valuePart.startsWith('"')) {
            value = consumeQuoted(lines, i, '"', /*processEscapes=*/true);
            // Advance outer index past the consumed lines
            const consumedNewlines = (value._consumedAfter || 0);
            i += consumedNewlines;
            value = value.value;
        } else if (valuePart.startsWith("'")) {
            value = consumeQuoted(lines, i, "'", /*processEscapes=*/false);
            const consumedNewlines = (value._consumedAfter || 0);
            i += consumedNewlines;
            value = value.value;
        } else {
            // Unquoted: stop at first whitespace; strip trailing inline comment
            const hashIdx = findUnquotedHash(valuePart);
            const endIdx = hashIdx === -1 ? valuePart.length : hashIdx;
            value = valuePart.slice(0, endIdx).trimEnd();
        }

        if (value === '') {
            throw new Error(`Line ${lineNum}: empty value for "${key}"`);
        }

        // Dedupe within the same file: keep the last occurrence (matches dotenv)
        if (seen.has(key)) {
            const prevIdx = out.findIndex(o => o.key_name === key);
            if (prevIdx !== -1) out.splice(prevIdx, 1);
        }
        seen.add(key);
        out.push({ key_name: key, api_key: value });
    }

    return out;
}

/**
 * Consume a quoted value that may span multiple lines.
 * Returns { value, _consumedAfter: numberOfExtraLinesConsumed }.
 */
function consumeQuoted(lines, startIdx, quote, processEscapes) {
    const firstLine = lines[startIdx];
    const eqIdx = firstLine.indexOf('=');
    let buffer = firstLine.slice(eqIdx + 1).trimStart().slice(1); // drop opening quote
    let consumedAfter = 0;

    // If the opening quote is closed on the same line, return early.
    const closeIdxSame = buffer.indexOf(quote);
    if (closeIdxSame !== -1) {
        return { value: unescape(buffer.slice(0, closeIdxSame), processEscapes), _consumedAfter: 0 };
    }

    // Otherwise, keep appending lines until we find the closing quote.
    for (let j = startIdx + 1; j < lines.length; j++) {
        consumedAfter += 1;
        const next = lines[j];
        const close = next.indexOf(quote);
        if (close !== -1) {
            buffer += '\n' + next.slice(0, close);
            return { value: unescape(buffer, processEscapes), _consumedAfter: consumedAfter };
        }
        buffer += '\n' + next;
    }
    // Unterminated quote — treat as the rest of the file, escaped.
    return { value: unescape(buffer, processEscapes), _consumedAfter: consumedAfter };
}

function unescape(s, processEscapes) {
    if (!processEscapes) return s;
    return s
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
}

/**
 * Find the index of a `#` that starts an inline comment in an unquoted value.
 * `#` is only a comment marker if it is preceded by whitespace.
 */
function findUnquotedHash(value) {
    for (let i = 0; i < value.length; i++) {
        if (value[i] === '#') {
            if (i === 0) return i;
            const prev = value[i - 1];
            if (prev === ' ' || prev === '\t') return i;
        }
    }
    return -1;
}

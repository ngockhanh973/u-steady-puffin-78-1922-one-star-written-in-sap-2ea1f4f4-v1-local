// One Star, Written in Sap — entry emitter.
//
// Reads the one-line houseplant review from entry.txt sitting next to
// this script, checks it against the sealed gate (1 to 279 UTF-8
// characters, not only whitespace, exactly one line), then copies the
// raw bytes unchanged into $MAKEFUN_OUTPUT_DIR/entry.txt. When the
// grader leaves that variable unset, the fallback is ./out inside
// this repo. Exit 0 on success, exit 1 with a message on any gate
// failure, so a bad entry can never slip through silently.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, "entry.txt");
const MAX_CHARS = 279;

function fail(message: string): never {
  console.error(`entry check failed: ${message}`);
  process.exit(1);
}

const raw = readFileSync(SOURCE);
const text = raw.toString("utf8");
const length = [...text].length;

if (length < 1) {
  fail("entry.txt is empty");
}
if (length > MAX_CHARS) {
  fail(`entry is ${length} characters, over the ${MAX_CHARS} limit`);
}
if (text.trim().length === 0) {
  fail("entry.txt holds only whitespace");
}
if (text.includes("\n") || text.includes("\r")) {
  fail("entry must be a single line with no line breaks");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : join(HERE, "out");
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, raw);

// Round-trip guard: the bytes on disk must be identical to the source,
// otherwise the copy step silently mangled the entry.
const copied = readFileSync(target);
if (!copied.equals(raw)) {
  fail("output bytes differ from entry.txt");
}
console.log(`wrote ${length} characters to ${target}`);

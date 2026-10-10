// Validates every card in vanilla/ and mods/. Same limits as the ANIMA app (packages/server/src/cards-pack.ts).
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const INJECTION = /ignore (all |the |any )?(previous|prior|above|earlier)|disregard .{0,30}(instructions|rules)|system prompt|you are now |jailbreak|<\/?(system|assistant)>/i;
const CONTROL = /[\u0000-\u0008\u000b-\u001f\u007f]/;
const str = (v, max) => typeof v === "string" && v.trim() && v.length <= max && !CONTROL.test(v);

function check(c, rel) {
  const errors = [];
  if (!str(c.name, 80)) errors.push("name is missing or longer than 80 characters");
  if (!str(c.personality, 1500)) errors.push("personality is missing or longer than 1500 characters");
  if (!Array.isArray(c.facts) || c.facts.length > 30 || !c.facts.every((f) => str(f, 300))) errors.push("facts must be a list of at most 30 texts of at most 300 characters");
  const texts = [c.name, c.personality, ...(Array.isArray(c.facts) ? c.facts : [])];
  if (texts.some((t) => typeof t === "string" && INJECTION.test(t))) errors.push("the text looks like an instruction to the model");
  if (rel.startsWith("mods/")) {
    const folder = rel.split("/")[1];
    if (typeof c.plugin === "string" && c.plugin.toLowerCase() !== folder.toLowerCase()) errors.push(`plugin "${c.plugin}" does not match the folder "${folder}"`);
    if (!/\.(esp|esm|esl)$/i.test(folder)) errors.push(`the folder "${folder}" must be a plugin file name (.esp, .esm or .esl)`);
  }
  return errors;
}

let bad = 0;
let total = 0;
const seen = new Map();
const files = [];
for (const dir of ["vanilla", "mods"]) {
  const base = path.join(root, dir);
  if (!fs.existsSync(base)) continue;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".json")) files.push(p);
      else if (e.name !== "README.md" && e.name !== ".gitkeep") {
        console.log(`✖ ${path.relative(root, p)}: only .json cards are allowed here`);
        bad++;
      }
    }
  };
  walk(base);
}
for (const p of files) {
  const rel = path.relative(root, p).split(path.sep).join("/");
  total++;
  let c;
  try {
    c = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.log(`✖ ${rel}: not valid JSON (${e.message})`);
    bad++;
    continue;
  }
  const errors = check(c, rel);
  const key = rel.startsWith("mods/") ? `${rel.split("/")[1].toLowerCase()}|${(c.editorId || c.name || "").toLowerCase()}` : `vanilla|${(c.name || "").toLowerCase()}`;
  if (seen.has(key)) errors.push(`duplicate of ${seen.get(key)}`);
  else seen.set(key, rel);
  if (errors.length) {
    bad++;
    for (const e of errors) console.log(`✖ ${rel}: ${e}`);
  }
}
console.log(`${total} cards checked, ${bad} problem${bad === 1 ? "" : "s"}`);
process.exit(bad ? 1 : 0);

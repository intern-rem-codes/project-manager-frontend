import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";

const repoRoot = path.resolve(process.cwd());
const srcDir = path.join(repoRoot, "src");
const cssPath = path.join(srcDir, "index.css");

function extractClassNames(selector) {
  const names = new Set();
  const re = /\.([_a-zA-Z][\w-]*)/g;
  let match;
  while ((match = re.exec(selector))) names.add(match[1]);
  return [...names];
}

function splitSelectors(selectorList) {
  const out = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let quote = "";

  for (let i = 0; i < selectorList.length; i += 1) {
    const ch = selectorList[i];
    if (inString) {
      current += ch;
      if (ch === quote && selectorList[i - 1] !== "\\") inString = false;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inString = true;
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      out.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

async function readAllSourceText() {
  const files = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!/\.(tsx|ts|jsx|js)$/.test(entry.name)) continue;
      files.push(full);
    }
  }

  await walk(srcDir);
  const extra = path.join(repoRoot, "index.html");
  files.push(extra);

  return files;
}

const cssText = await fs.readFile(cssPath, "utf8");
const sourceFiles = await readAllSourceText();

function addTokensFromStringLiteral(value, into) {
  for (const token of value.split(/\s+/)) {
    const t = token.trim();
    if (!t) continue;
    if (/^[_a-zA-Z][\w-]*$/.test(t)) into.add(t);
  }
}

async function collectUsedClassNames() {
  const used = new Set();
  const contents = await Promise.all(
    sourceFiles.map(async (file) => {
      try {
        return await fs.readFile(file, "utf8");
      } catch {
        return "";
      }
    }),
  );

  // index.html: class="..."
  try {
    const html = await fs.readFile(path.join(repoRoot, "index.html"), "utf8");
    const classAttr = /class\s*=\s*"([^"]+)"/g;
    let m;
    while ((m = classAttr.exec(html))) addTokensFromStringLiteral(m[1], used);
  } catch {
    // ignore
  }

  for (const text of contents) {
    // className="..."
    const direct = /className\s*=\s*"([^"]+)"/g;
    let match;
    while ((match = direct.exec(text))) addTokensFromStringLiteral(match[1], used);

    // className={'...'} or className={"..."}
    const braceString = /className\s*=\s*{\s*(['"])(.*?)\1\s*}/g;
    while ((match = braceString.exec(text))) addTokensFromStringLiteral(match[2], used);

    // className={`...`} (only static parts)
    const tpl = /className\s*=\s*{\s*`([^`]+)`\s*}/g;
    while ((match = tpl.exec(text))) {
      const staticOnly = match[1].replace(/\$\{[^}]+\}/g, " ");
      addTokensFromStringLiteral(staticOnly, used);
    }

    // className={...}: harvest string literals inside the expression
    const anyExpr = /className\s*=\s*{([^}]+)}/g;
    while ((match = anyExpr.exec(text))) {
      const expr = match[1];
      const strLit = /(['"`])([^'"`]+)\1/g;
      let sm;
      while ((sm = strLit.exec(expr))) addTokensFromStringLiteral(sm[2], used);
    }
  }

  return used;
}

const usedClassNames = await collectUsedClassNames();
const root = postcss.parse(cssText, { from: cssPath });

let removedSelectors = 0;
let removedRules = 0;

root.walkRules((rule) => {
  if (!rule.selector) return;
  const original = rule.selector;
  const selectors = splitSelectors(original);
  const kept = [];

  for (const sel of selectors) {
    const classNames = extractClassNames(sel);
    if (classNames.length === 0) {
      kept.push(sel);
      continue;
    }
    const allUnused = classNames.every((name) => !usedClassNames.has(name));
    if (allUnused) {
      removedSelectors += 1;
    } else {
      kept.push(sel);
    }
  }

  if (kept.length === 0) {
    rule.remove();
    removedRules += 1;
    return;
  }
  const next = kept.join(", ");
  if (next !== original) rule.selector = next;
});

const nextCss = root.toString();
if (nextCss !== cssText) {
  await fs.writeFile(cssPath, nextCss, "utf8");
}

console.log(
  JSON.stringify(
    {
      file: path.relative(repoRoot, cssPath),
      removedSelectors,
      removedRules,
      changed: nextCss !== cssText,
    },
    null,
    2,
  ),
);

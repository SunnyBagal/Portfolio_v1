# Changes Made — Removal of Brittany Chiang's Personal Data

All changes are minimal and precise. No design, structure, layout, or logic was modified.
Content markdown files (featured projects, other projects, blog posts) were intentionally left unchanged.

---

## 1. `gatsby-config.js`

**What changed:** 6 field replacements + 1 block removed

| Field | Old Value | New Value |
|-------|-----------|-----------|
| `siteMetadata.title` | `'Brittany Chiang'` | `'Sunny Bagal'` |
| `siteMetadata.description` | Brittany's description | Sunny's description |
| `siteMetadata.siteUrl` | `'https://brittanychiang.com'` | `'https://sunnybagal.dev'` *(placeholder — update before going live)* |
| `siteMetadata.twitterUsername` | `'@bchiang7'` | `'@Sunny_Bagal_11'` |
| `gatsby-plugin-manifest` → `name` | `'Brittany Chiang'` | `'Sunny Bagal'` |
| `gatsby-plugin-manifest` → `short_name` | `'Brittany Chiang'` | `'Sunny Bagal'` |
| `gatsby-plugin-google-analytics` block | `trackingId: 'UA-45666519-2'` | **Removed entirely** |

**Why this file controlled the browser tab title:**
`siteMetadata.title` is queried by `src/components/head.js` and used as both the `defaultTitle` (homepage tab) and the suffix in `titleTemplate="%s | Sunny Bagal"` (all other pages). Changing it here fixes the tab title site-wide.

---

## 2. `package.json`

**What changed:** 2 fields

| Field | Old Value | New Value |
|-------|-----------|-----------|
| `author` | `"Brittany Chiang <brittany.chiang@gmail.com>"` | `"Sunny Bagal <sunnybagal.1110@gmail.com>"` |
| `repository.url` | `"https://github.com/bchiang7/v4"` | `"https://github.com/SunnyBagal"` *(update to specific repo URL once created)* |

---

## 3. `src/components/head.js`

**What changed:** 1 line removed

- Removed `<meta name="google-site-verification" content="DCl7VAf9tcz6eD9gb67NfkNnJ1PKRNcg8qQiwpbx9Lk" />` — this token belongs to Brittany's Google Search Console account, not Sunny's.

---

## 4. `src/components/footer.js`

**What changed:** 2 changes

- Removed the `useEffect` GitHub API fetch (`https://api.github.com/repos/bchiang7/v4`) — no portfolio repo exists yet; restore once created.
- Updated attribution link `href` from `https://github.com/bchiang7/v4` → `https://github.com/SunnyBagal`
- Attribution text `"Design inspired by Brittany Chiang"` intentionally kept as proper credit.

---

## Cache

Run `npm run clean` after these changes to purge `.cache/` and `public/` which contain stale builds with Brittany's metadata (manifest.webmanifest, cached GraphQL queries, etc.).

---

## Pending (do after GitHub repo is created)

- `package.json` → update `repository.url` to actual repo URL
- `src/components/footer.js` → update attribution `href` to repo URL; optionally restore the GitHub stats fetch with the real repo path

---

## 5. `src/components/sections/about.js` — About Me Image Fix

**What changed:** `src` path restored to `../../images/me.jpg` (original, unchanged)

**Root cause of the issue:** The previous fix incorrectly used AVIF as the `StaticImage` source. Gatsby 3 + Sharp 0.28.1 has limited AVIF *decode* support — it can produce AVIF output but cannot reliably read AVIF as input. Changing the `src` to `me.avif` caused the image to fail to render.

**Correct fix applied:**
1. Used macOS `sips` to convert `public/static/30a645f7db6038f83287d0c6042d3b2b/f9526/me.avif` → `src/images/me.jpg` (valid JPEG, 500×500px, 139KB)
2. `src/images/me.jpg` now contains the user's photo — this is the permanent source Gatsby reads
3. `about.js` `src` is kept as `../../images/me.jpg` (the original path, unchanged)
4. The intermediate `src/images/me.avif` file was removed

**This is now permanent:** `src/images/me.jpg` is the source Gatsby processes at build time. Running `npm run clean` and rebuilding will use this file — the user's photo will always render correctly.

---

## 6. `src/components/icons/leetcode.js` — LeetCode Icon Visibility Fix

**What changed:** Removed `className="feather feather-leetcode"` from the SVG element

**Root cause of the invisible icon:** `GlobalStyle.js` has this CSS rule:
```css
svg { fill: currentColor; }     /* all SVGs get filled with currentColor */
svg.feather { fill: none; }     /* .feather class overrides fill to none */
```
All other icons (GitHub, Instagram, etc.) are **stroke-based** — they use `stroke="currentColor"` and draw their shapes via outlines, so `fill: none` doesn't affect their visibility. The LeetCode icon is **fill-based** — its entire shape is a filled path. Having the `.feather` class meant the CSS set `fill: none`, making the filled path completely transparent (invisible).

**Fix:** Removed the `className` attribute from the LeetCode `<svg>` tag. Now the global `svg { fill: currentColor }` rule applies directly, the filled path inherits the text colour, and the icon renders visibly like all the others.

---

---

## 9. Node Environment & Dependency Fix (Node 18 Migration)

**Why this was needed:**
The project originally ran on Node 14.16.0. After moving to Apple Silicon (arm64), `sharp` had an architecture mismatch (x64 binaries on arm64). Attempting to fix that corrupted the `package-lock.json` by pulling in newer transitive dependencies that were incompatible with Node 14. Node 14 is also EOL (April 2023), so the project was migrated to Node 18 LTS.

**What changed:**

### `.nvmrc`
- Changed from `14.16.0` → `18`
- Node 18 is required because newer transitive deps (cheerio, undici) need it

### `.npmrc` — New file
- Added `legacy-peer-deps=true`
- npm 9 (ships with Node 18) is strict about peer dependency conflicts. Several Gatsby 3 plugins (notably `gatsby-plugin-robots-txt`) declare peer deps for Gatsby 5. This flag restores the lenient behaviour that npm 6 (Node 14) had by default.

### `package.json` — `overrides` block added
```json
"overrides": {
  "graphql": "15.8.0",
  "cheerio": "1.0.0-rc.12"
}
```
- **graphql**: Gatsby 3 and its plugins expect graphql v15, but npm was resolving the top-level to v14.7.0 (pulled there by a transitive dep). This caused `gatsby-recipes` to install its own nested graphql@15, giving two conflicting instances. The "Cannot use GraphQLScalarType from another module or realm" crash was the result. Forcing `15.8.0` everywhere gives a single instance.
- **cheerio**: `gatsby-plugin-offline` pulls in `cheerio`. npm was resolving `cheerio@1.2.0` which internally uses `undici`, which requires the `File` global — only available in Node 20+. Pinning to `1.0.0-rc.12` gives the last cheerio version that runs on Node 18.

### `package.json` — `sharp` removed
- `sharp@0.34.5` was incorrectly added as a direct dependency during a failed fix attempt. It is a transitive dependency of `gatsby-plugin-sharp` and should not be listed here. Removed.

### `.zshrc` — Fixed corrupted nvm block
- Lines 30–31 had two shell statements concatenated on the same line with no separator, causing `source ~/.zshrc` to error. Cleaned up to standard nvm init format.

**To reinitialise this project on any machine:**
```bash
nvm install 18    # reads .nvmrc automatically
nvm use 18
npm install       # overrides + .npmrc handle all compatibility
npm start
```

---

## 6. `src/components/icons/leetcode.js` — New file added

**What added:** Custom LeetCode SVG icon component (matches the exact structure of all other icon files in the project).

SVG source: Simple Icons (simpleicons.org/leetcode) — official LeetCode logo path, `viewBox="0 0 24 24"`, `fill="currentColor"`.

---

## 7. `src/components/icons/index.js`

**What changed:** 1 line added

```js
export { default as IconLeetCode } from './leetcode';
```

---

## 8. `src/components/icons/icon.js`

**What changed:** 2 additions — import + switch case

- Added `IconLeetCode` to the import from `@components/icons`
- Added `case 'LeetCode': return <IconLeetCode />;` to the switch

**Why:** `config.js` already had `{ name: 'LeetCode', url: '...' }` in the `socialMedia` array. The `social.js` sidebar maps over this array and calls `<Icon name={name} />`. Since `icon.js` had no `'LeetCode'` case, it fell through to `default: return <IconExternal />`, showing the external link icon. Adding the case replaces the fallback with the proper LeetCode icon.

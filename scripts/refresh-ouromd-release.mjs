import { writeFile } from "node:fs/promises";

const repo = "ourostack/ouro-md";
const api = `https://api.github.com/repos/${repo}/releases/latest`;

const response = await fetch(api, {
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "ouro-apps-site-release-refresh",
    ...(process.env.GH_TOKEN ? { Authorization: `Bearer ${process.env.GH_TOKEN}` } : {}),
  },
});

if (!response.ok) {
  throw new Error(`GitHub release lookup failed: ${response.status} ${response.statusText}`);
}

const release = await response.json();
const version = release.tag_name.replace(/^v/, "");
const asset = (suffix) => release.assets.find((item) => item.name.endsWith(suffix));
const zip = asset(".zip");
const dmg = asset(".dmg");
const manifest = asset(".manifest.json");

if (!zip || !manifest) {
  throw new Error(`Latest release ${release.tag_name} is missing zip or manifest assets`);
}

let manifestData = {};
const manifestResponse = await fetch(manifest.browser_download_url, {
  headers: { "User-Agent": "ouro-apps-site-release-refresh" },
});
if (manifestResponse.ok) {
  manifestData = await manifestResponse.json();
}

const digest = (item) => String(item.digest || "").replace(/^sha256:/, "");
const download = (item, role) => ({
  name: item.name,
  url: item.browser_download_url,
  bytes: item.size,
  sha256: digest(item),
  role,
});

const metadata = {
  appName: "Ouro MD",
  subtitle: "The Markdown App",
  channel: "stable",
  version,
  releaseTag: release.tag_name,
  releaseURL: release.html_url,
  publishedAt: release.published_at,
  bundleIdentifier: "org.ourostack.ouro-md",
  minimumMacOS: "13.0",
  signingMode: manifestData.signingMode || null,
  notarized: typeof manifestData.notarized === "boolean" ? manifestData.notarized : null,
  downloads: {
    installerScript: { url: "https://ouro.bot/ouro-md-install.sh" },
    zip: download(zip, "auto-update"),
    ...(dmg ? { dmg: download(dmg, "interactive-install") } : {}),
    manifest: download(manifest, "metadata"),
  },
};

await writeFile("apps/ouro-md/stable.json", `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`updated apps/ouro-md/stable.json -> ${release.tag_name}`);

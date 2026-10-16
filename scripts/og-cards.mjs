// Draws the share card for every page at build time, from the page's own
// og:title and og:description, so a copy change can never leave a stale card.
// Called by build-dist.mjs; each card lands in dist/og/<name>.png, and the page
// points og:image and twitter:image at https://ouro.bot/og/<name>.png.
//
// Design: the Ouro brand, light theme, matching ouroboros.bot's cards: warm
// paper, a scale-green rule across the top, the title in Cormorant Garamond,
// the description in Outfit, the page's approved product render on the right
// and the "ouro" wordmark bottom left.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const here = fileURLToPath(new URL("./og/", import.meta.url));

// page source → card file name and the approved render it shows.
export const cards = [
  { page: "index.html", name: "home", mark: "ouro" },
  { page: "apps/ouro-md/index.html", name: "ouro-md", mark: "ouro-md" },
  { page: "apps/shepherd/index.html", name: "shepherd", mark: "shepherd" },
];

export const cardUrl = (name) => `https://ouro.bot/og/${name}.png`;

const COLOR = {
  paper: "#FFFAF0",
  cream: "#F5EFE0",
  scale: "#1F6A37",
  fang: "#A8352A",
  ink: "#1A2118",
  mist: "#3D4839",
};

const div = (style, children) => ({ type: "div", props: { style, children } });
const dataUri = async (file) => `data:image/png;base64,${(await readFile(file)).toString("base64")}`;

export async function cardText(root, page) {
  const doc = new JSDOM(await readFile(`${root}/${page}`, "utf8")).window.document;
  const meta = (property) => doc.querySelector(`meta[property="${property}"]`)?.getAttribute("content");
  return { title: meta("og:title"), subtitle: meta("og:description") };
}

export async function renderCards(root, outDir) {
  const fonts = [
    { name: "Cormorant Garamond", data: await readFile(`${here}fonts/CormorantGaramond-Regular.ttf`), weight: 400, style: "normal" },
    { name: "Outfit", data: await readFile(`${here}fonts/Outfit-Regular.ttf`), weight: 400, style: "normal" },
  ];
  const ouroMark = await dataUri(`${here}marks/ouro.png`);
  await mkdir(outDir, { recursive: true });

  for (const card of cards) {
    const { title, subtitle } = await cardText(root, card.page);
    if (!title || !subtitle) throw new Error(`${card.page} needs og:title and og:description for its share card`);
    const mark = await dataUri(`${here}marks/${card.mark}.png`);
    const titleSize = title.length > 60 ? 62 : title.length > 40 ? 72 : title.length > 25 ? 84 : 96;

    const svg = await satori(
      div({ width: "1200px", height: "630px", display: "flex", position: "relative", background: `linear-gradient(160deg, ${COLOR.paper} 0%, ${COLOR.cream} 100%)`, fontFamily: "Outfit", overflow: "hidden" }, [
        div({ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: COLOR.scale }),
        div({ display: "flex", flexDirection: "column", justifyContent: "center", width: "760px", padding: "64px 0 120px 80px" }, [
          ...(card.tag ? [div({ display: "flex", fontSize: "22px", letterSpacing: "0.22em", textTransform: "uppercase", color: COLOR.fang, marginBottom: "28px" }, card.tag)] : []),
          div({ display: "flex", fontFamily: "Cormorant Garamond", fontWeight: 400, fontSize: `${titleSize}px`, lineHeight: 1.04, letterSpacing: "-0.01em", color: COLOR.ink, textWrap: "balance" }, title),
          div({ display: "flex", fontSize: "27px", lineHeight: 1.4, color: COLOR.mist, marginTop: "28px", textWrap: "balance" }, subtitle),
        ]),
        div({ position: "absolute", right: "72px", top: "0", bottom: "40px", width: "320px", display: "flex", alignItems: "center", justifyContent: "center" }, [
          { type: "img", props: { src: mark, width: 320, height: 320 } },
        ]),
        div({ position: "absolute", left: "80px", bottom: "48px", display: "flex", alignItems: "center", gap: "14px" }, [
          ...(card.mark === "ouro" ? [] : [{ type: "img", props: { src: ouroMark, width: 48, height: 48 } }]),
          div({ display: "flex", fontFamily: "Cormorant Garamond", fontWeight: 400, fontSize: "40px", color: COLOR.ink }, "ouro"),
        ]),
      ]),
      { width: 1200, height: 630, fonts },
    );
    const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
    await writeFile(`${outDir}/${card.name}.png`, png);
  }
  return cards.map((card) => `${card.name}.png`);
}

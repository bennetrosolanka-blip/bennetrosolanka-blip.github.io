const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const assert = require("assert");

const html = fs.readFileSync(
  path.join(__dirname, "..", "index.html"),
  "utf-8"
);
const $ = cheerio.load(html);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

// ── Document Structure ──

console.log("\nDocument Structure");

test("has DOCTYPE declaration", () => {
  assert.ok(html.trimStart().startsWith("<!DOCTYPE html>"));
});

test("has html element with lang attribute", () => {
  assert.strictEqual($("html").attr("lang"), "en");
});

test("has head element", () => {
  assert.strictEqual($("head").length, 1);
});

test("has body element", () => {
  assert.strictEqual($("body").length, 1);
});

test("has charset meta tag", () => {
  const charset = $('meta[charset]').attr("charset");
  assert.strictEqual(charset.toLowerCase(), "utf-8");
});

test("has viewport meta tag", () => {
  const viewport = $('meta[name="viewport"]');
  assert.strictEqual(viewport.length, 1);
  assert.ok(viewport.attr("content").includes("width=device-width"));
});

test("has title element with content", () => {
  const title = $("title").text();
  assert.ok(title.length > 0, "Title should not be empty");
  assert.ok(title.includes("Bennet Rosolanka"), "Title should contain name");
});

// ── Semantic HTML ──

console.log("\nSemantic HTML");

test("has header element", () => {
  assert.strictEqual($("header").length, 1);
});

test("has main element", () => {
  assert.strictEqual($("main").length, 1);
});

test("has footer element", () => {
  assert.strictEqual($("footer").length, 1);
});

test("has exactly one h1 element", () => {
  assert.strictEqual($("h1").length, 1);
});

// ── Header Section ──

console.log("\nHeader Section");

test("header contains logo with correct text", () => {
  const logo = $("header .logo");
  assert.strictEqual(logo.length, 1);
  assert.strictEqual(logo.text(), "BENNET ROSOLANKA");
});

test("header contains social links", () => {
  const links = $("header .header-socials a");
  assert.ok(links.length >= 2, "Should have at least 2 social links");
});

// ── Content Section ──

console.log("\nContent Section");

test("has intro section with tagline", () => {
  const tagline = $(".intro .tagline");
  assert.strictEqual(tagline.length, 1);
  assert.ok(tagline.text().length > 0);
});

test("h1 contains meaningful heading text", () => {
  const h1 = $("h1").text();
  assert.ok(h1.includes("tech sales"), "H1 should mention tech sales");
});

test("intro has descriptive paragraph", () => {
  const desc = $(".intro p").not(".tagline");
  assert.ok(desc.length >= 1);
  assert.ok(desc.first().text().length > 20, "Description should be substantial");
});

test("has card elements", () => {
  const cards = $(".card");
  assert.ok(cards.length >= 2, "Should have at least 2 cards");
});

test("each card has label, title, and description", () => {
  $(".card").each((i, el) => {
    const card = $(el);
    assert.ok(card.find(".card-label").text().length > 0, `Card ${i} missing label`);
    assert.ok(card.find(".card-title").text().length > 0, `Card ${i} missing title`);
    assert.ok(card.find(".card-desc").text().length > 0, `Card ${i} missing description`);
  });
});

// ── Links ──

console.log("\nLinks");

test("all external links have target=_blank", () => {
  $('a[href^="http"]').each((i, el) => {
    const target = $(el).attr("target");
    assert.strictEqual(target, "_blank", `Link ${i} missing target=_blank`);
  });
});

test("all external links have rel=noopener", () => {
  $('a[href^="http"]').each((i, el) => {
    const rel = $(el).attr("rel") || "";
    assert.ok(rel.includes("noopener"), `Link ${i} missing rel=noopener`);
  });
});

test("no links have empty href", () => {
  $("a").each((i, el) => {
    const href = $(el).attr("href");
    assert.ok(href && href.length > 0, `Link ${i} has empty href`);
  });
});

test("Instagram link points to correct profile", () => {
  const igLinks = $('a[href*="instagram.com/techsalesbennet"]');
  assert.ok(igLinks.length >= 1, "Should have Instagram link");
});

test("LinkedIn link points to correct profile", () => {
  const liLinks = $('a[href*="linkedin.com/in/bennetrosolanka"]');
  assert.ok(liLinks.length >= 1, "Should have LinkedIn link");
});

// ── Accessibility ──

console.log("\nAccessibility");

test("social links have aria-label attributes", () => {
  $(".header-socials a, .footer-socials a").each((i, el) => {
    const label = $(el).attr("aria-label");
    assert.ok(label && label.length > 0, `Social link ${i} missing aria-label`);
  });
});

test("SVG icons are present in social links", () => {
  $(".header-socials a, .footer-socials a").each((i, el) => {
    const svg = $(el).find("svg");
    assert.strictEqual(svg.length, 1, `Social link ${i} missing SVG icon`);
  });
});

test("SVGs have viewBox attribute", () => {
  $("svg").each((i, el) => {
    const viewBox = $(el).attr("viewBox") || $(el).attr("viewbox");
    assert.ok(viewBox, `SVG ${i} missing viewBox`);
  });
});

// ── Styles ──

console.log("\nStyles");

test("has embedded stylesheet", () => {
  assert.ok($("style").length >= 1, "Should have style element");
});

test("stylesheet contains responsive media query", () => {
  const styleContent = $("style").html();
  assert.ok(styleContent.includes("@media"), "Should have media query");
  assert.ok(styleContent.includes("max-width: 600px"), "Should have mobile breakpoint");
});

test("body uses dark background", () => {
  const styleContent = $("style").html();
  assert.ok(styleContent.includes("#0a0a0a"), "Body should use dark background color");
});

// ── Footer ──

console.log("\nFooter");

test("footer contains copyright text", () => {
  const footerText = $(".footer-text").text();
  assert.ok(footerText.includes("Bennet Rosolanka"), "Footer should contain name");
});

test("footer contains social links", () => {
  const links = $("footer .footer-socials a");
  assert.ok(links.length >= 2, "Footer should have at least 2 social links");
});

test("header and footer social links match", () => {
  const headerHrefs = $(".header-socials a").map((_, el) => $(el).attr("href")).get().sort();
  const footerHrefs = $(".footer-socials a").map((_, el) => $(el).attr("href")).get().sort();
  assert.deepStrictEqual(headerHrefs, footerHrefs, "Header and footer social links should match");
});

// ── CNAME ──

console.log("\nCNAME");

test("CNAME file exists with valid domain", () => {
  const cname = fs.readFileSync(path.join(__dirname, "..", "CNAME"), "utf-8").trim();
  assert.ok(cname.length > 0, "CNAME should not be empty");
  assert.ok(cname.includes("."), "CNAME should contain a valid domain");
});

// ── Summary ──

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);

/* ============================================================
   German Learning KB — anki-export.js
   Generates an Anki-importable text file from vocab data
   embedded on vocabulary pages.

   Usage on a vocab page:
     <button onclick="exportToAnki()">Export to Anki</button>

   Each vocab page must define window.VOCAB_DATA and
   window.ANKI_DECK before this script runs.

   VOCAB_DATA format:
   [
     {
       de:      "die Freundschaft, -en",
       en:      "friendship",
       example: "Unsere Freundschaft ist mir sehr wichtig.",
       tags:    "Lingoda::A2-1::Unit-101"   // optional override
     }, ...
   ]

   ANKI_DECK format:  "Lingoda::A2-1::Unit-101"

   Anki import instructions shown after download.
   ============================================================ */

function exportToAnki() {
  var data = window.VOCAB_DATA;
  var deck = window.ANKI_DECK || 'German::Lingoda';

  if (!data || !data.length) {
    alert('No vocabulary data found on this page.');
    return;
  }

  // ── Build file content ──────────────────────────────────────
  var lines = [
    '#separator:tab',
    '#html:false',
    '#notetype:Basic',
    '#tags column:4',
    '# Deck: ' + deck,
    '# Generated: ' + new Date().toISOString().split('T')[0],
    '# Import into Anki: File → Import → select this file',
    '# Field mapping: Front | Back | Extra (example) | Tags',
    ''
  ];

  data.forEach(function (item) {
    var front   = (item.de      || '').replace(/\t/g, ' ');
    var back    = (item.en      || '').replace(/\t/g, ' ');
    var extra   = (item.example || '').replace(/\t/g, ' ');
    var tags    = (item.tags    || deck).replace(/\s+/g, '-');
    lines.push(front + '\t' + back + '\t' + extra + '\t' + tags);
  });

  var content  = lines.join('\n');
  var blob     = new Blob([content], { type: 'text/plain;charset=utf-8' });
  var url      = URL.createObjectURL(blob);

  // ── Trigger download ────────────────────────────────────────
  var filename = deck.replace(/[^a-zA-Z0-9\-]/g, '-').toLowerCase() + '.txt';
  var a        = document.createElement('a');
  a.href       = url;
  a.download   = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // ── Show quick import tip ───────────────────────────────────
  var tip = document.getElementById('anki-tip');
  if (tip) {
    tip.style.display = 'block';
    tip.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

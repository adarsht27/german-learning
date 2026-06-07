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

   Card layout (2 fields, works with Anki Basic notetype):
     Front: German word (with article + plural notation)
     Back:  English meaning
            ─────────────────
            Example: [German sentence]

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
  // Uses #html:true so the Back field can show example on a second line.
  // Field mapping: Front (col 1) | Back+Example (col 2) | Tags (col 3)
  var lines = [
    '#separator:tab',
    '#html:true',
    '#notetype:Basic',
    '#tags column:3',
    '# Deck: ' + deck,
    '# Generated: ' + new Date().toISOString().split('T')[0],
    '# Import into Anki: File → Import → select this file',
    '# Field mapping: Front | Back (includes example) | Tags',
    ''
  ];

  data.forEach(function (item) {
    var front   = (item.de   || '').replace(/\t/g, ' ');
    var meaning = (item.en   || '').replace(/\t/g, ' ');
    var example = (item.example || '').replace(/\t/g, ' ');
    var tags    = (item.tags || deck).replace(/\s+/g, '-');

    // Combine meaning + example sentence + English translation into one Back field
    var example_en = (item.example_en || '').replace(/\t/g, ' ');
    var back = meaning;
    if (example) {
      back += '<br><hr style="border:none;border-top:1px solid #ccc;margin:6px 0">'
            + '<em>' + example + '</em>';
      if (example_en) {
        back += '<br><span style="color:#888;font-size:0.9em">' + example_en + '</span>';
      }
    }

    lines.push(front + '\t' + back + '\t' + tags);
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

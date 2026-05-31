#!/usr/bin/env python3
"""
extract-lingoda.py
==================
Batch-extracts text from Lingoda PDF lecture slides into clean Markdown files.
Produces one .md file per PDF — lightweight, structured, ready for Claude to read.

Usage
-----
    python tools/extract-lingoda.py <pdf-folder> <output-folder>

Examples
--------
    # Put all extracted .md files into lingoda-text/ inside the repo
    python tools/extract-lingoda.py "C:/Users/Adarsh/Downloads/Lingoda/A2.1" lingoda-text/A2.1

    # Or process a whole semester at once
    python tools/extract-lingoda.py "C:/Users/Adarsh/Downloads/Lingoda" lingoda-text

Install dependency (one-time)
------------------------------
    pip install pdfplumber

What it does
------------
- Walks the PDF folder recursively (finds files in sub-folders too)
- Extracts the text layer only — images are completely ignored (no memory hit)
- Cleans up common PDF artifacts: hyphenated line-breaks, lone page numbers,
  excessive whitespace, single-character blobs from layout boxes
- Flags PDFs that are fully image-based (no text layer) so you know to handle
  them separately
- Writes a _manifest.json summary of every file processed

Output format (one .md per PDF)
--------------------------------
    # Lecture Title
    Source / Pages / Date metadata
    ---
    ## Page 1
    [text from page 1]
    ---
    ## Page 2
    ...
"""

import sys
import os
import re
import json
from datetime import datetime

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber is not installed.")
    print("Run:   pip install pdfplumber")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Text cleaning
# ---------------------------------------------------------------------------

def clean_text(text: str) -> str:
    """Remove common PDF-extraction artifacts from a page's raw text."""
    if not text:
        return ""

    # Merge words broken across lines with a hyphen  (e.g. "Akkusa-\ntiv" → "Akkusativ")
    text = re.sub(r'-\n(\w)', r'\1', text)

    # Collapse 3+ consecutive blank lines to two
    text = re.sub(r'\n{3,}', '\n\n', text)

    cleaned_lines = []
    for line in text.split('\n'):
        stripped = line.strip()

        # Skip empty lines (preserve as blank separator)
        if not stripped:
            cleaned_lines.append('')
            continue

        # Skip lone page numbers  (1–3 digits, optionally surrounded by spaces)
        if re.fullmatch(r'\d{1,3}', stripped):
            continue

        # Skip single-character remnants from layout boxes / bullet graphics
        if len(stripped) == 1:
            continue

        # Skip lines that are pure punctuation or whitespace noise
        if re.fullmatch(r'[•·▪▸►◆○●\-–—|/\\]+', stripped):
            continue

        cleaned_lines.append(line)

    return '\n'.join(cleaned_lines).strip()


# ---------------------------------------------------------------------------
# Single-PDF extraction
# ---------------------------------------------------------------------------

def extract_pdf(pdf_path: str, output_path: str) -> tuple[int, int, str | None]:
    """
    Extract text from *pdf_path* and write a Markdown file to *output_path*.

    Returns (total_pages, pages_with_text, error_message_or_None).
    """
    filename = os.path.basename(pdf_path)
    # Make a readable title from the filename
    title = os.path.splitext(filename)[0]
    title = re.sub(r'[_\-]+', ' ', title).strip()

    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            pages_text: list[tuple[int, str]] = []

            for i, page in enumerate(pdf.pages, start=1):
                raw = page.extract_text(x_tolerance=3, y_tolerance=3)
                cleaned = clean_text(raw or '')
                if cleaned:
                    pages_text.append((i, cleaned))

        # ── Build Markdown ──────────────────────────────────────────────
        md_lines = [
            f"# {title}",
            "",
            f"**Source file:** `{filename}`  ",
            f"**Total pages:** {total_pages}  ",
            f"**Pages with extractable text:** {len(pages_text)}  ",
            f"**Extracted:** {datetime.now().strftime('%Y-%m-%d')}  ",
            "",
            "---",
            "",
        ]

        if not pages_text:
            md_lines += [
                "> ⚠️ No text layer found — this PDF consists entirely of images.",
                "> Drop it temporarily into the connected folder and ask Claude to read it as an image.",
            ]
        else:
            for page_num, text in pages_text:
                md_lines += [
                    f"## Page {page_num}",
                    "",
                    text,
                    "",
                    "---",
                    "",
                ]

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(md_lines))

        return total_pages, len(pages_text), None

    except Exception as exc:
        return 0, 0, str(exc)


# ---------------------------------------------------------------------------
# Slug helper
# ---------------------------------------------------------------------------

def to_slug(name: str) -> str:
    """Convert a filename (without extension) to a safe lowercase slug."""
    slug = os.path.splitext(name)[0]
    slug = re.sub(r'[^\w\s\-]', '', slug)   # strip special chars
    slug = re.sub(r'[\s_]+', '-', slug)      # spaces/underscores → hyphens
    slug = re.sub(r'-{2,}', '-', slug)       # collapse double hyphens
    return slug.strip('-').lower()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    pdf_folder    = sys.argv[1]
    output_folder = sys.argv[2]

    if not os.path.isdir(pdf_folder):
        print(f"ERROR: '{pdf_folder}' is not a directory.")
        sys.exit(1)

    os.makedirs(output_folder, exist_ok=True)

    # ── Discover PDFs ────────────────────────────────────────────────────
    pdf_files: list[str] = []
    for root, _, files in os.walk(pdf_folder):
        for f in sorted(files):
            if f.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(root, f))

    if not pdf_files:
        print(f"No PDF files found in '{pdf_folder}'.")
        sys.exit(0)

    print(f"Found {len(pdf_files)} PDF(s). Extracting → '{output_folder}/'")
    print()

    # ── Process each PDF ─────────────────────────────────────────────────
    results = []
    for idx, pdf_path in enumerate(pdf_files, start=1):
        filename = os.path.basename(pdf_path)
        slug     = to_slug(filename)
        out_path = os.path.join(output_folder, slug + '.md')

        # Avoid overwriting if two PDFs would produce the same slug
        if os.path.exists(out_path):
            slug     = slug + f'-{idx}'
            out_path = os.path.join(output_folder, slug + '.md')

        print(f"  [{idx:>3}/{len(pdf_files)}] {filename}", end='  …  ', flush=True)

        total, with_text, error = extract_pdf(pdf_path, out_path)

        if error:
            print(f"FAILED — {error}")
            results.append({
                'file':   filename,
                'output': None,
                'status': 'error',
                'error':  error,
            })
        elif with_text == 0:
            print(f"image-only  ({total} pages, no text layer)")
            results.append({
                'file':         filename,
                'output':       os.path.basename(out_path),
                'total_pages':  total,
                'text_pages':   0,
                'status':       'image-only',
            })
        else:
            print(f"OK  ({with_text}/{total} pages have text)")
            results.append({
                'file':         filename,
                'output':       os.path.basename(out_path),
                'total_pages':  total,
                'text_pages':   with_text,
                'status':       'ok',
            })

    # ── Write manifest ───────────────────────────────────────────────────
    manifest_path = os.path.join(output_folder, '_manifest.json')
    manifest = {
        'extracted':     datetime.now().isoformat(timespec='seconds'),
        'source_folder': os.path.abspath(pdf_folder),
        'total_pdfs':    len(pdf_files),
        'files':         results,
    }
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    # ── Summary ──────────────────────────────────────────────────────────
    n_ok    = sum(1 for r in results if r['status'] == 'ok')
    n_empty = sum(1 for r in results if r['status'] == 'image-only')
    n_err   = sum(1 for r in results if r['status'] == 'error')

    print()
    print("─" * 60)
    print(f"  ✓ Extracted with text : {n_ok}")
    print(f"  ⚠ Image-only (no text): {n_empty}")
    print(f"  ✗ Errors              : {n_err}")
    print(f"  Manifest saved to     : {manifest_path}")
    print("─" * 60)

    if n_empty:
        print()
        print(f"  {n_empty} PDFs had no text layer (all images).")
        print("  For those lectures, drop the PDF into the repo folder")
        print("  temporarily and ask Claude to read it as an image.")

    if n_err:
        print()
        print("  Files that failed:")
        for r in results:
            if r['status'] == 'error':
                print(f"    • {r['file']}  →  {r['error']}")


if __name__ == '__main__':
    main()

/**
 * converters.js – File-format converters
 *
 * Given a MIME type + binary Buffer, returns a plain-text string Claude can read.
 *
 * Supported:
 *   Google Docs   → exported as text/plain by Drive API (no local conversion needed)
 *   Google Sheets → exported as text/csv  (no local conversion needed)
 *   Google Slides → exported as text/plain (no local conversion needed)
 *   PDF           → pdf-parse
 *   .docx         → mammoth
 *   .xlsx / .xls  → xlsx
 *   .pptx         → adm-zip (unzip PPTX + parse slide XML)
 *   text/*        → return as-is
 */

import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';

/**
 * Convert a file buffer to plain text based on its MIME type.
 *
 * @param {Buffer} buffer   - Raw file bytes
 * @param {string} mimeType - MIME type of the file
 * @param {string} fileName - Original filename (used as fallback for MIME detection)
 * @returns {Promise<string>} Plain text content
 */
export async function convertToText(buffer, mimeType, fileName = '') {
  // ── PDF ──────────────────────────────────────────────────────────────────
  if (mimeType === 'application/pdf') {
    const data = await pdf(buffer);
    return data.text.trim();
  }

  // ── Word (.docx) ────────────────────────────────────────────────────────
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.toLowerCase().endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  // ── Excel (.xlsx) ────────────────────────────────────────────────────────
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel' ||
    fileName.toLowerCase().endsWith('.xlsx') ||
    fileName.toLowerCase().endsWith('.xls')
  ) {
    return excelToText(buffer);
  }

  // ── PowerPoint (.pptx) ──────────────────────────────────────────────────
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mimeType === 'application/vnd.ms-powerpoint' ||
    fileName.toLowerCase().endsWith('.pptx') ||
    fileName.toLowerCase().endsWith('.ppt')
  ) {
    return pptxToText(buffer);
  }

  // ── Plain text (txt, md, csv, json, code, etc.) ──────────────────────────
  if (mimeType.startsWith('text/') || isTextualMime(mimeType) || isTextualExtension(fileName)) {
    return buffer.toString('utf8');
  }

  throw new Error(
    `Unsupported file type: ${mimeType} (${fileName}). ` +
    'Supported: Google Docs/Sheets/Slides, PDF, DOCX, XLSX, PPTX, and plain text.'
  );
}

// ---------------------------------------------------------------------------
// Excel → Markdown-style text (one section per sheet)
// ---------------------------------------------------------------------------
function excelToText(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const parts = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csv.trim()) {
      parts.push(`## Sheet: ${sheetName}\n\n${csv}`);
    }
  }

  return parts.length === 0 ? '(Empty spreadsheet)' : parts.join('\n\n---\n\n');
}

// ---------------------------------------------------------------------------
// PPTX → Text (slide by slide)
// A PPTX file is a ZIP archive. We open it with adm-zip, find each
// ppt/slides/slideN.xml entry, and extract text from <a:t>…</a:t> nodes.
// ---------------------------------------------------------------------------
function pptxToText(buffer) {
  let zip;
  try {
    zip = new AdmZip(buffer);
  } catch (err) {
    throw new Error(`Could not open PPTX file as ZIP: ${err.message}`);
  }

  const entries = zip.getEntries();

  // Collect slide entries and sort them numerically
  const slideEntries = entries
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/(\d+)\.xml$/)[1], 10);
      const numB = parseInt(b.entryName.match(/(\d+)\.xml$/)[1], 10);
      return numA - numB;
    });

  if (slideEntries.length === 0) {
    return '(No slides found in presentation)';
  }

  const slides = slideEntries.map((entry, i) => {
    const xml = entry.getData().toString('utf8');
    const text = extractTextFromSlideXml(xml);
    return `Slide ${i + 1}:\n${text || '(no text)'}`;
  });

  return slides.join('\n\n---\n\n');
}

/**
 * Extracts all text from a slide's XML by collecting <a:t> element content.
 * Paragraphs (<a:p>) are joined with newlines; runs within a paragraph with spaces.
 */
function extractTextFromSlideXml(xml) {
  const paragraphs = [];
  const paraRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g;
  let paraMatch;

  while ((paraMatch = paraRegex.exec(xml)) !== null) {
    const paraContent = paraMatch[1];
    const runTexts = [];

    const runRegex = /<a:t\b[^>]*>([^<]*)<\/a:t>/g;
    let runMatch;
    while ((runMatch = runRegex.exec(paraContent)) !== null) {
      const text = runMatch[1].trim();
      if (text) runTexts.push(text);
    }

    if (runTexts.length > 0) {
      paragraphs.push(runTexts.join(' '));
    }
  }

  return paragraphs.join('\n');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isTextualMime(mime) {
  return [
    'application/json', 'application/xml', 'application/javascript',
    'application/typescript', 'application/x-yaml', 'application/yaml',
  ].includes(mime);
}

function isTextualExtension(name) {
  return [
    '.txt', '.md', '.csv', '.json', '.xml', '.yaml', '.yml',
    '.js', '.ts', '.py', '.rb', '.go', '.java', '.c', '.cpp',
    '.html', '.css', '.sh', '.ps1', '.env', '.log',
  ].some((ext) => name.toLowerCase().endsWith(ext));
}

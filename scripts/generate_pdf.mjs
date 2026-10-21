import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const projectRoot = process.cwd();
const mdPath = path.join(projectRoot, 'PROJECT_REPORT.md');
const outPdfPath = path.join(projectRoot, 'PROJECT_REPORT.pdf');
const tempHtmlPath = '/tmp/project_report_print.html';

console.log('Converting PROJECT_REPORT.md to HTML via marked...');
// Run marked via npx
execSync(`npx -y marked "${mdPath}" -o /tmp/marked_raw.html`, { stdio: 'inherit' });

let rawHtml = fs.readFileSync('/tmp/marked_raw.html', 'utf-8');

// Clean up redundant breaks around page break divs to ensure zero empty pages
rawHtml = rawHtml.replace(/<div style="page-break-after: always;"><\/div>\s*<br\s*\/?>/gi, '<div class="page-break"></div>');
rawHtml = rawHtml.replace(/<div style="page-break-after: always;"><\/div>/gi, '<div class="page-break"></div>');
rawHtml = rawHtml.replace(/<br\s*\/?>\s*<div class="page-break"><\/div>/gi, '<div class="page-break"></div>');
rawHtml = rawHtml.replace(/<hr\s*\/?>\s*<div class="page-break"><\/div>/gi, '<div class="page-break"></div>');
rawHtml = rawHtml.replace(/<div class="page-break"><\/div>\s*<hr\s*\/?>/gi, '<div class="page-break"></div>');
rawHtml = rawHtml.replace(/<div class="page-break"><\/div>\s*<div class="page-break"><\/div>/gi, '<div class="page-break"></div>');

// Remove redundant empty paragraphs or double breaks
rawHtml = rawHtml.replace(/<p>\s*<\/p>/gi, '');

const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>B.Tech Project Report - Anushka Bansal</title>
  <style>
    @media print {
      @page {
        size: A4 portrait;
        margin: 20mm 18mm 20mm 18mm;
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: "Times New Roman", Times, "Liberation Serif", serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #111;
      text-align: justify;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    h1, h2, h3, h4, h5 {
      font-family: "Times New Roman", Times, serif;
      color: #000;
      break-after: avoid;
      page-break-after: avoid;
    }
    h1 {
      font-size: 17pt;
      text-align: center;
      margin-top: 10px;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
    h2 {
      font-size: 13.5pt;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    h3 {
      font-size: 11.5pt;
      margin-top: 12px;
      margin-bottom: 6px;
    }
    .abstract-container, .abstract-container p, .abstract-container li {
      font-size: 8.8pt !important;
      line-height: 1.34 !important;
      margin: 0.25em 0 !important;
    }
    p {
      margin: 0.45em 0;
    }
    ul, ol {
      margin: 0.35em 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 2px;
      line-height: 1.4;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 9pt;
      page-break-inside: auto;
      break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th, td {
      border: 1px solid #444;
      padding: 5px 7px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    pre, code {
      font-family: "Courier New", Courier, monospace;
      font-size: 8pt;
    }
    pre {
      background-color: #f8f8f8;
      border: 1px solid #ddd;
      padding: 6px 10px;
      border-radius: 3px;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 8px 0;
      line-height: 1.35;
      page-break-inside: auto;
    }
    code {
      background: #f2f2f2;
      padding: 1px 3px;
      border-radius: 2px;
    }
    pre code {
      background: transparent;
      padding: 0;
    }
    hr {
      border: 0;
      border-top: 1px solid #ccc;
      margin: 12px 0;
    }
    .report-header {
      text-align: center;
      font-style: italic;
      font-size: 9pt;
      color: #333;
      border-bottom: 1px solid #222;
      padding-bottom: 2px;
      margin-bottom: 16px;
    }
    .page-number-right {
      text-align: right;
      font-size: 10pt;
      margin-top: 20px;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
      height: 0;
      min-height: 0;
      margin: 0;
      padding: 0;
      border: none;
      line-height: 0;
      font-size: 0;
    }
    table[style*="border: none"] td,
    table[style*="border: none"] th {
      border: none !important;
    }
  </style>
</head>
<body>
${rawHtml}
</body>
</html>`;

fs.writeFileSync(tempHtmlPath, completeHtml);
console.log('HTML saved to ' + tempHtmlPath);

console.log('Running headless Chrome to generate vector PDF...');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const cmd = `"${chromePath}" --headless=new --disable-gpu --no-first-run --no-default-browser-check --no-pdf-header-footer --user-data-dir=/tmp/chrome_pdf_tmp --print-to-pdf="${outPdfPath}" "file://${tempHtmlPath}"`;

execSync(cmd, { stdio: 'inherit' });

console.log('PDF generated at ' + outPdfPath);

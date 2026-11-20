#!/usr/bin/env python3
"""Create a print-ready A4 PDF from the vocalized Hanukkah quiz."""
from pathlib import Path
import html
import markdown
from weasyprint import HTML

root = Path(__file__).resolve().parents[2]
src = root / "מעוז/קריאה/חידון חנוכה לילדים - שאלות 1-20 - מנוקד.md"
dst = root / "מעוז/קריאה/חידון חנוכה לילדים - שאלות 1-20 - מנוקד.pdf"
text = src.read_text(encoding="utf-8")
parts = text.split("\n---\n", 1)
quiz = markdown.markdown(parts[0], extensions=["tables"])
answers = markdown.markdown(parts[1], extensions=["tables"]) if len(parts) > 1 else ""
css = """
@page { size: A4; margin: 17mm 19mm 17mm 19mm; }
@font-face { font-family: NotoHeb; src: local("Noto Sans Hebrew"); }
body { font-family: NotoHeb, sans-serif; direction: rtl; text-align: right;
       font-size: 13pt; line-height: 1.65; color: #161616; }
h1 { font-size: 21pt; text-align: center; margin: 0 0 12pt; }
h2 { font-size: 16pt; border-bottom: 1px solid #777; padding-bottom: 4pt; margin: 17pt 0 9pt; }
p { margin: 0 0 8pt; }
strong { font-weight: 700; }
p:has(> strong:first-child) { margin-top: 13pt; }
p:has(> strong:first-child) + p { margin-top: 4pt; }
h2, p { orphans: 2; widows: 2; }
table { width: 100%; border-collapse: collapse; font-size: 12pt; }
th, td { border: 1px solid #aaa; padding: 5pt 8pt; text-align: center; }
.answers { break-before: page; }
.answers h2 { margin-top: 0; }
"""
page = '<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><style>' + css + '</style><body><main>' + quiz + '</main><section class="answers">' + answers + '</section></body></html>'
HTML(string=page, base_url=str(root)).write_pdf(str(dst))
print(dst)

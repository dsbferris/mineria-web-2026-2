#!/usr/bin/env bash
# Regenerate the searchable course PDFs:
#   final.pdf      lectures + READMEs + executed notebooks, with bookmarks per session
#   lectures.pdf   lecture slides only (from ../lectures/NN/*.pdf)
#   notebooks.pdf  READMEs + executed notebooks
#   <notebook>.pdf next to every notebook
#
# Notebooks are executed on a copy of the repo in $BUILD, so tracked notebooks and CSVs stay
# untouched. tienda-virtual is started on :3000 if nothing is listening there (needed by the
# scraping notebooks of sessions 01-03). Every part is OCR'd (spa+eng) so text in images is
# searchable.
#
# Usage: ./pdf.sh            full run
#        SKIP_EXEC=1 ./pdf.sh   reuse notebooks already executed in $BUILD, only rebuild PDFs
#
# Requires: brew install ocrmypdf tesseract tesseract-lang pandoc uv; node/npm.
set -euo pipefail
shopt -s nullglob

REPO="$(cd "$(dirname "$0")" && pwd)"
LECTURES="${LECTURES:-$REPO/../lectures}"
BUILD="${BUILD:-${XDG_CACHE_HOME:-$HOME/.cache}/mineria-pdf}"
VENV="${VENV:-$HOME/.virtualenvs/$(cat "$REPO/.venv")}"   # shared env; .venv is a pointer file
PY="$VENV/bin/python"
PY311="$BUILD/venv311/bin/python"                        # session 05: gensim does not build on 3.14
OCR_JOBS="${OCR_JOBS:-4}"

log() { printf '\033[1m==> %s\033[0m\n' "$*"; }
for t in ocrmypdf tesseract pandoc uv npm rsync curl; do
  command -v "$t" >/dev/null || { echo "missing: $t" >&2; exit 1; }
done
[ -x "$PY" ] || { echo "python env not found: $VENV" >&2; exit 1; }
mkdir -p "$BUILD"/{logs,raw,ocr,lectures,kernels}

# ---------------------------------------------------------------- environments
log "Checking Python environments"
"$PY" -c "import es_core_news_sm" 2>/dev/null ||
  "$PY" -m pip install -q https://github.com/explosion/spacy-models/releases/download/es_core_news_sm-3.8.0/es_core_news_sm-3.8.0-py3-none-any.whl
"$PY" -m playwright install chromium >/dev/null
if [ ! -x "$PY311" ]; then
  uv venv -q -p 3.11 "$BUILD/venv311"
  VIRTUAL_ENV="$BUILD/venv311" uv pip install -q -r "$REPO/sesion-de-clase-05/requirements.txt" ipykernel \
    https://github.com/explosion/spacy-models/releases/download/es_core_news_sm-3.8.0/es_core_news_sm-3.8.0-py3-none-any.whl
fi
"$PY" -m ipykernel install --prefix "$BUILD/kernels" --name shared >/dev/null 2>&1
"$PY311" -m ipykernel install --prefix "$BUILD/kernels" --name py311 >/dev/null 2>&1
export JUPYTER_PATH="$BUILD/kernels/share/jupyter"

# ---------------------------------------------------------------- tienda-virtual
APP_PID=""
TV="$REPO/tienda-virtual"
cleanup() {
  [ -n "$APP_PID" ] || return 0
  log "Stopping tienda-virtual"
  # npm -> sh -> next: kill the listener we started (port was free before), then the npm process
  lsof -ti tcp:3000 -sTCP:LISTEN | xargs kill 2>/dev/null || true
  kill "$APP_PID" 2>/dev/null || true
  # next dev rewrites next-env.d.ts and drops agent docs into the app; undo what it created
  for f in $GENERATED; do rm -f "$TV/$f"; done
  if [ -n "$ENV_DTS_CLEAN" ]; then git -C "$REPO" checkout -- tienda-virtual/next-env.d.ts 2>/dev/null || true; fi
}
trap cleanup EXIT
if [ -z "${SKIP_EXEC:-}" ] && ! curl -sf -o /dev/null localhost:3000/api/health; then
  log "Starting tienda-virtual"
  GENERATED=""
  for f in AGENTS.md CLAUDE.md; do [ -e "$TV/$f" ] || GENERATED="$GENERATED $f"; done
  ENV_DTS_CLEAN=""
  git -C "$REPO" diff --quiet -- tienda-virtual/next-env.d.ts && ENV_DTS_CLEAN=1
  [ -d "$TV/node_modules" ] || (cd "$TV" && npm install)
  [ -f "$TV/.env.local" ] || [ -f "$TV/.env" ] || cp "$TV/.env.example" "$TV/.env.local"
  (cd "$TV" && exec npm run dev) >"$BUILD/logs/tienda-virtual.log" 2>&1 &
  APP_PID=$!
  for _ in $(seq 120); do curl -sf -o /dev/null localhost:3000/api/health && break; sleep 1; done
  curl -sf -o /dev/null localhost:3000/api/health || { echo "tienda-virtual did not start" >&2; exit 1; }
fi

# ---------------------------------------------------------------- execute
SESSIONS=$(cd "$REPO" && ls -d sesion-de-clase-* | sort)
if [ -z "${SKIP_EXEC:-}" ]; then
  log "Copying repo to $BUILD/repo"
  rsync -a --delete --exclude tienda-virtual --exclude .git --exclude .venv --exclude '*.pdf' \
    --exclude .ipynb_checkpoints "$REPO/" "$BUILD/repo/"

  log "Running session 01 scripts"
  (
    cd "$BUILD/repo/sesion-de-clase-01" && mkdir -p data
    echo "Sesión 01 — scripts de scraping (tienda_scraper) y su salida"; echo
    for f in tienda_scraper/{config,scraper,parser,writer}.py scripts/ejercicio*.py; do
      echo "===== $f ====="; echo; cat "$f"; echo
    done
    echo "===== Salida de ejecución ====="; echo
    for s in scripts/ejercicio*.py; do
      m=$(basename "$s" .py); echo "\$ python -m scripts.$m"
      "$PY" -m "scripts.$m" 2>&1 | head -40; echo
    done
  ) > "$BUILD/s01_scripts.txt"

  for d in $SESSIONS lab_sentimiento; do
    kernel=shared; [ "$d" = sesion-de-clase-05 ] && kernel=py311
    for nb in "$BUILD/repo/$d"/notebooks/*.ipynb "$BUILD/repo/$d"/*.ipynb; do
      [ -s "$nb" ] || continue                     # skip empty placeholder notebooks
      start=$SECONDS
      (cd "$(dirname "$nb")" && "$PY" -m jupyter nbconvert --to notebook --execute --inplace --allow-errors \
        --ExecutePreprocessor.kernel_name=$kernel --ExecutePreprocessor.timeout=3600 "$(basename "$nb")") \
        >"$BUILD/logs/exec_${d}_$(basename "$nb" .ipynb).log" 2>&1
      errs=$(grep -c '"output_type": "error"' "$nb" || true)
      printf '  %-70s %4ss  errors=%s\n' "$d/$(basename "$nb")" $((SECONDS - start)) "$errs"
    done
  done
fi

# ---------------------------------------------------------------- render to PDF
cat > "$BUILD/to_pdf.py" <<'EOF'
"""Render .ipynb / .md / .txt to PDF via HTML + headless Chromium. usage: to_pdf.py in1 out1 [in2 out2 ...]"""
import sys, os, json, subprocess, pathlib, tempfile, html
from nbconvert import HTMLExporter
import nbformat
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(os.environ["NB_ROOT"]).resolve()
PLOTLY = '<script src="https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.35.2/plotly.min.js"></script>'
CSS = """<style>
@page { size: A4; margin: 12mm; }
body { font-size: 11px; }
.jp-Notebook { padding: 0 !important; }
pre, .jp-OutputArea-output pre { white-space: pre-wrap !important; word-break: break-word; }
.jp-InputPrompt, .jp-OutputPrompt { display:none !important; }
img, svg { max-width: 100% !important; height: auto; }
table { font-size: 9px; }
.jp-OutputArea-output { overflow: visible !important; max-height: none !important; }
</style>"""

def nb_html(p):
    nb = nbformat.read(p, as_version=4)
    n = 0
    for c in nb.cells:
        if "outputs" not in c:
            continue
        # merge consecutive stream chunks, then collapse \r progress bars to their final state
        merged = []
        for o in c["outputs"]:
            if (o.get("output_type") == "stream" and merged and merged[-1].get("output_type") == "stream"
                    and merged[-1]["name"] == o["name"]):
                merged[-1]["text"] += o["text"]
            else:
                merged.append(o)
        c["outputs"] = merged
        for o in merged:
            if o.get("output_type") == "stream":
                o["text"] = "\n".join(l.rstrip("\r").split("\r")[-1] for l in o["text"].split("\n"))
            # plotly figures stored only as JSON: draw them with plotly.js
            d = o.get("data", {})
            if "application/vnd.plotly.v1+json" in d and "text/html" not in d:
                fig = json.dumps(d.pop("application/vnd.plotly.v1+json"))
                n += 1
                d["text/html"] = (f"<div id='plt{n}'></div><script>(function(f){{Plotly.newPlot('plt{n}',f.data,"
                                  f"Object.assign({{}},f.layout,{{width:720}}),{{staticPlot:true}})}})({fig});</script>")
    body, _ = HTMLExporter(template_name="lab").from_notebook_node(nb)
    name = p.relative_to(ROOT) if ROOT in p.parents else p.name
    title = f"<h1 style='font-family:sans-serif;border-bottom:2px solid #333'>{html.escape(str(name))}</h1>"
    # plotly.js must load before require.js, otherwise it registers as an AMD module, not window.Plotly
    body = body.replace("<head>", "<head>" + PLOTLY, 1).replace("</head>", CSS + "</head>", 1)
    return body.replace("<main>", "<main>" + title, 1)

def md_html(p):
    out = subprocess.run(["pandoc", str(p), "-s", "--metadata", f"title={p.parent.name}/{p.name}",
                          "-c", "https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.min.css"],
                         capture_output=True, text=True, check=True).stdout
    return out.replace("<body>", "<body class='markdown-body' style='padding:10px'>").replace("</head>", CSS + "</head>")

def txt_html(p):
    return (f"<html><head><meta charset='utf-8'>{CSS}</head><body><h1 style='font-family:sans-serif'>"
            f"{html.escape(p.stem)}</h1><pre>{html.escape(p.read_text())}</pre></body></html>")

args = sys.argv[1:]
failed = 0
with sync_playwright() as pw:
    page = pw.chromium.launch().new_page()
    for src, dst in zip(args[::2], args[1::2]):
        p = pathlib.Path(src).resolve()
        h = nb_html(p) if p.suffix == ".ipynb" else md_html(p) if p.suffix == ".md" else txt_html(p)
        with tempfile.NamedTemporaryFile("w", suffix=".html", dir=p.parent, delete=False) as f:
            f.write(h)
        try:
            page.goto(f"file://{f.name}", wait_until="networkidle", timeout=120000)
            page.wait_for_timeout(1500)
            page.pdf(path=dst, format="A4", print_background=True,
                     margin=dict(top="12mm", bottom="12mm", left="10mm", right="10mm"))
        except Exception as e:
            failed += 1
            print("FAIL", src, e, file=sys.stderr)
        finally:
            os.unlink(f.name)
sys.exit(1 if failed else 0)
EOF

log "Rendering notebooks and READMEs"
rm -f "$BUILD"/raw/*.pdf "$BUILD"/ocr/*.pdf
set --
for d in $SESSIONS lab_sentimiento; do
  for nb in "$BUILD/repo/$d"/notebooks/*.ipynb "$BUILD/repo/$d"/*.ipynb; do
    [ -s "$nb" ] && set -- "$@" "$nb" "$BUILD/raw/${d}__$(basename "$nb" .ipynb).pdf"
  done
  [ -f "$BUILD/repo/$d/README.md" ] && set -- "$@" "$BUILD/repo/$d/README.md" "$BUILD/raw/${d}__README.pdf"
done
set -- "$@" "$BUILD/s01_scripts.txt" "$BUILD/raw/sesion-de-clase-01__scripts.pdf"
NB_ROOT="$BUILD/repo" "$PY" "$BUILD/to_pdf.py" "$@" 2> >(grep -v -e UserWarning -e "{%-" >&2)

# ---------------------------------------------------------------- OCR
# --redo-ocr keeps the existing text layer and only OCRs regions without text (images, charts)
log "OCR (spa+eng)"
ocr() { ocrmypdf -q -l spa+eng --redo-ocr --output-type pdf "$1" "$2" >"$BUILD/logs/ocr_$(basename "$2" .pdf).log" 2>&1 ||
          { echo "OCR failed: $1 (see logs)" >&2; return 1; }; }
export -f ocr; export BUILD
for f in "$LECTURES"/*/*.pdf; do
  n=$(basename "$(dirname "$f")"); out="$BUILD/lectures/$n.pdf"
  [ "$out" -nt "$f" ] || printf '%s\0%s\0' "$f" "$out"     # lectures rarely change: cache their OCR
done | xargs -0 -n2 -P "$OCR_JOBS" bash -c 'ocr "$0" "$1"'
for f in "$BUILD"/raw/*.pdf; do printf '%s\0%s\0' "$f" "$BUILD/ocr/$(basename "$f")"; done |
  xargs -0 -n2 -P "$OCR_JOBS" bash -c 'ocr "$0" "$1"'

# ---------------------------------------------------------------- assemble
log "Assembling final.pdf, lectures.pdf, notebooks.pdf"
uv run -q --no-project --with pypdf python - "$BUILD" "$LECTURES" "$REPO" <<'EOF'
import sys, glob, os
from pypdf import PdfWriter, PdfReader
build, lectures, repo = sys.argv[1:4]
nbs = lambda prefix: sorted(f for f in glob.glob(f"{build}/ocr/{prefix}__*.pdf")
                            if not f.endswith(("__README.pdf", "__scripts.pdf")))
title = lambda f: os.path.basename(f)[:-4].split("__", 1)[1] + ".ipynb"
rows = []  # (section, kind, title, pdf)
for d in sorted(glob.glob(f"{repo}/sesion-de-clase-*")):
    n = d[-2:]; sec = f"Sesión {n}"
    for lec in glob.glob(f"{lectures}/{n}/*.pdf")[:1]:
        name = os.path.basename(lec).removesuffix(".pdf").removesuffix(".pptx")
        rows.append((sec, "lecture", f"Clase: {name}", f"{build}/lectures/{n}.pdf"))
    for k, t in [("README", "README"), ("scripts", "scripts (tienda_scraper) + salida")]:
        f = f"{build}/ocr/sesion-de-clase-{n}__{k}.pdf"
        if os.path.exists(f): rows.append((sec, "readme", t, f))
    rows += [(sec, "notebook", title(f), f) for f in nbs(f"sesion-de-clase-{n}")]
    if n == "07":
        rows += [("Laboratorio de sentimiento", "notebook", title(f), f) for f in nbs("lab_sentimiento")]

def build_pdf(out, kinds):
    w = PdfWriter(); parents = {}
    for sec, kind, t, path in rows:
        if kind not in kinds: continue
        start = len(w.pages)
        w.append(PdfReader(path))
        if sec not in parents: parents[sec] = w.add_outline_item(sec, start)
        w.add_outline_item(t, start, parent=parents[sec])
    w.page_mode = "/UseOutlines"
    w.write(out)
    print(f"  {os.path.basename(out)}: {len(w.pages)} pages")
build_pdf(f"{repo}/final.pdf", {"lecture", "readme", "notebook"})
build_pdf(f"{repo}/lectures.pdf", {"lecture"})
build_pdf(f"{repo}/notebooks.pdf", {"readme", "notebook"})
EOF

log "Copying per-notebook PDFs next to the notebooks"
count=0
for f in "$BUILD"/ocr/*__*.pdf; do
  b=$(basename "$f"); d=${b%%__*}; name=${b#*__}
  case $name in README.pdf|scripts.pdf) continue ;; esac
  for dst in "$REPO/$d/notebooks/$name" "$REPO/$d/$name"; do
    if [ -f "${dst%.pdf}.ipynb" ]; then cp "$f" "$dst"; count=$((count + 1)); break; fi
  done
done
echo "  $count notebook PDFs"
log "Done"

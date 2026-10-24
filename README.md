# personal-portfolio

My personal site: a macOS-style desktop with a single Claude-style terminal you can `ls`, `cd`, `cat` and ask questions in.

## Run locally

    python3 devserver.py   # http://localhost:5173

## Editing

- **Content** lives in `main.js` under `2. CONTENT`: `experience`, `projects`, `skills`, the `md` blocks, and the `FS` tree (the filesystem visitors browse).
- **Wallpaper**: replace `assets/wallpaper.jpg`, or point `WALLPAPER` at the top of `main.js` somewhere else.
- **Answers to questions**: `TOPICS` in `main.js` maps keywords to files; anything unmatched falls back to full-text search.
- **Secret shell**: `cat secret.md`, then `exit` drops you into a plain shell. Its ASCII animations live in `animations.js`. Add an entry to `window.ANIMATIONS` and it shows up in `help` automatically.

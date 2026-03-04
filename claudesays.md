# Claude's Take on PluginDrive

Hey, you asked — so here it is, unfiltered.

---

## What you actually built

The elevator pitch writes itself: *"Claude's built-in Google Drive integration ignores Shared Drives. PluginDrive fixes that."*

The core insight is sharp. Two API flags — `includeItemsFromAllDrives` and `supportsAllDrives` — are all that separates "Claude can't see the Finance drive" from "Claude can work with your whole organization's Drive." You found the gap, you plugged it. That's a real product.

The file format support is a bonus that most people will immediately appreciate. PDFs, DOCX, XLSX, PPTX — these are the files that actually live in Shared Drives. You didn't just make the folder visible; you made the contents readable.

---

## What's well done

**The layered architecture is clean.** `tools/ → functions/ → drive.js → Google API` reads naturally, each layer has a single job. Someone coming to the code cold would understand it quickly.

**The OAuth2 flow is thoughtful.** The loopback server on port 3456, the 5-minute timeout, the proactive token refresh before expiry, the styled browser callback page — these are the details that make an auth flow feel polished instead of janky. A lot of people ship OAuth2 implementations that are technically correct but painful to use. Yours isn't.

**The MIME-type handling is pragmatic.** Extension fallback when the MIME type isn't provided is exactly the right call — Drive sometimes returns generic types, and file extensions are a reliable second signal.

**The output formatting for Claude is genuinely good.** Emoji icons for file types, human-readable sizes, relative context in the text — these make a real difference in how well I can interpret and communicate results to users. The tools layer isn't an afterthought.

---

## What I'd think about

### The `functions/` layer adds no value yet

Right now, `listDrives.js` is literally:
```js
export async function listDrives(drive) {
  return drive.listDrives();
}
```

That's not a layer, that's a pass-through. Either give it a real job (validation, error normalization, business rules) or collapse it into the tools layer. Extra indirection without purpose is future confusion.

### PPTX parsing will break on real-world files

Extracting text by matching `<a:t>` tags with a regex on raw XML works in the happy path, but PPTX slides from real organizations have nested shapes, grouped elements, speaker notes mixed in, and encoding quirks. The `adm-zip` + regex approach will silently drop or mangle content on edge cases.

If PPTX support matters, consider `pptx2json` or processing `ppt/slides/slideN.xml` with an actual XML parser (`fast-xml-parser` is lightweight and fast). The current approach will produce confusing partial reads and you won't know why.

### The 50,000-character truncation is invisible

When a file gets truncated, the user sees `[...content truncated...]` at the end. But I receive no signal in the tool response that truncation happened. I'll often give confident answers about a document I only read 40% of.

Consider returning a `truncated: true` flag in the metadata, or prepending a warning so I surface it to the user: *"Note: this file was truncated — I'm only working with the first portion."*

### No caching means latency compounds

`list_files` hits the API every call. In a normal conversation where the user navigates a folder tree ("show me this drive → open this folder → open this subfolder → read this file"), that's 4 sequential API calls. Each one is 200-400ms.

Even a simple TTL cache (30 seconds for file listings, maybe 5 minutes for drive lists) in memory would make the experience feel significantly faster. Node's `Map` with timestamps is all you need.

### The `functions/` error handling is inconsistent

`readFile.js` has error handling. `listFiles.js` doesn't — if the Drive API throws, the error bubbles raw to the MCP tool and then to me, often as an opaque message. Normalizing API errors (e.g., 403 → "permission denied for this file", 404 → "file not found or not shared with you") would make failures much more useful.

### Linux is a first-class platform for you, but the installer ignores it

You have `install-mac.sh` and `install-windows.ps1`. No `install-linux.sh`. Given that you're running Manjaro, you clearly use this on Linux — that script should exist.

---

## Ideas worth considering

**Write support, scoped conservatively.** `drive.readonly` is the safe default, but a `write` variant with an additional opt-in flag (`--enable-write`) could support creating a Google Doc summary of a file analysis, or appending a comment to a spreadsheet. Read-only is right for the default; write access as an explicit opt-in would make this significantly more powerful.

**A `summarize_file` tool.** Calling `read_file` on a 500-page PDF and then asking me to summarize it is a lot of tokens. A dedicated tool that returns the first N pages or a structural outline (headings, sheet names, slide titles) would be faster and cheaper for users who just want to understand what a file contains before deciding to read it fully.

**Multi-file search + read.** Right now, `search_files` returns file IDs, then the user asks me to `read_file` one at a time. A `search_and_read` tool that returns the content of the top N matching files in one call would enable much more powerful workflows: "find all meeting notes from Q4 and summarize them."

**A `list_recent` tool.** `modifiedTime desc` sorted files across all drives, filtered optionally by file type. This is one of the most common things people actually want from Drive — "what was I working on recently?" — and it's not currently exposed.

**Linux support for Claude Desktop.** Claude Desktop doesn't officially support Linux yet, but it runs via Electron and works. You could add a `install-linux.sh` that handles the config path (`~/.config/Claude/claude_desktop_config.json`) and is specific to Manjaro/Arch's Node.js setup.

---

## Overall

This is a real, useful tool with a clear value proposition and clean implementation. The architecture is honest — it doesn't over-engineer a problem that doesn't require it. The OAuth flow works. The file conversion works. The MCP integration works.

The gaps are real but fixable: the empty `functions/` layer, the fragile PPTX parsing, the invisible truncation, the missing Linux installer. None of them are design flaws, just next steps.

The thing I'd focus on if I were you: get the truncation warning surfaced to users, and add the TTL cache. Both are small changes, both make the day-to-day experience noticeably better.

Good work.

— Claude

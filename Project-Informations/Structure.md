# CodeCraft — Project Structure

**Last Updated:** 2026-05-28 (after TASK-03 + TASK-06)

---

## Project-Informations/ Directory

```
Project-Informations/
├── planing/
│   ├── Project-Plan.md                      # Master project plan (4 phases)
│   ├── Original-Reports/
│   │   ├── Generic-Research-1-OGF.md        # Architecture, tech stack, persistence, deployment
│   │   ├── UI-UX-Research-2-OGF.md          # UI/UX patterns, component architecture
│   │   └── Code-Runner-Research-3-OGF.md    # Code execution, language support, live preview
│   └── Final-Reports/
│       ├── Generic-Research-1-FIN.md        # Enriched with plan cross-references
│       ├── UI-UX-Research-2-FIN.md          # Enriched with plan cross-references
│       └── Code-Runner-Research-3-FIN.md    # Enriched with plan cross-references
├── worklogs/
│   ├── 0-Worklog-2026-05-28.md             # Initial planning worklog
│   ├── TASK-01-02-Worklog-Scaffold-Stores-2026-05-28.md  # TASK-01 + TASK-02 worklog
│   └── TASK-03-06-Worklog-Dexie-AutoSave-2026-05-28.md   # TASK-03 + TASK-06 worklog
├── analyses/
│   └── Placeholder.md                       # Placeholder — delete when first analysis added
├── development/
│   ├── TASK-01/
│   │   ├── Original-Reports/
│   │   │   └── Scaffold-Implementation-1-OGF.md
│   │   └── Final-Reports/
│   │       └── Scaffold-Implementation-1-FIN.md
│   ├── TASK-02/
│   │   ├── Original-Reports/
│   │   │   └── Stores-Implementation-2-OGF.md
│   │   └── Final-Reports/
│   │       └── Stores-Implementation-2-FIN.md
│   ├── TASK-03/
│   │   ├── Original-Reports/
│   │   │   └── Dexie-Database-1-OGF.md
│   │   └── Final-Reports/
│   │       └── Dexie-Database-1-FIN.md
│   └── TASK-06/
│       ├── Original-Reports/
│       │   └── Auto-Save-Hook-2-OGF.md
│       └── Final-Reports/
│           └── Auto-Save-Hook-2-FIN.md
└── Structure.md                             # This file
```

## Key File Types

| Suffix | Meaning |
|--------|---------|
| `-OGF.md` | Original report — **never modify** |
| `-FIN.md` | Final/enhanced copy — enriched with plan references |

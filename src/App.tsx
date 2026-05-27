/**
 * CodeCraft — App Root Component
 *
 * Top-level router that shows either:
 * 1. Project List landing page (when no project is active)
 * 2. IDE workspace (when a project is open)
 *
 * Uses Zustand's projectStore for "routing" — no React Router needed
 * for Phase 0 (hash routing in Phase 1).
 *
 * @see Project-Plan.md TASK-09 — Project list page + CRUD
 * @see Project-Plan.md TASK-11 — JS code runner (Web Worker)
 * @see Project-Plan.md TASK-12 — Console output panel
 */

import { useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Download, Play, Square } from 'lucide-react';
import { useProjectStore } from './stores/projectStore';
import { useEditorStore } from './stores/editorStore';
import { useUIStore } from './stores/uiStore';
import { useConsoleStore } from './stores/consoleStore';
import { useAutoSave } from './hooks/useAutoSave';
import { CodeEditor } from './components/Editor';
import { TabBar } from './components/Tabs';
import { FileTree } from './components/Sidebar';
import { ProjectList } from './components/ProjectList';
import { ConsoleOutput } from './components/Console';
import { jsRunner } from './runner/jsRunner';
import { exportProjectToZip } from './utils/zipImport';
import { getFile, getProject } from './db';
import { isExecutable } from './utils/languageDetection';

// ─── IDE Workspace ──────────────────────────────────────────

function IDEWorkspace() {
  useAutoSave();

  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const bottomPanelOpen = useUIStore((s) => s.bottomPanelOpen);
  const setBottomPanelOpen = useUIStore((s) => s.setBottomPanelOpen);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const closeAllFiles = useProjectStore((s) => s.closeAllFiles);
  const editorClearAll = useEditorStore((s) => s.clearAll);
  const getContent = useEditorStore((s) => s.getContent);
  const consoleStatus = useConsoleStore((s) => s.status);
  const startExecution = useConsoleStore((s) => s.startExecution);
  const addEntry = useConsoleStore((s) => s.addEntry);
  const endExecution = useConsoleStore((s) => s.endExecution);

  const isRunning = consoleStatus === 'running';

  const handleExportZip = async () => {
    if (!activeProjectId) return;
    const project = await getProject(activeProjectId);
    if (!project) return;
    await exportProjectToZip(project.id, project.name);
  };

  const handleCloseProject = () => {
    closeAllFiles();
    editorClearAll();
    useProjectStore.setState({ activeProjectId: null });
  };

  // ─── Run Code (TASK-11) ──────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!activeFileId) return;

    // Get the file's language from IndexedDB
    const file = await getFile(activeFileId);
    if (!file) return;

    if (!isExecutable(file.language)) {
      addEntry('error', [`Cannot execute .${file.name.split('.').pop()} files. Only JavaScript is supported.`]);
      return;
    }

    // Get the current editor content (may be dirty / unsaved)
    const code = getContent(activeFileId) ?? '';
    if (!code.trim()) {
      addEntry('warn', ['No code to execute.']);
      return;
    }

    // Ensure the bottom panel is open
    setBottomPanelOpen(true);

    // Start execution (clears previous output)
    startExecution();

    // Execute in the Web Worker sandbox
    jsRunner.execute(code, {
      onOutput: (method, text) => {
        if (method === 'clear') {
          useConsoleStore.getState().clearConsole();
        } else {
          addEntry(method, [text]);
        }
      },
      onDone: (_id, exitCode) => {
        addEntry('result', [`Process exited with code ${exitCode}`]);
        endExecution(exitCode === 0 ? 'idle' : 'error');
      },
      onError: (error, stack) => {
        addEntry('error', [stack || error]);
        endExecution('error');
      },
      onTimeout: () => {
        addEntry('error', ['Execution timed out (5s limit). Your code may have an infinite loop.']);
        endExecution('timeout');
      },
    });
  }, [activeFileId, getContent, startExecution, addEntry, endExecution, setBottomPanelOpen]);

  // ─── Stop Execution ──────────────────────────────────────────
  const handleStop = useCallback(() => {
    jsRunner.cancel();
    addEntry('warn', ['Execution cancelled by user.']);
    endExecution('idle');
  }, [addEntry, endExecution]);

  return (
    <div className="app-root" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Title Bar */}
      <header className="titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="titlebar-brand"
            onClick={handleCloseProject}
            title="Back to project list"
            style={{ cursor: 'pointer' }}
          >
            ⌘ CodeCraft
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>v0.1.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Run / Stop Button (TASK-11) */}
          {isRunning ? (
            <button
              className="titlebar-action-btn titlebar-stop-btn"
              onClick={handleStop}
              title="Stop execution"
              aria-label="Stop code execution"
            >
              <Square size={12} />
              <span style={{ fontSize: 11, marginLeft: 4 }}>Stop</span>
            </button>
          ) : (
            <button
              className="titlebar-action-btn titlebar-run-btn"
              onClick={handleRun}
              title="Run JavaScript (Ctrl+Enter)"
              aria-label="Run JavaScript code"
              disabled={!activeFileId}
            >
              <Play size={12} />
              <span style={{ fontSize: 11, marginLeft: 4 }}>Run</span>
            </button>
          )}
          <button
            className="titlebar-action-btn"
            onClick={handleExportZip}
            title="Export as ZIP"
            aria-label="Export project as ZIP"
          >
            <Download size={14} />
            <span style={{ fontSize: 11, marginLeft: 4 }}>Export ZIP</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <PanelGroup direction="horizontal" autoSaveId="codecraft-main">
        {sidebarOpen && (
          <>
            <Panel defaultSize={18} minSize={12} maxSize={30} collapsible order={1}>
              <FileTree />
            </Panel>
            <PanelResizeHandle />
          </>
        )}

        <Panel defaultSize={82} minSize={40} order={2}>
          <PanelGroup direction="vertical" autoSaveId="codecraft-editor">
            <Panel defaultSize={70} minSize={30} order={1}>
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-editor)' }}>
                <TabBar />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <CodeEditor />
                </div>
              </div>
            </Panel>

            {bottomPanelOpen && (
              <>
                <PanelResizeHandle />
                <Panel defaultSize={30} minSize={15} maxSize={60} collapsible order={2}>
                  <ConsoleOutput />
                </Panel>
              </>
            )}
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* Status Bar */}
      <footer className="statusbar">
        <div className="statusbar-left">
          <span className="statusbar-item">Ln 1, Col 1</span>
        </div>
        <div className="statusbar-right">
          <span className="statusbar-item">JavaScript</span>
          <span className="statusbar-item">UTF-8</span>
          <span className="statusbar-item">Spaces: 2</span>
        </div>
      </footer>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────

function App() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  // If no project is active, show the project list landing page
  if (!activeProjectId) {
    return <ProjectList />;
  }

  // Otherwise, show the IDE workspace
  return <IDEWorkspace />;
}

export default App;

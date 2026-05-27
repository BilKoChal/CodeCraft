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
 */

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Download } from 'lucide-react';
import { useProjectStore } from './stores/projectStore';
import { useEditorStore } from './stores/editorStore';
import { useUIStore } from './stores/uiStore';
import { useAutoSave } from './hooks/useAutoSave';
import { CodeEditor } from './components/Editor';
import { TabBar } from './components/Tabs';
import { FileTree } from './components/Sidebar';
import { ProjectList } from './components/ProjectList';
import { exportProjectToZip } from './utils/zipImport';
import { getProject } from './db';

// ─── IDE Workspace ──────────────────────────────────────────

function IDEWorkspace() {
  useAutoSave();

  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const bottomPanelOpen = useUIStore((s) => s.bottomPanelOpen);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const closeAllFiles = useProjectStore((s) => s.closeAllFiles);
  const editorClearAll = useEditorStore((s) => s.clearAll);

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
                  <div style={{ height: '100%', background: 'var(--bg-panel)', padding: 8, color: 'var(--text-secondary)', fontSize: 12, overflow: 'auto' }}>
                    <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>CONSOLE</div>
                    <div style={{ color: 'var(--text-muted)' }}>Console output will appear here (TASK-12)</div>
                  </div>
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

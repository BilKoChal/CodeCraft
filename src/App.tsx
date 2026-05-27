/**
 * CodeCraft — App Root Component
 *
 * The top-level component that renders the IDE workspace.
 * Now includes real components for the editor, tab bar, and
 * polished dark theme (TASK-04, TASK-05, TASK-13).
 */

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useUIStore } from './stores/uiStore';
import { useAutoSave } from './hooks/useAutoSave';
import { CodeEditor } from './components/Editor';
import { TabBar } from './components/Tabs';

function App() {
  // Activate auto-save for all open files (1s debounce → IndexedDB)
  useAutoSave();

  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const bottomPanelOpen = useUIStore((s) => s.bottomPanelOpen);

  return (
    <div className="app-root" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Title Bar */}
      <header className="titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: 14 }}>
            ⌘ CodeCraft
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>v0.1.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            Browser Code Editor
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <PanelGroup direction="horizontal" autoSaveId="codecraft-main">
        {/* Sidebar (File Tree) */}
        {sidebarOpen && (
          <>
            <Panel
              defaultSize={20}
              minSize={15}
              maxSize={35}
              collapsible
              order={1}
            >
              <div
                style={{
                  height: '100%',
                  background: 'var(--bg-sidebar)',
                  padding: 8,
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  overflow: 'auto',
                }}
              >
                <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>
                  EXPLORER
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  File tree will appear here (TASK-07)
                </div>
              </div>
            </Panel>
            <PanelResizeHandle />
          </>
        )}

        {/* Editor + Bottom Panel */}
        <Panel defaultSize={80} minSize={40} order={2}>
          <PanelGroup direction="vertical" autoSaveId="codecraft-editor">
            {/* Tab Bar + Editor */}
            <Panel defaultSize={70} minSize={30} order={1}>
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-editor)',
                }}
              >
                {/* Tab Bar — TASK-05 */}
                <TabBar />
                {/* Code Editor — TASK-04 */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <CodeEditor />
                </div>
              </div>
            </Panel>

            {/* Bottom Panel (Console / Preview) */}
            {bottomPanelOpen && (
              <>
                <PanelResizeHandle />
                <Panel
                  defaultSize={30}
                  minSize={15}
                  maxSize={60}
                  collapsible
                  order={2}
                >
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--bg-panel)',
                      padding: 8,
                      color: 'var(--text-secondary)',
                      fontSize: 12,
                      overflow: 'auto',
                    }}
                  >
                    <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>
                      CONSOLE
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      Console output will appear here (TASK-12)
                    </div>
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

export default App;

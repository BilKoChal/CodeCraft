/**
 * CodeCraft — App Root Component
 *
 * This is the top-level component that renders the IDE workspace.
 * Phase 0 renders a minimal layout with placeholder sections
 * that will be filled in by subsequent tasks.
 */

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useUIStore } from './stores/uiStore';

function App() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const bottomPanelOpen = useUIStore((s) => s.bottomPanelOpen);

  return (
    <div className="app-root" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Title Bar */}
      <header
        className="titlebar"
        style={{
          height: 'var(--titlebar-height)',
          background: 'var(--bg-titlebar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          borderBottom: '1px solid var(--border-default)',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: 14 }}>
            ⌘ CodeCraft
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>v0.1.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            Phase 0 Scaffold
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
            <PanelResizeHandle
              style={{
                width: 'var(--resize-handle-size)',
                background: 'var(--border-default)',
                transition: 'background var(--transition-fast)',
              }}
            />
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
                {/* Tab Bar Placeholder */}
                <div
                  style={{
                    height: 'var(--tab-height)',
                    background: 'var(--bg-tab-inactive)',
                    borderBottom: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  Tab bar will appear here (TASK-05)
                </div>
                {/* Editor Placeholder */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 14,
                  }}
                >
                  CodeMirror 6 editor will appear here (TASK-04)
                </div>
              </div>
            </Panel>

            {/* Bottom Panel (Console / Preview) */}
            {bottomPanelOpen && (
              <>
                <PanelResizeHandle
                  style={{
                    height: 'var(--resize-handle-size)',
                    background: 'var(--border-default)',
                    transition: 'background var(--transition-fast)',
                  }}
                />
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
      <footer
        style={{
          height: 'var(--statusbar-height)',
          background: 'var(--bg-statusbar)',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          color: 'var(--text-muted)',
          fontSize: 11,
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <span>Ln 1, Col 1</span>
        <span>JavaScript</span>
      </footer>
    </div>
  );
}

export default App;

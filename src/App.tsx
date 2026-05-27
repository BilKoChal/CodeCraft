/**
 * CodeCraft — Root Application Component
 *
 * Sets up routing with HashRouter (already in main.tsx).
 * Routes: / (editor), /settings, /projects
 */
import { Routes, Route } from 'react-router-dom';

function EditorPage() {
  return (
    <div className="editor-layout grid grid-rows-[auto_auto_1fr_auto] grid-areas-[titlebar_tabbar_editor_infostrip] h-full bg-surface-base text-text-primary">
      {/* PH1-08: TitleBar component placeholder */}
      <header className="grid-area-[titlebar] h-10 flex items-center px-4 border-b border-border-subtle">
        <span className="text-accent-primary font-bold text-sm">CodeCraft</span>
        <span className="text-text-secondary text-xs ml-4">Project Name</span>
      </header>

      {/* PH1-04: TabBar component placeholder */}
      <div className="grid-area-[tabbar] h-9 flex items-center px-2 border-b border-border-subtle">
        <span className="text-text-tertiary text-xs">No files open</span>
      </div>

      {/* PH1-02: EditorArea component placeholder */}
      <main className="grid-area-[editor] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-text-secondary text-lg mb-2">CodeCraft</h2>
          <p className="text-text-tertiary text-sm">
            Open a file or create a new project to get started
          </p>
        </div>
      </main>

      {/* PH1-09: InfoStrip component placeholder */}
      <footer className="grid-area-[infostrip] h-7 flex items-center px-4 text-xs text-text-tertiary border-t border-border-subtle">
        <span>Ln 1, Col 1</span>
        <span className="mx-3">UTF-8</span>
        <span>Plain Text</span>
        <span className="ml-auto">Spaces: 2</span>
      </footer>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="h-full bg-surface-base text-text-primary p-6">
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      <p className="text-text-secondary">Settings panel — to be implemented in PH3-10</p>
    </div>
  );
}

function ProjectsPage() {
  return (
    <div className="h-full bg-surface-base text-text-primary p-6">
      <h1 className="text-xl font-bold mb-4">Projects</h1>
      <p className="text-text-secondary">Project manager — to be implemented in PH2-02</p>
    </div>
  );
}

/**
 * Root App component with route definitions.
 * Uses HashRouter (configured in main.tsx) for GitHub Pages compatibility.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
    </Routes>
  );
}

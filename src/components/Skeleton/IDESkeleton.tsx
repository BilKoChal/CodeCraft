/**
 * CodeCraft — IDESkeleton Component
 *
 * Skeleton loading state that mimics the IDE layout while assets
 * are being loaded. Shows the overall structure of the workspace
 * (sidebar, tabs, editor area, bottom panel, status bar) with
 * shimmering placeholder blocks.
 *
 * Design:
 * - CSS-driven shimmer animation (no JS animation overhead)
 * - Matches exact dimensions of the real IDE (CSS variables)
 * - Appears instantly on first load, replaced by real content
 * - Lightweight: pure CSS, no state dependencies
 *
 * @see Project-Plan.md TASK-18 — Skeleton loading states
 */

// ─── Component ────────────────────────────────────────────────

export function IDESkeleton() {
  return (
    <div className="skeleton-root">
      {/* Title Bar */}
      <div className="skeleton-titlebar">
        <div className="skeleton-titlebar-brand" />
        <div className="skeleton-titlebar-actions">
          <div className="skeleton-block skeleton-block-btn" />
          <div className="skeleton-block skeleton-block-btn" />
        </div>
      </div>

      {/* Main Workspace */}
      <div className="skeleton-workspace">
        {/* Sidebar */}
        <div className="skeleton-sidebar">
          <div className="skeleton-sidebar-header">
            <div className="skeleton-block skeleton-block-sm" />
          </div>
          <div className="skeleton-sidebar-list">
            <div className="skeleton-block skeleton-block-file" />
            <div className="skeleton-block skeleton-block-file" style={{ width: '70%' }} />
            <div className="skeleton-block skeleton-block-file" style={{ width: '85%' }} />
            <div className="skeleton-block skeleton-block-file" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Resize Handle */}
        <div className="skeleton-resize-handle" />

        {/* Editor Area */}
        <div className="skeleton-editor-area">
          {/* Tab Bar */}
          <div className="skeleton-tab-bar">
            <div className="skeleton-tab skeleton-tab-active" />
            <div className="skeleton-tab" />
            <div className="skeleton-tab" />
          </div>

          {/* Editor Content */}
          <div className="skeleton-editor-content">
            <div className="skeleton-line">
              <div className="skeleton-line-number" />
              <div className="skeleton-line-code" style={{ width: '45%' }} />
            </div>
            <div className="skeleton-line">
              <div className="skeleton-line-number" />
              <div className="skeleton-line-code" style={{ width: '70%' }} />
            </div>
            <div className="skeleton-line">
              <div className="skeleton-line-number" />
              <div className="skeleton-line-code" style={{ width: '30%' }} />
            </div>
            <div className="skeleton-line">
              <div className="skeleton-line-number" />
              <div className="skeleton-line-code" style={{ width: '85%' }} />
            </div>
            <div className="skeleton-line">
              <div className="skeleton-line-number" />
              <div className="skeleton-line-code" style={{ width: '55%' }} />
            </div>
            <div className="skeleton-line">
              <div className="skeleton-line-number" />
              <div className="skeleton-line-code" style={{ width: '40%' }} />
            </div>
            <div className="skeleton-line">
              <div className="skeleton-line-number" />
              <div className="skeleton-line-code" style={{ width: '75%' }} />
            </div>
            <div className="skeleton-line">
              <div className="skeleton-line-number" />
              <div className="skeleton-line-code" style={{ width: '60%' }} />
            </div>
          </div>

          {/* Bottom Panel */}
          <div className="skeleton-resize-handle-h" />
          <div className="skeleton-bottom-panel">
            <div className="skeleton-bottom-header">
              <div className="skeleton-block skeleton-block-sm" />
            </div>
            <div className="skeleton-bottom-content">
              <div className="skeleton-block skeleton-block-console" style={{ width: '60%' }} />
              <div className="skeleton-block skeleton-block-console" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="skeleton-statusbar">
        <div className="skeleton-statusbar-left">
          <div className="skeleton-block skeleton-block-status" />
          <div className="skeleton-block skeleton-block-status" style={{ width: '60px' }} />
        </div>
        <div className="skeleton-statusbar-right">
          <div className="skeleton-block skeleton-block-status" style={{ width: '70px' }} />
          <div className="skeleton-block skeleton-block-status" style={{ width: '40px' }} />
          <div className="skeleton-block skeleton-block-status" style={{ width: '60px' }} />
        </div>
      </div>
    </div>
  );
}

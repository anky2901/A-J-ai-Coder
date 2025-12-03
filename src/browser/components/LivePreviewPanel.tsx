/**
 * Live Preview Panel for A J AI Coder
 * Provides real-time preview of HTML, CSS, JS, Python, and binary files
 * with automatic file watching and instant reload
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ipcRenderer } from '../ipc';
import { IPC_CHANNELS } from '../../common/ipcChannels';

interface LivePreviewPanelProps {
  workspaceId?: string;
  className?: string;
}

type FileType = 'html' | 'css' | 'javascript' | 'python' | 'image' | 'binary' | 'text' | 'unknown';

interface PreviewState {
  filePath: string | null;
  fileType: FileType;
  content: string;
  lastUpdate: number;
  error: string | null;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({ 
  workspaceId,
  className = ''
}) => {
  const [previewState, setPreviewState] = useState<PreviewState>({
    filePath: null,
    fileType: 'unknown',
    content: '',
    lastUpdate: Date.now(),
    error: null
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [autoReload, setAutoReload] = useState(true);
  const [latency, setLatency] = useState<number>(0);

  // Detect file type from path
  const detectFileType = (path: string): FileType => {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    
    if (['html', 'htm'].includes(ext)) return 'html';
    if (['css'].includes(ext)) return 'css';
    if (['js', 'jsx', 'ts', 'tsx', 'mjs'].includes(ext)) return 'javascript';
    if (['py', 'pyw'].includes(ext)) return 'python';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) return 'image';
    if (['exe', 'apk', 'dmg', 'app', 'deb', 'rpm'].includes(ext)) return 'binary';
    if (['txt', 'md', 'json', 'xml', 'yaml', 'yml'].includes(ext)) return 'text';
    
    return 'unknown';
  };

  // Load file content
  const loadFile = useCallback(async (filePath: string) => {
    const startTime = Date.now();
    
    try {
      const result = await ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, filePath);
      
      if (result.error) {
        setPreviewState(prev => ({
          ...prev,
          error: result.error,
          filePath,
          lastUpdate: Date.now()
        }));
        return;
      }

      const fileType = detectFileType(filePath);
      const loadTime = Date.now() - startTime;
      setLatency(loadTime);

      setPreviewState({
        filePath,
        fileType,
        content: result.content || '',
        lastUpdate: Date.now(),
        error: null
      });

    } catch (err) {
      setPreviewState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load file',
        filePath,
        lastUpdate: Date.now()
      }));
    }
  }, []);

  // File watcher - listen for file changes
  useEffect(() => {
    if (!previewState.filePath || !autoReload) return;

    const handleFileChange = (_event: any, data: { path: string }) => {
      if (data.path === previewState.filePath) {
        // Reload with minimal delay
        setTimeout(() => loadFile(data.path), 10);
      }
    };

    ipcRenderer.on('file-changed', handleFileChange);

    return () => {
      ipcRenderer.off('file-changed', handleFileChange);
    };
  }, [previewState.filePath, autoReload, loadFile]);

  // Listen for preview requests from AI or editor
  useEffect(() => {
    const handlePreviewRequest = (_event: any, data: { path: string }) => {
      loadFile(data.path);
    };

    ipcRenderer.on('preview-file', handlePreviewRequest);

    return () => {
      ipcRenderer.off('preview-file', handlePreviewRequest);
    };
  }, [loadFile]);

  // Render HTML content in iframe
  const renderHTML = (content: string) => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (doc) {
      doc.open();
      doc.write(content);
      doc.close();
    }
  };

  // Render CSS with live hot-swap
  const renderCSS = (content: string) => {
    return (
      <div className="preview-css-container">
        <style dangerouslySetInnerHTML={{ __html: content }} />
        <div className="css-preview-info">
          <h3>CSS Stylesheet Preview</h3>
          <p>This CSS is active in the preview panel</p>
          <pre className="css-code">{content}</pre>
        </div>
      </div>
    );
  };

  // Render JavaScript
  const renderJavaScript = (content: string) => {
    return (
      <div className="preview-code-container">
        <div className="code-header">
          <span className="language-badge">JavaScript</span>
          <span className="file-path">{previewState.filePath}</span>
        </div>
        <pre className="code-content">
          <code>{content}</code>
        </pre>
      </div>
    );
  };

  // Render Python
  const renderPython = (content: string) => {
    return (
      <div className="preview-code-container">
        <div className="code-header">
          <span className="language-badge python">Python</span>
          <span className="file-path">{previewState.filePath}</span>
        </div>
        <pre className="code-content python-code">
          <code>{content}</code>
        </pre>
        <div className="python-info">
          <p>💡 This Python file can be executed via the terminal</p>
        </div>
      </div>
    );
  };

  // Render image
  const renderImage = (filePath: string) => {
    return (
      <div className="preview-image-container">
        <img 
          src={`file://${filePath}`} 
          alt="Preview" 
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        <div className="image-info">
          <p>{filePath}</p>
        </div>
      </div>
    );
  };

  // Render binary file info
  const renderBinary = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toUpperCase() || 'BINARY';
    
    return (
      <div className="preview-binary-container">
        <div className="binary-icon">📦</div>
        <h3>{ext} File</h3>
        <p className="file-path">{filePath}</p>
        <div className="binary-info">
          <p>Binary file cannot be previewed directly</p>
          <p>File type: <code>.{ext.toLowerCase()}</code></p>
        </div>
      </div>
    );
  };

  // Render based on file type
  const renderPreview = () => {
    const { fileType, content, filePath, error } = previewState;

    if (error) {
      return (
        <div className="preview-error">
          <h3>Error Loading File</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (!filePath) {
      return (
        <div className="preview-empty">
          <div className="empty-icon">👁️</div>
          <h3>A J AI Coder - Live Preview</h3>
          <p>Open a file to see live preview</p>
          <p className="hint">HTML, CSS, JS, Python, Images & more</p>
        </div>
      );
    }

    switch (fileType) {
      case 'html':
        return (
          <iframe
            ref={iframeRef}
            className="preview-iframe"
            sandbox="allow-scripts allow-same-origin"
            srcDoc={content}
            title="HTML Preview"
          />
        );
      
      case 'css':
        return renderCSS(content);
      
      case 'javascript':
        return renderJavaScript(content);
      
      case 'python':
        return renderPython(content);
      
      case 'image':
        return renderImage(filePath);
      
      case 'binary':
        return renderBinary(filePath);
      
      default:
        return (
          <div className="preview-code-container">
            <pre className="code-content">{content}</pre>
          </div>
        );
    }
  };

  return (
    <div className={`live-preview-panel ${className}`}>
      {/* Header */}
      <div className="preview-header">
        <div className="header-left">
          <span className="preview-title">🔴 Live Preview</span>
          {previewState.filePath && (
            <span className="file-name">{previewState.filePath.split(/[/\\]/).pop()}</span>
          )}
        </div>
        <div className="header-right">
          <button
            className={`auto-reload-toggle ${autoReload ? 'active' : ''}`}
            onClick={() => setAutoReload(!autoReload)}
            title={autoReload ? 'Auto-reload enabled' : 'Auto-reload disabled'}
          >
            {autoReload ? '🔄' : '⏸️'}
          </button>
          {latency > 0 && (
            <span className="latency-badge">{latency}ms</span>
          )}
          {previewState.lastUpdate && (
            <span className="last-update">
              Updated {new Date(previewState.lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content">
        {renderPreview()}
      </div>

      {/* Footer Branding */}
      <div className="preview-footer">
        <span className="branding">A J AI Coder - Professional IDE</span>
      </div>
    </div>
  );
};

export default LivePreviewPanel;

import React from 'react';

interface RejectionFeedbackProps {
  pageName?: string;
  reason: string;
  onDismiss?: () => void;
}

const RejectionFeedback: React.FC<RejectionFeedbackProps> = ({ pageName, reason, onDismiss }) => {
  return (
    <div style={{
      backgroundColor: 'var(--color-danger-bg)',
      border: '1px solid var(--color-danger)',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      color: 'var(--color-danger)',
      position: 'relative'
    }}>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss rejection feedback"
          title="Dismiss rejection feedback"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            color: 'var(--color-danger)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          &times;
        </button>
      )}
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: onDismiss ? '2rem' : '0' }}>
        <span style={{ 
          backgroundColor: 'var(--color-danger)', 
          color: 'white', 
          padding: '2px 8px', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          letterSpacing: '0.05em' 
        }}>REJECTED</span>
        {pageName ? `"${pageName}" was not approved` : 'Page was not approved'}
      </h3>
      
      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', opacity: 0.8 }}>
          Admin feedback
        </div>
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.5)', 
          padding: '1rem', 
          borderRadius: '4px',
          borderLeft: '3px solid var(--color-danger)',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          {reason}
        </div>
      </div>
    </div>
  );
};

export default RejectionFeedback;

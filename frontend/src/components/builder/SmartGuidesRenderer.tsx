import { useState, forwardRef, useImperativeHandle } from 'react';
import type { GuideLine } from '../../utils/smartGuides';

export interface SmartGuidesRendererHandle {
  updateGuides: (newGuides: GuideLine[]) => void;
  clearGuides: () => void;
}

const SmartGuidesRenderer = forwardRef<SmartGuidesRendererHandle, {}>((_, ref) => {
  const [guides, setGuides] = useState<GuideLine[]>([]);

  useImperativeHandle(ref, () => ({
    updateGuides: (newGuides) => {
      setGuides(newGuides);
    },
    clearGuides: () => {
      setGuides([]);
    }
  }));

  if (guides.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 9999
    }}>
      {guides.map(guide => {
        return (
          <div key={guide.id} style={{
            position: 'absolute',
            ...(guide.axis === 'x' ? {
              left: guide.position,
              top: guide.start,
              height: guide.end - guide.start,
              borderLeft: guide.type === 'dimension' ? 'none' : '1px dashed var(--color-primary)',
              transform: 'translateX(-0.5px)'
            } : {
              top: guide.position,
              left: guide.start,
              width: guide.end - guide.start,
              borderTop: guide.type === 'dimension' ? 'none' : '1px dashed var(--color-primary)',
              transform: 'translateY(-0.5px)'
            })
          }}>
            {guide.label && (
              <div style={{
                position: 'absolute',
                background: 'var(--color-surface)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                fontSize: '10px',
                fontWeight: 500,
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                ...(guide.axis === 'x' ? {
                  top: '50%',
                  left: '6px',
                  transform: 'translateY(-50%)'
                } : {
                  left: '50%',
                  top: '6px',
                  transform: 'translateX(-50%)'
                })
              }}>
                {guide.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

SmartGuidesRenderer.displayName = 'SmartGuidesRenderer';

export default SmartGuidesRenderer;

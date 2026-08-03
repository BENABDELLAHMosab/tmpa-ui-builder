import React from 'react';
import type { BuilderComponent } from '../../types/page';
import { CONTAINER_STYLE_DEFAULTS } from '../../utils/container';

interface ContainerFrameProps {
  component: BuilderComponent;
  children?: React.ReactNode;
  contentRef?: React.Ref<HTMLDivElement>;
  mode?: 'builder' | 'preview';
}

const ContainerFrame = ({ component, children, contentRef, mode = 'builder' }: ContainerFrameProps) => {
  const style = component.style || {};
  const backgroundColor = style.backgroundColor ?? CONTAINER_STYLE_DEFAULTS.backgroundColor;
  const borderColor = style.borderColor ?? CONTAINER_STYLE_DEFAULTS.borderColor;
  const borderWidth = style.borderWidth ?? CONTAINER_STYLE_DEFAULTS.borderWidth;
  const borderStyle = style.borderStyle ?? CONTAINER_STYLE_DEFAULTS.borderStyle;
  const borderRadius = style.borderRadius ?? CONTAINER_STYLE_DEFAULTS.borderRadius;

  const isPreview = mode === 'preview';

  return (
    <div
      className={`container-outer-frame${isPreview ? ' container-outer-frame--preview' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor,
        borderColor,
        borderWidth,
        borderStyle,
        borderRadius,
      }}
    >
      <div
        ref={contentRef}
        className="container-inner-content"
        style={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          ...(isPreview ? { pointerEvents: 'auto' } : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ContainerFrame;

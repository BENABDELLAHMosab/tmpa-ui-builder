import React from 'react';

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.5,
  width: 20,
  height: 20,
};

export const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const TextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

export const ButtonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <rect x="3" y="7" width="18" height="10" rx="2" />
  </svg>
);

export const InputIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <rect x="3" y="7" width="18" height="10" rx="2" />
    <line x1="7" y1="10" x2="7" y2="14" />
  </svg>
);

export const TextareaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <line x1="7" y1="9" x2="17" y2="9" />
    <line x1="7" y1="13" x2="13" y2="13" />
  </svg>
);

export const SelectIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <rect x="3" y="7" width="18" height="10" rx="2" />
    <polyline points="14 10 16 12 18 10" />
  </svg>
);

export const CheckboxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const RadioIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const CardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const TableIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="3" y1="16" x2="21" y2="16" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

export const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const DividerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <line x1="4" y1="12" x2="20" y2="12" />
  </svg>
);

export const ContainerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...iconProps} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeDasharray="4 4" />
    <rect x="7" y="7" width="10" height="10" rx="1" ry="1" stroke="currentColor" fill="none" opacity="0.5" />
  </svg>
);

import type {ReactNode} from 'react';

export const FactRow = ({label, children}: {label: string; children: ReactNode}) => <div style={{display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20, alignItems: 'start', fontSize: 30, lineHeight: 1.4, color: '#d8d9dc'}}><span style={{color: '#787d86', letterSpacing: 2}}>{label}</span><span>{children}</span></div>;


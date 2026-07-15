import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../../styles/layout.css';

interface PortalLayoutProps {
  children: ReactNode;
  title: string;
}

const PortalLayout = ({ children, title }: PortalLayoutProps) => {
  return (
    <div className="portal-layout">
      <Sidebar />
      <div className="portal-main-wrapper">
        <Topbar title={title} />
        <main className="portal-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;

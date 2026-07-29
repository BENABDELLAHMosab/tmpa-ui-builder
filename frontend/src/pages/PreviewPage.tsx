import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { pageService } from '../services/page.service';
import { getAuthUser, getDashboardPathByRole } from '../utils/authStorage';
import type { UiPage, BuilderComponent, PageVersionDetail } from '../types/page';
import PreviewRenderer from '../components/preview/PreviewRenderer';
import StatusBadge from '../components/ui/StatusBadge';
import { normalizePageComponents } from '../utils/normalize';
import { getPageVersionReasonLabel, formatDate } from '../utils/format';
import '../styles/preview.css';

const PreviewPage = () => {
  const { pageId, versionNumber } = useParams<{ pageId: string, versionNumber?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from as string | undefined;

  const authUser = getAuthUser();

  const [page, setPage] = useState<UiPage | null>(null);
  const [historicalVersion, setHistoricalVersion] = useState<PageVersionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [components, setComponents] = useState<BuilderComponent[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchPage = async () => {
      setError(null);
      if (!pageId) {
        setError("No page ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (versionNumber) {
          const parsedVersion = parseInt(versionNumber, 10);
          if (isNaN(parsedVersion) || parsedVersion < 1) {
            setError("Invalid page or version identifier.");
            setLoading(false);
            return;
          }
          const [pageData, versionData] = await Promise.all([
            pageService.getPageById(pageId),
            pageService.getPageVersion(pageId, parsedVersion)
          ]);
          
          if (cancelled) return;

          setPage(pageData);
          setHistoricalVersion(versionData);
          if (versionData.schemaSnapshot && Array.isArray(versionData.schemaSnapshot.components)) {
            setComponents(normalizePageComponents(versionData.schemaSnapshot.components as BuilderComponent[]));
          } else {
            setComponents([]);
            setError("Invalid schema snapshot in this version.");
          }
        } else {
          const data = await pageService.getPageById(pageId);
          
          if (cancelled) return;
          
          setHistoricalVersion(null);
          setPage(data);
          if (data.schema && Array.isArray(data.schema.components)) {
            setComponents(normalizePageComponents(data.schema.components as BuilderComponent[]));
          }
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || "Unable to load this page version.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPage();
    return () => {
      cancelled = true;
    };
  }, [pageId, versionNumber]);

  const handleBackToBuilder = () => {
    if (from) {
      navigate(from);
    } else if (pageId) {
      navigate(`/builder/${pageId}`);
    } else {
      navigate('/developer/dashboard');
    }
  };

  const handleBackToDashboard = () => {
    const user = getAuthUser();
    const dashboardPath = getDashboardPathByRole(user?.role);
    navigate(dashboardPath);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-muted)' }}>Loading preview...</div>;
  }

  if (error && !page && !historicalVersion) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
        <h2>Error</h2>
        <p style={{ color: 'var(--color-danger)' }}>{error}</p>
        <button onClick={handleBackToDashboard} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="preview-layout">
      <header className="preview-topbar">
        <div className="preview-topbar-info">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '220px', height: '100%', padding: '0 20px', backgroundColor: 'var(--navy-800)' }}>
            <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '1px', backgroundColor: 'var(--navy-800)' }} />
            <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <img src="/assets/2-TMPA.png" alt="TMPA Logo" style={{ maxWidth: '170px', height: 'auto', objectFit: 'contain' }} />
          </div>
          <h2 style={{ marginLeft: '0.5rem', color: 'var(--text-primary)', margin: 0, fontSize: '1.25rem' }}>{historicalVersion ? historicalVersion.pageName : page?.name}</h2>
          
          {historicalVersion ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid var(--border-primary)', paddingLeft: '1rem' }}>
               <span style={{ color: 'var(--warning-400)', fontWeight: 600, fontSize: '0.9rem' }}>Viewing version {historicalVersion.versionNumber}</span>
               <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Read-only</span>
               {historicalVersion.isCurrent && <span style={{ backgroundColor: 'var(--primary-500)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Current</span>}
               <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>• {getPageVersionReasonLabel(historicalVersion.reason)} • {formatDate(historicalVersion.createdAt)} • {historicalVersion.createdBy?.fullName || 'Unknown user'}</span>
            </div>
          ) : (
            <>
              {page?.version && <span style={{ color: 'var(--text-secondary)', paddingLeft: '1rem', borderLeft: '1px solid var(--border-primary)', fontSize: '0.85rem', fontWeight: 500 }}>v{page.version}</span>}
              {page?.status && <StatusBadge status={page.status} />}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {authUser?.role === 'user-developer' && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (historicalVersion) {
                  navigate(`/builder/${pageId}`);
                } else {
                  handleBackToBuilder();
                }
              }}
            >
              {historicalVersion ? "Open builder" : "Back to builder"}
            </button>
          )}
          {!historicalVersion && (
            <button
              className="btn btn-primary"
              onClick={handleBackToDashboard}
              style={{ backgroundColor: 'var(--navy-950)' }}
            >
              Back to dashboard
            </button>
          )}
          {historicalVersion && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>This preview opened in a separate tab.</span>
          )}
        </div>
      </header>

      <div className="preview-main-wrapper">
        <aside className="preview-sidebar">
          <h3>Versions</h3>
          <div className="preview-sidebar-list">
            {page && Array.from({ length: page.version }, (_, i) => page.version - i).map((v) => {
              const isSelected = historicalVersion ? v === historicalVersion.versionNumber : v === page.version;
              const isCurrent = v === page.version;
              const targetUrl = v === page.version && historicalVersion ? `/preview/${pageId}` : `/pages/${pageId}/versions/${v}/preview`;

              return (
                <Link 
                  key={v} 
                  to={targetUrl}
                  className="preview-sidebar-item" 
                  style={{ 
                    cursor: 'pointer', 
                    opacity: isSelected ? 1 : 0.6,
                    borderLeft: isSelected ? '3px solid var(--primary-500)' : '1px solid transparent',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'white'
                  }}
                >
                  <span>Version {v}</span>
                  {isCurrent && <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 600 }}>CURRENT</span>}
                </Link>
              );
            })}
          </div>
        </aside>

        <main className="preview-main">
          <div className="preview-container">
            <PreviewRenderer components={components} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PreviewPage;

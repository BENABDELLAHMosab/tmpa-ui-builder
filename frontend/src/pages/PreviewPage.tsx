import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { pageService } from '../services/page.service';
import { getAuthUser, getDashboardPathByRole } from '../utils/authStorage';
import type { UiPage, BuilderComponent, PageVersionDetail } from '../types/page';
import PreviewRenderer from '../components/preview/PreviewRenderer';
import StatusBadge from '../components/ui/StatusBadge';
import { normalizePageComponents } from '../utils/normalize';
import { getPageVersionReasonLabel, formatDate } from '../utils/format';
import type { PageVersionSummary } from '../types/page';
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
  const [versions, setVersions] = useState<PageVersionSummary[]>([]);
  const [deletingVersionNumber, setDeletingVersionNumber] = useState<number | null>(null);

  const fetchVersions = async (id: string) => {
    try {
      // Fetch 100 versions, sufficient for preview sidebar usually, or just page 1 with high limit
      const data = await pageService.getPageVersions(id, 1, 100);
      setVersions(data.items);
    } catch (err) {
      console.error("Failed to load versions sidebar", err);
    }
  };

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
          // Priority A – explicit versionNumber in URL: historical behaviour unchanged
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
          // Priority B – normal route /preview/:pageId
          const data = await pageService.getPageById(pageId);
          
          if (cancelled) return;
          
          setPage(data);

          if (data.status === 'published' && data.publishedVersionNumber != null) {
            // Load the published PageVersion snapshot.
            // If the snapshot cannot be found this is a data-integrity error — do NOT
            // silently fall back to page.schema.
            const publishedVersion = await pageService.getPageVersion(pageId, data.publishedVersionNumber);

            if (cancelled) return;

            setHistoricalVersion(publishedVersion);

            const previewSchema = publishedVersion.schemaSnapshot;
            if (previewSchema && Array.isArray(previewSchema.components)) {
              setComponents(normalizePageComponents(previewSchema.components as BuilderComponent[]));
            } else {
              setComponents([]);
              setError(`Published snapshot for version ${data.publishedVersionNumber} has an invalid schema.`);
            }
          } else {
            // Not published – display current page.schema
            setHistoricalVersion(null);
            if (data.schema && Array.isArray(data.schema.components)) {
              setComponents(normalizePageComponents(data.schema.components as BuilderComponent[]));
            }
          }
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unable to load this page version.";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPage();
    if (pageId) {
      fetchVersions(pageId);
    }
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

  const handleDeleteVersion = async (e: React.MouseEvent, vNumber: number) => {
    e.stopPropagation();
    e.preventDefault();

    if (!window.confirm(`Delete Version ${vNumber}?\n\nThis version will be permanently removed from the page history.\nThis action cannot be undone.`)) {
      return;
    }

    if (!pageId) return;

    try {
      setDeletingVersionNumber(vNumber);
      await pageService.deletePageVersion(pageId, vNumber);
      await fetchVersions(pageId);
      
      // If we are currently viewing the deleted version, navigate away
      if (isExplicitVersion && historicalVersion?.versionNumber === vNumber) {
        navigate(`/preview/${pageId}`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete page version");
    } finally {
      setDeletingVersionNumber(null);
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

  // Determine display context:
  // isExplicitVersion  → URL contains versionNumber (historical behaviour)
  // isPublishedSnapshot → normal route, page is published, snapshot loaded
  const isExplicitVersion = Boolean(versionNumber);
  const isPublishedSnapshot = !isExplicitVersion && page?.status === 'published' && page?.publishedVersionNumber != null;

  // The version number shown in the topbar:
  // – explicit URL  → the requested version number
  // – published     → publishedVersionNumber (not page.version, which may differ)
  // – draft/other   → page.version
  const displayedVersionNumber = isExplicitVersion
    ? historicalVersion?.versionNumber
    : isPublishedSnapshot
      ? page?.publishedVersionNumber
      : page?.version;

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
          
          {isExplicitVersion && historicalVersion ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid var(--border-primary)', paddingLeft: '1rem' }}>
               <span style={{ color: 'var(--warning-400)', fontWeight: 600, fontSize: '0.9rem' }}>Viewing version {historicalVersion.versionNumber}</span>
               <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Read-only</span>
               {historicalVersion.isCurrent && <span style={{ backgroundColor: 'var(--primary-500)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Current</span>}
               <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>• {getPageVersionReasonLabel(historicalVersion.reason)} • {formatDate(historicalVersion.createdAt)} • {historicalVersion.createdBy?.fullName || 'Unknown user'}</span>
            </div>
          ) : (
            <>
              {displayedVersionNumber != null && (
                <span style={{ color: 'var(--text-secondary)', paddingLeft: '1rem', borderLeft: '1px solid var(--border-primary)', fontSize: '0.85rem', fontWeight: 500 }}>
                  {isPublishedSnapshot ? `Published version ${displayedVersionNumber}` : `v${displayedVersionNumber}`}
                </span>
              )}
              {page?.status && <StatusBadge status={page.status} />}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {authUser?.role === 'user-developer' && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (isExplicitVersion) {
                  navigate(`/builder/${pageId}`);
                } else {
                  handleBackToBuilder();
                }
              }}
            >
              {isExplicitVersion ? "Open builder" : "Back to builder"}
            </button>
          )}
          {!isExplicitVersion && (
            <button
              className="btn btn-primary"
              onClick={handleBackToDashboard}
              style={{ backgroundColor: 'var(--navy-950)' }}
            >
              Back to dashboard
            </button>
          )}
          {isExplicitVersion && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>This preview opened in a separate tab.</span>
          )}
        </div>
      </header>

      <div className="preview-main-wrapper">
        <aside className="preview-sidebar sidebar-scrollbar">
          <h3>Versions</h3>
          <div className="preview-sidebar-list">
            {page && versions.map((version) => {
              const v = version.versionNumber;
              const isSelected = isExplicitVersion
                ? v === historicalVersion?.versionNumber
                : isPublishedSnapshot
                  ? v === page.publishedVersionNumber
                  : v === page.version;
              const isCurrent = v === page.version;
              const isPublished = v === page.publishedVersionNumber;
              const targetUrl = v === page.version && isExplicitVersion ? `/preview/${pageId}` : `/pages/${pageId}/versions/${v}/preview`;

              const canDelete = !isCurrent && !isPublished && authUser?.role === 'user-developer';
              const isDeleting = deletingVersionNumber === v;

              return (
                <div key={v} style={{ position: 'relative' }}>
                  <Link 
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
                      color: 'white',
                      paddingRight: canDelete ? '60px' : '15px'
                    }}
                  >
                    <span>Version {v}</span>
                    {isCurrent && <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 600 }}>CURRENT</span>}
                    {isPublished && !isCurrent && <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>PUBLISHED</span>}
                  </Link>
                  {canDelete && (
                    <button
                      onClick={(e) => handleDeleteVersion(e, v)}
                      disabled={isDeleting || deletingVersionNumber !== null}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        color: '#ef4444',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        cursor: isDeleting || deletingVersionNumber !== null ? 'not-allowed' : 'pointer',
                        opacity: isDeleting || deletingVersionNumber !== null ? 0.5 : 1
                      }}
                    >
                      {isDeleting ? '...' : 'Delete'}
                    </button>
                  )}
                </div>
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

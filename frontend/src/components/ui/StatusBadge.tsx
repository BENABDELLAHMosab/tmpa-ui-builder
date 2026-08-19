
interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const normalizedStatus = String(status ?? "").toUpperCase();
  
  let bgColor = 'var(--color-draft-bg)';
  let color = 'var(--color-draft)';
  let displayStatus = normalizedStatus;

  switch (normalizedStatus) {
    case 'ACTIVE':
      bgColor = 'var(--color-success-bg)';
      color = 'var(--color-success)';
      displayStatus = 'Active';
      break;
    case 'SUSPENDED':
      bgColor = 'var(--color-danger-bg)';
      color = 'var(--color-danger)';
      displayStatus = 'Suspended';
      break;
    case 'DRAFT':
      bgColor = 'var(--color-draft-bg)';
      color = 'var(--color-draft)';
      displayStatus = 'DRAFT';
      break;
    case 'SUBMITTED':
    case 'PENDING':
      bgColor = 'var(--color-warning-bg)';
      color = 'var(--color-warning)';
      displayStatus = 'PENDING';
      break;
    case 'APPROVED':
      bgColor = 'var(--color-success-bg)';
      color = 'var(--color-success)';
      displayStatus = 'APPROVED';
      break;
    case 'REJECTED':
      bgColor = 'var(--color-danger-bg)';
      color = 'var(--color-danger)';
      displayStatus = 'REJECTED';
      break;
    case 'PUBLISHED':
      bgColor = 'var(--color-published-bg)';
      color = 'var(--color-published)';
      displayStatus = 'PUBLISHED';
      break;
    default:
      break;
  }

  return (
    <span
      style={{
        backgroundColor: bgColor,
        color: color,
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        border: `1px solid ${color}`,
        display: 'inline-block',
        whiteSpace: 'nowrap',
        textAlign: 'center'
      }}
    >
      {displayStatus}
    </span>
  );
};

export const ReviewStatusBadge = ({ status }: StatusBadgeProps) => {
  const normalizedStatus = String(status ?? "").toLowerCase();
  
  let color = 'var(--text-secondary)';
  let displayStatus = normalizedStatus.toUpperCase();

  switch (normalizedStatus) {
    case 'submitted':
      color = '#60a5fa'; // blue-400
      displayStatus = 'IN REVIEW';
      break;
    case 'approved':
      color = '#34d399'; // emerald-400
      displayStatus = 'APPROVED';
      break;
    case 'changes_requested':
      color = '#ef4444'; // red-500
      displayStatus = 'CHANGES REQUESTED';
      break;
    case 'superseded':
      color = '#94a3b8'; // slate-400
      displayStatus = 'SUPERSEDED';
      break;
    default:
      break;
  }

  // Uses the same height/padding layout principles
  return (
    <span
      style={{
        color: color,
        fontSize: normalizedStatus === 'changes_requested' ? '0.65rem' : '0.7rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        lineHeight: 1,
        height: '18px', // fixed height to ensure uniformity
      }}
    >
      {displayStatus}
    </span>
  );
};

export default StatusBadge;

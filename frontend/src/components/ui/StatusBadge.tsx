
interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const normalizedStatus = String(status ?? "").toUpperCase();
  
  let bgColor = 'var(--color-draft-bg)';
  let color = 'var(--color-draft)';
  let displayStatus = normalizedStatus;

  switch (normalizedStatus) {
    case 'DRAFT':
      bgColor = 'var(--color-draft-bg)';
      color = 'var(--color-draft)';
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
      break;
    case 'REJECTED':
      bgColor = 'var(--color-danger-bg)';
      color = 'var(--color-danger)';
      break;
    case 'PUBLISHED':
      bgColor = 'var(--color-published-bg)';
      color = 'var(--color-published)';
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

export default StatusBadge;

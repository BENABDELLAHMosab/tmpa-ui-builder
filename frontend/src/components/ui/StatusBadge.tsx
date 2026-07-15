
interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  let bgColor = 'var(--color-draft-bg)';
  let color = 'var(--color-draft)';
  let displayStatus = status.toUpperCase();

  switch (status.toLowerCase()) {
    case 'draft':
      bgColor = 'var(--color-draft-bg)';
      color = 'var(--color-draft)';
      break;
    case 'submitted':
    case 'pending':
      bgColor = 'var(--color-warning-bg)';
      color = 'var(--color-warning)';
      displayStatus = 'PENDING';
      break;
    case 'approved':
      bgColor = 'var(--color-success-bg)';
      color = 'var(--color-success)';
      break;
    case 'rejected':
      bgColor = 'var(--color-danger-bg)';
      color = 'var(--color-danger)';
      break;
    case 'published':
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
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        border: `1px solid ${color}`
      }}
    >
      {displayStatus}
    </span>
  );
};

export default StatusBadge;

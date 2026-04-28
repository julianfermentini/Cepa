const styles = {
  draft:    { backgroundColor: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' },
  active:   { backgroundColor: 'rgba(34,197,94,0.12)',  color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' },
  archived: { backgroundColor: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: '1px solid rgba(156,163,175,0.2)' },
}

const dots = {
  draft:    '#fbbf24',
  active:   '#22c55e',
  archived: '#9ca3af',
}

const labels = {
  draft:    'Borrador',
  active:   'Publicado',
  archived: 'Archivado',
}

export default function StatusBadge({ status }) {
  const style = styles[status] ?? styles.draft
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={style}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dots[status] ?? dots.draft }} />
      {labels[status] ?? status}
    </span>
  )
}

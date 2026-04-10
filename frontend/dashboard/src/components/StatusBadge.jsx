const styles = {
  draft:    'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  active:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  archived: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
}

const labels = {
  draft:    'Borrador',
  active:   'Publicado',
  archived: 'Archivado',
}

const dots = {
  draft:    'bg-amber-400',
  active:   'bg-emerald-400',
  archived: 'bg-gray-400',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] ?? styles.draft}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ?? dots.draft}`} />
      {labels[status] ?? status}
    </span>
  )
}

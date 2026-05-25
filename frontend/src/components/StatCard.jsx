export default function StatCard({ title, value, icon: Icon, color = 'brand', sub }) {
  const colors = {
    brand:   'bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-emerald',
    blue:    'bg-blue-50   dark:bg-blue-900/20   text-blue-700   dark:text-blue-400',
    green:   'bg-green-50  dark:bg-green-900/20  text-green-700  dark:text-green-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    gold:    'bg-accent-gold-light/60 dark:bg-accent-gold/15 text-accent-gold-dark dark:text-accent-gold',
    amber:   'bg-amber-50  dark:bg-amber-900/20  text-amber-700  dark:text-amber-400',
    red:     'bg-red-50    dark:bg-red-900/20    text-red-700    dark:text-red-400',
    rose:    'bg-rose-50   dark:bg-rose-900/20   text-rose-700   dark:text-rose-400',
    purple:  'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    pink:    'bg-pink-50   dark:bg-pink-900/20   text-pink-700   dark:text-pink-400',
    indigo:  'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
  };

  return (
    <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl shrink-0 ${colors[color] ?? colors.brand}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white font-display mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}
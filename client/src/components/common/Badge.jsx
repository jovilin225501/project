import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-blue-50 text-blue-700 border-blue-200',
    Assigned: 'bg-purple-50 text-purple-700 border-purple-200',
    'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    Cancelled: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const currentStyle = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {status}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const colors = {
    plastic: 'bg-sky-50 text-sky-700 border-sky-200',
    paper: 'bg-amber-50 text-amber-800 border-amber-200',
    glass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    organic: 'bg-lime-50 text-lime-800 border-lime-200',
    electronic: 'bg-violet-50 text-violet-800 border-violet-200',
    mixed: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  const style = colors[category?.toLowerCase()] || colors.mixed;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize ${style}`}>
      {category}
    </span>
  );
};

export const UrgencyBadge = ({ urgency }) => {
  const levels = {
    low: 'bg-slate-100 text-slate-700 border-slate-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
  };

  const style = levels[urgency?.toLowerCase()] || levels.medium;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider ${style}`}>
      {urgency}
    </span>
  );
};

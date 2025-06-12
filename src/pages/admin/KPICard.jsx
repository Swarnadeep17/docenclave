import React from 'react';

const KPICard = ({ title, value, icon, note }) => {
  return (
    <div className="bg-dark-secondary p-4 rounded-lg border border-dark-border">
      <div className="flex items-center">
        <div className="bg-dark-tertiary p-3 rounded-lg mr-4">{icon}</div>
        <div>
          <p className="text-sm text-dark-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-dark-text-primary">{value}</p>
        </div>
      </div>
      {note && <p className="text-xs text-dark-text-muted mt-2">{note}</p>}
    </div>
  );
};

export default KPICard;
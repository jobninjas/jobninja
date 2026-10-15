import React from 'react';
import { UserCheck, MapPin, DollarSign, Calendar } from 'lucide-react';

export const CandidateNodeBlock = ({ layer, isSelected }: { layer: any, isSelected: boolean }) => {
  const candidateName = layer.config?.candidateName || layer.value || 'Candidate';
  const fromLocation = layer.config?.fromLocation || 'Remote / Not specified';
  const toLocation = layer.config?.toLocation || 'Onsite';
  const date = layer.config?.date;
  const budget = layer.config?.budget;
  const status = layer.config?.status || 'Active Candidate';

  return (
    <div 
      className={`w-full h-full rounded-xl border-2 flex flex-col overflow-hidden bg-card shadow-xl ${
        isSelected ? 'border-pink-500 shadow-pink-500/20' : 'border-border'
      }`}
    >
      <div className="bg-pink-100 dark:bg-pink-900/30 px-3 py-2 border-b border-pink-200 dark:border-pink-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-pink-200 dark:bg-pink-800 text-pink-700 dark:text-pink-300">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">{candidateName}</h3>
            <p className="text-[10px] uppercase font-semibold text-pink-600 dark:text-pink-400">{status}</p>
          </div>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-3 bg-white dark:bg-slate-950">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4" />
            <span>Origin: <b>{fromLocation}</b></span>
          </div>
          {toLocation && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Destination: <b>{toLocation}</b></span>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>Interview: <b>{date}</b></span>
            </div>
          )}
          {budget && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <DollarSign className="w-4 h-4" />
              <span>Budget: <b>${budget}</b></span>
            </div>
          )}
        </div>
        
        {layer.status === 'Onsite Ready' && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-bold flex items-center gap-2">
            <span>✓ ONSITE READY</span>
          </div>
        )}
      </div>
    </div>
  );
};

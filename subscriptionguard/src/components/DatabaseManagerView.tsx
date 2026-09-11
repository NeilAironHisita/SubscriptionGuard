import React, { useState } from 'react';
import { db } from '../services/db';
import { UserProfile, Subscription, FreeTrial, UsageLog, AuditLog } from '../types';

interface DatabaseManagerViewProps {
  userProfile: UserProfile;
  subscriptions: Subscription[];
  freeTrials: FreeTrial[];
  usageLogs: UsageLog[];
  auditLogs: AuditLog[];
  onRefresh: () => void;
}

export const DatabaseManagerView: React.FC<DatabaseManagerViewProps> = ({
  userProfile,
  subscriptions,
  freeTrials,
  usageLogs,
  auditLogs,
  onRefresh,
}) => {
  const [activeTable, setActiveTable] = useState<'subscriptions' | 'free_trials' | 'user_profiles' | 'usage_logs' | 'audit_logs'>('subscriptions');
  const [rawJson, setRawJson] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM subscriptions WHERE status = 'Active';");
  const [queryResult, setQueryResult] = useState<any[] | null>(null);

  const handleExport = () => {
    const json = db.exportDatabaseJSON();
    setRawJson(json);
  };

  const handleImport = () => {
    if (!rawJson) return;
    const success = db.importDatabaseJSON(rawJson);
    if (success) {
      setImportStatus('Database successfully synchronized!');
      onRefresh();
      setTimeout(() => setImportStatus(''), 3000);
    } else {
      setImportStatus('Failed to parse JSON. Please verify syntax.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset database to default seed state?')) {
      db.resetToInitial();
      onRefresh();
    }
  };

  const runSimulatedSql = (e: React.FormEvent) => {
    e.preventDefault();
    const query = sqlQuery.trim().toLowerCase();

    if (query.includes('from subscriptions')) {
      if (query.includes("where status = 'active'")) {
        setQueryResult(subscriptions.filter((s) => s.status === 'Active'));
      } else if (query.includes("where status = 'cancelled'")) {
        setQueryResult(subscriptions.filter((s) => s.status === 'Cancelled'));
      } else {
        setQueryResult(subscriptions);
      }
    } else if (query.includes('from free_trials')) {
      setQueryResult(freeTrials);
    } else if (query.includes('from usage_logs')) {
      setQueryResult(usageLogs);
    } else if (query.includes('from user_profiles')) {
      setQueryResult([userProfile]);
    } else {
      setQueryResult(subscriptions);
    }
  };

  return (
    <main className="px-4 md:px-8 max-w-6xl mx-auto mt-4 pb-28 md:pb-12 space-y-6">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-[#10B981] font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
            <span>Relational Storage Engine Active (Real-Time Sync)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
            Relational Database Schema & Inspector
          </h1>
          <p className="text-xs md:text-sm text-[#9CA3AF]">
            Inspect tables, execute DQL queries, export relational dumps, or reset seed states.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-[#181C24] hover:bg-[#262A33] border border-[#2D3748] rounded-xl text-xs font-bold text-[#DFE2EE] transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 border border-[#EF4444]/40 rounded-xl text-xs font-bold text-[#EF4444] transition-colors"
          >
            Reset Seed
          </button>
        </div>
      </section>

      {/* SQL Runner Simulator */}
      <section className="bg-[#1E2640] rounded-2xl p-5 border border-[#2D3748] shadow-lg">
        <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#10B981] text-sm">terminal</span>
          Relational SQL Query Runner (DQL / DML)
        </h3>
        <form onSubmit={runSimulatedSql} className="flex gap-2">
          <input
            type="text"
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="flex-1 bg-[#0B0F17] border border-[#2D3748] rounded-xl px-3.5 py-2 font-mono text-xs text-[#10B981] outline-none focus:border-[#10B981]"
            placeholder="SELECT * FROM subscriptions WHERE status = 'Active';"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#10B981] text-black font-bold rounded-xl text-xs hover:bg-[#34D399] transition-colors"
          >
            Execute SQL
          </button>
        </form>

        {queryResult && (
          <div className="mt-3 p-3 bg-[#0B0F17] rounded-xl border border-[#2D3748] max-h-48 overflow-auto">
            <span className="text-[11px] font-bold text-[#9CA3AF] block mb-1">
              Query Result: {queryResult.length} rows returned
            </span>
            <pre className="text-[11px] font-mono text-[#DFE2EE] whitespace-pre-wrap">
              {JSON.stringify(queryResult, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* Relational Table Selector Tabs */}
      <section className="bg-[#1E2640] rounded-2xl p-6 border border-[#2D3748] shadow-lg">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-[#2D3748]">
          <button
            onClick={() => setActiveTable('subscriptions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTable === 'subscriptions'
                ? 'bg-[#10B981] text-black shadow-md'
                : 'bg-[#181C24] text-[#DFE2EE] hover:bg-[#262A33]'
            }`}
          >
            subscriptions ({subscriptions.length})
          </button>

          <button
            onClick={() => setActiveTable('free_trials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTable === 'free_trials'
                ? 'bg-[#10B981] text-black shadow-md'
                : 'bg-[#181C24] text-[#DFE2EE] hover:bg-[#262A33]'
            }`}
          >
            free_trials ({freeTrials.length})
          </button>

          <button
            onClick={() => setActiveTable('usage_logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTable === 'usage_logs'
                ? 'bg-[#10B981] text-black shadow-md'
                : 'bg-[#181C24] text-[#DFE2EE] hover:bg-[#262A33]'
            }`}
          >
            usage_logs ({usageLogs.length})
          </button>

          <button
            onClick={() => setActiveTable('user_profiles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTable === 'user_profiles'
                ? 'bg-[#10B981] text-black shadow-md'
                : 'bg-[#181C24] text-[#DFE2EE] hover:bg-[#262A33]'
            }`}
          >
            user_profiles (1)
          </button>

          <button
            onClick={() => setActiveTable('audit_logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTable === 'audit_logs'
                ? 'bg-[#10B981] text-black shadow-md'
                : 'bg-[#181C24] text-[#DFE2EE] hover:bg-[#262A33]'
            }`}
          >
            audit_logs ({auditLogs.length})
          </button>
        </div>

        {/* Active Table Viewer */}
        <div className="mt-4 overflow-x-auto">
          {activeTable === 'subscriptions' && (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2D3748] text-[#9CA3AF]">
                  <th className="p-2">subscription_id</th>
                  <th className="p-2">service_name</th>
                  <th className="p-2">category</th>
                  <th className="p-2">billing_cycle</th>
                  <th className="p-2">cost</th>
                  <th className="p-2">next_billing_date</th>
                  <th className="p-2">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D3748]/50">
                {subscriptions.map((s) => (
                  <tr key={s.subscription_id} className="hover:bg-[#181C24]">
                    <td className="p-2 text-[#9CA3AF]">{s.subscription_id}</td>
                    <td className="p-2 font-bold text-white">{s.service_name}</td>
                    <td className="p-2">{s.category}</td>
                    <td className="p-2">{s.billing_cycle}</td>
                    <td className="p-2 font-bold text-[#10B981]">{s.cost.toFixed(2)}</td>
                    <td className="p-2">{s.next_billing_date}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'Active' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'free_trials' && (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2D3748] text-[#9CA3AF]">
                  <th className="p-2">trial_id</th>
                  <th className="p-2">service_name</th>
                  <th className="p-2">tier_name</th>
                  <th className="p-2">expiry_date</th>
                  <th className="p-2">cost_after_trial</th>
                  <th className="p-2">alert_lead_time_hours</th>
                  <th className="p-2">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D3748]/50">
                {freeTrials.map((t) => (
                  <tr key={t.trial_id} className="hover:bg-[#181C24]">
                    <td className="p-2 text-[#9CA3AF]">{t.trial_id}</td>
                    <td className="p-2 font-bold text-white">{t.service_name}</td>
                    <td className="p-2">{t.tier_name}</td>
                    <td className="p-2 text-[#EF4444] font-bold">{t.expiry_date}</td>
                    <td className="p-2 font-bold text-[#10B981]">{t.cost_after_trial.toFixed(2)}</td>
                    <td className="p-2">{t.alert_lead_time_hours}h</td>
                    <td className="p-2">
                      <span className="bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded text-[10px] font-bold">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'usage_logs' && (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2D3748] text-[#9CA3AF]">
                  <th className="p-2">log_id</th>
                  <th className="p-2">subscription_id</th>
                  <th className="p-2">total_monthly_hours</th>
                  <th className="p-2">weekly_hours [W1,W2,W3,W4]</th>
                  <th className="p-2">user_value_rating</th>
                  <th className="p-2">drop_percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D3748]/50">
                {usageLogs.map((l) => (
                  <tr key={l.log_id} className="hover:bg-[#181C24]">
                    <td className="p-2 text-[#9CA3AF]">{l.log_id}</td>
                    <td className="p-2 text-white font-bold">{l.subscription_id}</td>
                    <td className="p-2">{l.total_monthly_hours} hrs</td>
                    <td className="p-2 text-[#10B981]">[{l.weekly_hours.join(', ')}]</td>
                    <td className="p-2">{l.user_value_rating} / 5</td>
                    <td className="p-2 text-[#EF4444]">{l.drop_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'user_profiles' && (
            <div className="p-4 bg-[#0B0F17] rounded-xl font-mono text-xs text-[#DFE2EE]">
              <pre>{JSON.stringify(userProfile, null, 2)}</pre>
            </div>
          )}

          {activeTable === 'audit_logs' && (
            <div className="p-4 bg-[#0B0F17] rounded-xl font-mono text-xs text-[#DFE2EE] space-y-2">
              {auditLogs.map((a) => (
                <div key={a.log_id} className="border-b border-[#2D3748] pb-1.5">
                  <span className="text-[#10B981]">[{a.timestamp}]</span> <strong>{a.action_type}</strong>: {a.details}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Raw JSON Dump & Import Area */}
      <section className="bg-[#1E2640] rounded-2xl p-6 border border-[#2D3748] shadow-lg">
        <h3 className="text-sm font-bold text-white mb-2">
          Raw Relational Database JSON Import / Export
        </h3>
        <textarea
          rows={6}
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          placeholder="Click 'Export JSON' above or paste schema JSON here..."
          className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl p-3 font-mono text-xs text-[#10B981] outline-none focus:border-[#10B981]"
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-[#10B981] font-semibold">{importStatus}</span>
          <button
            onClick={handleImport}
            className="px-5 py-2 bg-[#10B981] text-black font-bold rounded-xl text-xs hover:bg-[#34D399] transition-colors"
          >
            Import and Apply Changes
          </button>
        </div>
      </section>
    </main>
  );
};

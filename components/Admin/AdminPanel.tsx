
import React, { useState, useMemo } from 'react';
import { User, Video, SystemLog, Report, SystemNotification } from '../../types';

interface AdminPanelProps {
  users: User[];
  videos: Video[];
  logs: SystemLog[];
  reports: Report[];
  notifications: SystemNotification[];
  onBlockUser: (userId: string) => void;
  onToggleMonetization: (userId: string) => void;
  onToggleVerification: (userId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onHandleReport: (reportId: string, action: 'resolve' | 'dismiss') => void;
  onSendNotification: (userId: string, title: string, message: string, type: any) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, videos, logs, reports, notifications, onBlockUser, 
  onToggleMonetization, onToggleVerification, onDeleteVideo, 
  onHandleReport, onSendNotification 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'iam' | 'content' | 'moderation' | 'comms' | 'audit' | 'alerts'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmBlockUser, setConfirmBlockUser] = useState<User | null>(null);
  
  // Notification Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteMsg, setNoteMsg] = useState('');
  const [noteType, setNoteType] = useState<'info' | 'warning' | 'alert'>('info');

  const stats = useMemo(() => {
    const totalViews = videos.reduce((acc, v) => acc + v.views, 0);
    const monetizedCount = users.filter(u => u.monetized).length;
    const verifiedCount = users.filter(u => u.isVerified).length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const criticalLogs = logs.filter(l => l.type === 'danger' || l.type === 'warning').length;
    return { totalViews, monetizedCount, verifiedCount, pendingReports, criticalLogs };
  }, [videos, users, reports, logs]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Derive Internal Admin Alerts
  const adminAlerts = useMemo(() => {
    const pendingRepAlerts = reports
      .filter(r => r.status === 'pending')
      .map(r => ({
        id: `alert-rep-${r.id}`,
        title: `Pending Report: ${r.type}`,
        message: `${r.reporterName} reported ${r.targetName} for "${r.reason}"`,
        timestamp: r.createdAt,
        type: 'warning' as const,
        actionLabel: 'Review Content',
        onAction: () => setActiveSubTab('moderation')
      }));

    const criticalLogAlerts = logs
      .filter(l => l.type === 'danger' || l.type === 'warning')
      .map(l => ({
        id: `alert-log-${l.id}`,
        title: `System Alert: ${l.action}`,
        message: `Activity detected on ${l.target}`,
        timestamp: l.timestamp,
        type: l.type === 'danger' ? 'alert' : 'info' as any,
        actionLabel: 'View Audit',
        onAction: () => setActiveSubTab('audit')
      }));

    return [...pendingRepAlerts, ...criticalLogAlerts].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [reports, logs]);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteMsg) return;
    onSendNotification('global', noteTitle, noteMsg, noteType);
    setNoteTitle('');
    setNoteMsg('');
    alert('Global Broadcast Sent!');
  };

  return (
    <div className="flex h-full bg-[#080808] relative font-sans">
      {/* Nexus Command HUD */}
      <div className="w-72 bg-[#0f0f0f] border-r border-white/5 flex flex-col hidden lg:flex">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
              <i className="fa-solid fa-shield-halved text-white text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter uppercase">Nexus HQ</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Admin Terminal v3.1</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <CommandNavItem icon="fa-gauge-high" label="Overview" active={activeSubTab === 'overview'} onClick={() => setActiveSubTab('overview')} />
          <CommandNavItem 
            icon="fa-bell" 
            label="Alerts Hub" 
            active={activeSubTab === 'alerts'} 
            onClick={() => setActiveSubTab('alerts')} 
            badge={adminAlerts.length > 0 ? adminAlerts.length : undefined}
          />

          <div className="px-4 py-3 mt-4 mb-1">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Management</span>
          </div>
          <CommandNavItem icon="fa-id-badge" label="Identity & Access" active={activeSubTab === 'iam'} onClick={() => setActiveSubTab('iam')} />
          <CommandNavItem icon="fa-layer-group" label="Content Inventory" active={activeSubTab === 'content'} onClick={() => setActiveSubTab('content')} />
          
          <div className="px-4 py-3 mt-4 mb-1">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Security Hub</span>
          </div>
          <CommandNavItem 
            icon="fa-triangle-exclamation" 
            label="Moderation" 
            active={activeSubTab === 'moderation'} 
            onClick={() => setActiveSubTab('moderation')} 
            badge={stats.pendingReports > 0 ? stats.pendingReports : undefined}
          />
          <CommandNavItem icon="fa-bullhorn" label="Communications" active={activeSubTab === 'comms'} onClick={() => setActiveSubTab('comms')} />
          <CommandNavItem icon="fa-fingerprint" label="Audit Trail" active={activeSubTab === 'audit'} onClick={() => setActiveSubTab('audit')} />
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-red-600/5 rounded-2xl p-4 border border-red-600/20">
            <p className="text-[10px] font-bold text-red-500 uppercase mb-2">Cluster Status</p>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-white/40">Uptime</span>
              <span>99.98%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Display */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0f0f0f] to-[#080808] p-8 md:p-12">
        
        {activeSubTab === 'overview' && (
          <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Command Hub</h1>
                <p className="text-white/40 font-medium">Real-time platform metrics and status aggregation.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatCard label="Total Reach" value={stats.totalViews.toLocaleString()} icon="fa-chart-simple" trend="+18%" />
              <AdminStatCard label="Verified Partners" value={stats.verifiedCount} icon="fa-circle-check" color="text-blue-400" />
              <AdminStatCard label="Monetized Base" value={stats.monetizedCount} icon="fa-sack-dollar" color="text-yellow-500" />
              <AdminStatCard label="Pending Threats" value={stats.pendingReports} icon="fa-shield-virus" status={stats.pendingReports > 0 ? "Action Required" : "Secure"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#121212] rounded-3xl p-8 border border-white/5 shadow-2xl">
                <h3 className="text-xl font-bold mb-6">Security Logs (Recent)</h3>
                <div className="space-y-4">
                  {logs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center gap-4 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'danger' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                      <span className="text-white/20 font-mono w-20">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="font-bold uppercase tracking-widest text-[10px] w-32">{log.action}</span>
                      <span className="text-white/60 truncate">{log.target}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#121212] rounded-3xl p-8 border border-white/5">
                <h3 className="text-xl font-bold mb-6">User Base Growth</h3>
                <div className="h-40 flex items-end gap-2">
                   {[20, 35, 30, 60, 45, 80, 55, 95].map((h, i) => (
                     <div key={i} className="flex-1 bg-red-600/20 hover:bg-red-600/40 transition-all rounded-t-lg" style={{ height: `${h}%` }}></div>
                   ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                  <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'alerts' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tighter">Alerts Hub</h1>
                <p className="text-white/40 mt-1">Internal administrative notifications and system health alerts.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                  {adminAlerts.length} Active Notifications
                </span>
              </div>
            </header>

            <div className="space-y-4">
              {adminAlerts.length > 0 ? (
                adminAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-6 rounded-3xl border ${alert.type === 'alert' ? 'bg-red-600/5 border-red-600/20' : 'bg-white/[0.03] border-white/10'} hover:bg-white/[0.05] transition-all group`}
                  >
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${alert.type === 'alert' ? 'bg-red-600/10 border-red-600/20 text-red-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                          <i className={`fa-solid ${alert.type === 'alert' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}></i>
                        </div>
                        <div>
                          <h4 className={`font-bold text-base mb-1 ${alert.type === 'alert' ? 'text-red-500' : 'text-white'}`}>{alert.title}</h4>
                          <p className="text-sm text-white/60 mb-2 leading-relaxed">{alert.message}</p>
                          <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={alert.onAction}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                      >
                        {alert.actionLabel}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 opacity-30">
                  <i className="fa-solid fa-check-double text-4xl"></i>
                  <p className="font-black uppercase tracking-widest">All Clear. No internal alerts.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'iam' && (
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h1 className="text-4xl font-black tracking-tighter">Identity Management</h1>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-white/20"></i>
                <input 
                  type="text" placeholder="Search identities..." 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-red-600 transition-all w-full md:w-80"
                />
              </div>
            </header>

            <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30">
                  <tr>
                    <th className="px-8 py-6">Member</th>
                    <th className="px-8 py-6">Tiers</th>
                    <th className="px-8 py-6">Monetization Status</th>
                    <th className="px-8 py-6">Assets</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={u.avatar} className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-sm">{u.name}</p>
                              {u.isVerified && <i className="fa-solid fa-circle-check text-blue-400 text-[10px]"></i>}
                            </div>
                            <p className="text-[11px] text-white/30 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${u.isVerified ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white/5 text-white/20 border-white/10'}`}>
                            Verified
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => onToggleMonetization(u.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 ${u.monetized ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-red-500/5 border-red-500/20 text-red-500/60 hover:bg-red-500/10'} group/btn`}
                        >
                          <div className={`w-2 h-2 rounded-full ${u.monetized ? 'bg-green-500 animate-pulse' : 'bg-red-500 opacity-40'}`}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {u.monetized ? 'Enabled' : 'Disabled'}
                          </span>
                          <i className={`fa-solid ${u.monetized ? 'fa-sack-dollar' : 'fa-ban'} ml-1 opacity-40 group-hover/btn:opacity-100 transition-opacity`}></i>
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-mono font-bold text-white/60">{(u.storageUsed || 0).toLocaleString()} MB</span>
                      </td>
                      <td className="px-8 py-6 text-right flex justify-end gap-2">
                        {u.role !== 'admin' ? (
                          <>
                            <ActionButton icon="fa-check-double" active={u.isVerified} onClick={() => onToggleVerification(u.id)} color="blue" />
                            <button 
                              onClick={() => u.isBlocked ? onBlockUser(u.id) : setConfirmBlockUser(u)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${u.isBlocked ? 'bg-green-600 text-white' : 'bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white'}`}
                            >
                              {u.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          </>
                        ) : <span className="text-[9px] uppercase tracking-widest text-white/20 italic">Protected System User</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'content' && (
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tighter">Asset Library</h1>
                <p className="text-white/40 mt-1">Platform-wide video and reel management.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {videos.map(v => (
                <div key={v.id} className="bg-[#121212] rounded-3xl overflow-hidden border border-white/5 group shadow-2xl relative">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={v.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${v.type === 'reel' ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white'}`}>
                            {v.type}
                        </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-sm truncate mb-1">{v.title}</h4>
                    <p className="text-[11px] text-white/40 mb-4">By {v.authorName} • {v.views.toLocaleString()} views</p>
                    <button 
                        onClick={() => onDeleteVideo(v.id)}
                        className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl py-2.5 transition-all text-[10px] font-black uppercase tracking-widest border border-red-600/20"
                    >
                        Delete Asset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'moderation' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
              <h1 className="text-4xl font-black tracking-tighter">Moderation Desk</h1>
              <p className="text-white/40 mt-1">Process community reports and flagged content.</p>
            </header>

            <div className="space-y-6">
              {reports.map(report => (
                <div key={report.id} className={`p-6 rounded-3xl border ${report.status === 'pending' ? 'bg-white/[0.03] border-white/10' : 'bg-transparent border-white/5 opacity-40'} transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`text-[9px] font-black tracking-[0.2em] uppercase px-2 py-1 rounded mb-2 inline-block ${report.type === 'video' ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'}`}>
                        Report: {report.type}
                      </span>
                      <h4 className="font-bold text-lg">{report.targetName}</h4>
                      <p className="text-xs text-white/40 font-medium">Flagged by: {report.reporterName} • {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => onHandleReport(report.id, 'dismiss')} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase transition-all">Dismiss</button>
                        <button onClick={() => onHandleReport(report.id, 'resolve')} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase transition-all shadow-lg shadow-red-600/20">Strike</button>
                      </div>
                    )}
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 italic text-sm text-white/60">
                    "{report.reason}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'comms' && (
          <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
             <header>
              <h1 className="text-4xl font-black tracking-tighter">Communications</h1>
            </header>

            <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 shadow-2xl">
              <form onSubmit={handleBroadcast} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Broadcast Title</label>
                  <input 
                    type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Message</label>
                  <textarea 
                    value={noteMsg} onChange={(e) => setNoteMsg(e.target.value)}
                    rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all">
                  Send Global Alert
                </button>
              </form>
            </div>
          </div>
        )}

        {activeSubTab === 'audit' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
              <h1 className="text-4xl font-black tracking-tighter">Audit Logs</h1>
            </header>
            <div className="bg-[#121212] rounded-3xl border border-white/5 p-4 space-y-2">
              {logs.map(log => (
                <div key={log.id} className="flex items-center gap-4 text-[11px] font-mono p-3 hover:bg-white/5 rounded-xl transition-all">
                  <span className="text-white/20">{new Date(log.timestamp).toISOString()}</span>
                  <span className={`uppercase font-black ${log.type === 'danger' ? 'text-red-500' : 'text-blue-500'}`}>{log.action}</span>
                  <span className="text-white/60">{log.target}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Confirmation Block Modal */}
      {confirmBlockUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1e1e1e] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Confirm Account Block</h3>
            <p className="text-white/40 text-sm font-medium mb-8 leading-relaxed">
              Block <span className="text-white font-bold">{confirmBlockUser.name}</span>? This will revoke all platform access.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => {onBlockUser(confirmBlockUser.id); setConfirmBlockUser(null);}} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all">Strike Account</button>
              <button onClick={() => setConfirmBlockUser(null)} className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const CommandNavItem = ({ icon, label, active, onClick, badge }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-black tracking-tight transition-all duration-300 border ${active ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' : 'text-white/40 border-transparent hover:bg-white/5 hover:text-white'}`}>
    <div className="flex items-center gap-4">
      <i className={`fa-solid ${icon} w-5 text-center`}></i>
      {label}
    </div>
    {badge && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-lg">{badge}</span>}
  </button>
);

const AdminStatCard = ({ label, value, icon, trend, status, color }: any) => (
  <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group transition-all hover:translate-y-[-4px]">
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
        <i className={`fa-solid ${icon} text-xl ${color || 'text-white/60'}`}></i>
      </div>
      {trend && <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">{trend}</span>}
      {status && <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">{status}</span>}
    </div>
    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className="text-3xl font-black tracking-tighter">{value}</p>
  </div>
);

const ActionButton = ({ icon, active, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${active ? `bg-${color}-500 text-white border-${color}-500 shadow-lg` : 'bg-white/5 hover:bg-white/10 text-white/40 border-white/5'}`}
  >
    <i className={`fa-solid ${icon}`}></i>
  </button>
);

export default AdminPanel;

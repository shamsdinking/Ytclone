
import React, { useMemo } from 'react';
import { Video, User } from '../../types';
import { MONETIZATION_CRITERIA } from '../../constants';

interface DashboardProps {
  user: User;
  videos: Video[];
  onUploadClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, videos, onUploadClick }) => {
  const myVideos = useMemo(() => videos.filter(v => v.authorId === user.id), [videos, user.id]);
  
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    let totalViews = 0;
    let totalLikes = 0;
    let viewsLastMonth = 0;

    myVideos.forEach(v => {
      totalViews += v.views;
      totalLikes += v.likes;
      v.viewHistory?.forEach(h => {
        if (new Date(h.timestamp) >= thirtyDaysAgo) {
          viewsLastMonth += h.count;
        }
      });
    });

    const viewsProgress = Math.min((viewsLastMonth / MONETIZATION_CRITERIA.VIEWS_30_DAYS) * 100, 100);
    const followersProgress = Math.min((user.followers / MONETIZATION_CRITERIA.FOLLOWERS) * 100, 100);
    const isEligible = viewsLastMonth >= MONETIZATION_CRITERIA.VIEWS_30_DAYS && user.followers >= MONETIZATION_CRITERIA.FOLLOWERS;

    // Simulated Analytics for Deep Insights
    const avgViewDuration = myVideos.length > 0 ? "5m 42s" : "0m 0s";
    const retentionRate = myVideos.length > 0 ? 68 : 0;
    
    const topEngagedVideos = [...myVideos]
      .sort((a, b) => {
        const scoreA = (a.likes * 2) + a.views;
        const scoreB = (b.likes * 2) + b.views;
        return scoreB - scoreA;
      })
      .slice(0, 3);

    return { 
      totalViews, 
      totalLikes,
      viewsLastMonth, 
      viewsProgress, 
      followersProgress, 
      isEligible,
      avgViewDuration,
      retentionRate,
      topEngagedVideos
    };
  }, [myVideos, user.followers]);

  const handleApply = () => {
    const subject = encodeURIComponent("Monetization Eligibility Application");
    const body = encodeURIComponent(`Hi,\n\nI am eligible for monetization.\nUser: ${user.name}\nEmail: ${user.email}\nViews (30d): ${stats.viewsLastMonth}\nFollowers: ${user.followers}`);
    window.location.href = `mailto:${MONETIZATION_CRITERIA.TARGET_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channel Dashboard</h1>
          <p className="text-white/60">Welcome back, {user.name} 👋</p>
        </div>
        <button 
          onClick={onUploadClick}
          className="bg-red-600 hover:bg-red-700 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Upload Content
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monetization Card */}
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/5 flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-sack-dollar text-green-500"></i>
              Monetization
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Views (30 days)</span>
                  <span className="font-bold">{stats.viewsLastMonth.toLocaleString()} / {MONETIZATION_CRITERIA.VIEWS_30_DAYS.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${stats.viewsProgress}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Followers</span>
                  <span className="font-bold">{user.followers.toLocaleString()} / {MONETIZATION_CRITERIA.FOLLOWERS.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${stats.followersProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {stats.isEligible ? (
              <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-xl text-center">
                <p className="text-green-400 font-bold mb-3">You are eligible! 🎉</p>
                <button 
                  onClick={handleApply}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition-colors"
                >
                  Apply Now
                </button>
              </div>
            ) : (
              <p className="text-xs text-center text-white/40 italic">
                Keep creating! You're almost there.
              </p>
            )}
          </div>
        </div>

        {/* Deep Analytics Card */}
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/5 shadow-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-purple-500"></i>
            Key Analytics
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Avg. View Duration</span>
                <span className="text-xl font-bold">{stats.avgViewDuration}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <i className="fa-solid fa-clock text-blue-400"></i>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Audience Retention</span>
                <span className="text-xl font-bold">{stats.retentionRate}%</span>
              </div>
              <div className="relative w-12 h-12">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={126}
                    strokeDashoffset={126 - (126 * stats.retentionRate) / 100}
                    className="text-purple-500 transition-all duration-1000 ease-out"
                  />
                </svg>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="font-bold text-xs text-white/60 mb-3 uppercase tracking-widest">Top Engaged</h3>
              <div className="space-y-3">
                {stats.topEngagedVideos.map(v => (
                  <div key={v.id} className="flex items-center gap-3 group cursor-help" title={`Likes: ${v.likes}`}>
                    <img src={v.thumbnail} className="w-12 aspect-video object-cover rounded shadow-md" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold truncate group-hover:text-purple-400 transition-colors">{v.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-white/40">
                        <span>{v.views.toLocaleString()} views</span>
                        <span>•</span>
                        <span className="text-purple-400 font-bold">{( (v.likes/Math.max(1,v.views)) * 100 ).toFixed(1)}% ER</span>
                      </div>
                    </div>
                  </div>
                ))}
                {stats.topEngagedVideos.length === 0 && <p className="text-xs text-white/20 italic">No data yet</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Activity Card */}
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/5 shadow-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-yellow-500"></i>
            Real-time Activity
          </h2>
          <div className="h-32 flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 50, 60, 85, 40].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-red-600/20 hover:bg-red-600/50 rounded-t-sm transition-all cursor-help relative group/bar"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-1.5 py-0.5 rounded font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {h}k views
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-white/40 uppercase font-bold tracking-[0.2em] px-1">
            <span>Last 48 hours</span>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">Total Lifetime Views</span>
              <span className="font-bold font-mono">{stats.totalViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">Total Likes Received</span>
              <span className="font-bold font-mono text-red-500">{stats.totalLikes.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Table Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight px-1">Content Library</h2>
        <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[11px] uppercase tracking-widest text-white/40 font-bold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Video Content</th>
                  <th className="px-6 py-4">Visibility</th>
                  <th className="px-6 py-4">Upload Date</th>
                  <th className="px-6 py-4 text-right">Views</th>
                  <th className="px-6 py-4 text-right">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myVideos.map(video => (
                  <tr key={video.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="relative w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0 shadow-lg border border-white/10">
                        <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] px-1 rounded font-bold">12:45</div>
                      </div>
                      <div className="flex flex-col overflow-hidden max-w-[200px] sm:max-w-xs">
                        <span className="font-bold truncate text-sm group-hover:text-blue-400 transition-colors">{video.title}</span>
                        <span className="text-[10px] text-white/40 truncate">{video.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                        <span className="text-xs font-bold text-white/80">Public</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-white/60 font-medium">
                      {new Date(video.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm">
                      {video.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                          <i className="fa-solid fa-heart text-[10px]"></i>
                          {video.likes.toLocaleString()}
                        </div>
                        <span className="text-[9px] text-white/30 uppercase tracking-tighter">Engagement rate: {((video.likes / Math.max(1, video.views)) * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {myVideos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-white/40 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center border border-white/10">
                        <i className="fa-solid fa-clapperboard text-2xl text-white/20"></i>
                      </div>
                      <div>
                        <p className="font-bold text-white/60">No content found</p>
                        <p className="text-xs">Start your journey by uploading your first video.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

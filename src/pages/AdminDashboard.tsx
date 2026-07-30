import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  ShieldAlert, Users, FileText, Flag, BarChart3, Search, Ban, CheckCircle,
  Trash2, UserCheck, Shield, Award, Eye, Heart, MessageSquare, AlertTriangle, UserX
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser, navigateTo, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'analytics' | 'reports'>('users');
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalPosts: number;
    totalReports: number;
    pendingReports: number;
    totalViews: number;
    systemHealth: string;
  }>({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    pendingReports: 0,
    totalViews: 0,
    systemHealth: 'Optimal'
  });

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Posts State
  const [postsList, setPostsList] = useState<any[]>([]);

  // Reports State
  const [reportsList, setReportsList] = useState<any[]>([]);

  // Check admin role
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      showToast('Access denied. Administrator privileges required.', 'error');
      navigateTo('/login');
    } else {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, postsRes, reportsRes] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getUsers(),
        api.admin.getPosts(),
        api.admin.getReports()
      ]);

      if (dashRes.data) setStats(dashRes.data);
      if (usersRes.data) setUsersList(usersRes.data);
      if (postsRes.data) setPostsList(postsRes.data);
      if (reportsRes.data) setReportsList(reportsRes.data);
    } catch (e: any) {
      console.error('Failed to load admin data', e);
      showToast(e.message || 'Failed to load admin dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return null;
  }

  // User role change
  const handleChangeRole = async (userId: string, newRole: string) => {
    if (newRole === 'ADMIN') {
      showToast('Creating additional Admin accounts is disabled. Only initial setup creates the Admin.', 'warning');
      return;
    }
    try {
      await api.admin.updateUserRole(userId, newRole);
      showToast(`User role updated to ${newRole}`, 'success');
      fetchAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  // Suspend / Activate user
  const handleToggleSuspend = async (user: any) => {
    try {
      if (user.isBanned) {
        await api.admin.activateUser(user.id);
        showToast(`User @${user.username} unbanned`, 'success');
      } else {
        await api.admin.suspendUser(user.id, 'Violation of publishing guidelines');
        showToast(`User @${user.username} suspended`, 'warning');
      }
      fetchAdminData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await api.admin.deleteUser(userId);
      showToast('User deleted by Admin', 'info');
      fetchAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to remove this post?')) return;
    try {
      await api.admin.deletePost(postId);
      showToast('Post removed', 'info');
      fetchAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove post', 'error');
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter(u => 
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Admin Header */}
      <div className="bg-purple-950 border border-purple-800 text-white rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-400/30">
            <ShieldAlert className="w-8 h-8 text-purple-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">System Administration Console</h1>
            <p className="text-xs text-purple-300 mt-1">
              Logged in as <span className="font-bold text-white">{currentUser.name}</span> ({currentUser.email}) • Mode: System Owner
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={fetchAdminData} className="px-4 py-2 bg-purple-900/60 hover:bg-purple-800 border border-purple-700 text-xs font-semibold rounded-xl transition-all">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-text-tertiary uppercase">Total Users</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-brand-text-primary mt-2">{stats.totalUsers}</p>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-text-tertiary uppercase">Published Content</span>
            <FileText className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-brand-text-primary mt-2">{stats.totalPosts}</p>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-text-tertiary uppercase">Total Views</span>
            <Eye className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-brand-text-primary mt-2">{stats.totalViews}</p>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-text-tertiary uppercase">Pending Reports</span>
            <Flag className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-brand-text-primary mt-2">{stats.pendingReports}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-border mb-8 gap-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'users' ? 'border-purple-600 text-purple-600' : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          <Users className="w-4 h-4" /> Users Management ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'content' ? 'border-purple-600 text-purple-600' : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          <FileText className="w-4 h-4" /> Content Management ({postsList.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'reports' ? 'border-purple-600 text-purple-600' : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          <Flag className="w-4 h-4" /> Reports Moderation ({reportsList.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'analytics' ? 'border-purple-600 text-purple-600' : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> System Telemetry
        </button>
      </div>

      {/* 1. USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-brand-text-primary">Registered Accounts & Roles</h2>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-brand-text-tertiary absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search username, name, email..."
                className="w-full pl-10 pr-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-[11px] font-bold text-brand-text-tertiary uppercase tracking-wider">
                  <th className="pb-3 px-3">User</th>
                  <th className="pb-3 px-3">Email</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border-light text-xs">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-brand-text-primary">{u.fullName}</div>
                      <div className="text-[11px] text-brand-text-tertiary">@{u.username}</div>
                    </td>
                    <td className="py-3.5 px-3 text-brand-text-secondary">{u.email}</td>
                    <td className="py-3.5 px-3">
                      {u.role === 'ADMIN' ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          ADMIN
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={e => handleChangeRole(u.id, e.target.value)}
                          className="bg-brand-bg border border-brand-border rounded-lg px-2 py-1 text-xs outline-none focus:border-purple-600"
                        >
                          <option value="USER">USER</option>
                          <option value="AUTHOR">AUTHOR</option>
                          <option value="EDITOR">EDITOR</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                              u.isBanned ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}
                            title={u.isBanned ? 'Unban User' : 'Ban User'}
                          >
                            {u.isBanned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CONTENT MANAGEMENT */}
      {activeTab === 'content' && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brand-text-primary mb-6">Published Publications</h2>

          <div className="space-y-4">
            {postsList.map(post => (
              <div key={post.id} className="p-4 bg-brand-bg border border-brand-border rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      {post.status}
                    </span>
                    <span className="text-xs text-brand-text-tertiary">By {post.author?.fullName || 'Anonymous'}</span>
                  </div>
                  <h3 className="font-bold text-sm text-brand-text-primary mt-1">{post.title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigateTo(`/story/${post.slug || post.id}`)}
                    className="p-2 bg-brand-surface border border-brand-border hover:border-purple-600 rounded-lg text-xs"
                    title="View Post"
                  >
                    <Eye className="w-4 h-4 text-brand-text-secondary" />
                  </button>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg text-xs"
                    title="Remove Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REPORTS MODERATION */}
      {activeTab === 'reports' && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brand-text-primary mb-6">Content & Comment Moderation Flags</h2>

          {reportsList.length === 0 ? (
            <p className="text-xs text-brand-text-tertiary text-center py-8">No content or comment reports flagged for review.</p>
          ) : (
            <div className="space-y-4">
              {reportsList.map(r => (
                <div key={r.id} className="p-4 bg-brand-bg border border-brand-border rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        {r.reason}
                      </span>
                      <span className="text-xs text-brand-text-tertiary">Target: {r.targetType} ({r.targetId})</span>
                    </div>
                    <p className="text-xs text-brand-text-primary mt-1">{r.details || 'No additional details provided.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SYSTEM TELEMETRY */}
      {activeTab === 'analytics' && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brand-text-primary mb-4">Live System Health & Server Metrics</h2>
          <div className="space-y-3 text-xs text-brand-text-secondary font-mono">
            <p>Database Engine: PostgreSQL via Prisma ORM</p>
            <p>Authentication Flow: JWT with Refresh Tokens & Role-Based Guarding</p>
            <p>Status: {stats.systemHealth}</p>
            <p>Uptime: Optimal</p>
          </div>
        </div>
      )}

    </div>
  );
};

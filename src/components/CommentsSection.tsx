import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { CommentItem } from '../types';
import { MessageSquare, Send, CornerDownRight, Trash2, Flag, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

interface CommentsSectionProps {
  postId: string;
  postOwnerId: string;
  allowComments: boolean;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, postOwnerId, allowComments: initialAllowComments }) => {
  const { currentUser, navigateTo, showToast } = useApp();

  const [allowComments, setAllowComments] = useState(initialAllowComments);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDetails, setReportDetails] = useState('');

  const isPostOwner = currentUser?.id === postOwnerId;
  const isStaff = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.comments.getForPost(postId);
      setComments(res.data || []);
    } catch (e) {
      console.error('Failed to load comments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigateTo('/login');
      showToast('Please sign in to comment', 'warning');
      return;
    }

    if (!newComment.trim()) return;

    try {
      await api.comments.create(postId, newComment.trim());
      setNewComment('');
      showToast('Comment posted', 'success');
      fetchComments();
    } catch (err: any) {
      showToast(err.message || 'Failed to post comment', 'error');
    }
  };

  const handleAddReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!currentUser) {
      navigateTo('/login');
      showToast('Please sign in to reply', 'warning');
      return;
    }

    if (!replyContent.trim()) return;

    try {
      await api.comments.create(postId, replyContent.trim(), parentId);
      setReplyContent('');
      setReplyToId(null);
      showToast('Reply posted', 'success');
      fetchComments();
    } catch (err: any) {
      showToast(err.message || 'Failed to post reply', 'error');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.comments.delete(commentId);
      showToast('Comment deleted', 'info');
      fetchComments();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  const handleToggleComments = async () => {
    try {
      const res = await api.comments.toggleComments(postId);
      setAllowComments(res.data.allowComments);
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle comments', 'error');
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingCommentId) return;

    try {
      await api.comments.report(reportingCommentId, reportReason, reportDetails);
      showToast('Comment reported for moderation review', 'success');
      setReportModalOpen(false);
      setReportingCommentId(null);
      setReportDetails('');
    } catch (err: any) {
      showToast(err.message || 'Failed to report comment', 'error');
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-brand-border">
      
      {/* Header & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold font-display text-brand-text-primary flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-primary" /> Discussion & Comments ({comments.length})
        </h3>

        {(isPostOwner || currentUser?.role === 'ADMIN') && (
          <button
            onClick={handleToggleComments}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary transition-all"
          >
            {allowComments ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
            {allowComments ? 'Disable Comments' : 'Enable Comments'}
          </button>
        )}
      </div>

      {!allowComments ? (
        <div className="p-6 bg-brand-surface border border-brand-border rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-brand-text-tertiary mx-auto mb-2" />
          <p className="text-sm font-semibold text-brand-text-secondary">Comments are disabled for this post.</p>
        </div>
      ) : (
        <div>
          {/* Post Comment Input */}
          <form onSubmit={handleAddComment} className="mb-8">
            <div className="flex gap-3">
              <img
                src={currentUser?.avatar || 'https://picsum.photos/seed/guest/100/100'}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-brand-border shrink-0"
              />
              <div className="flex-1">
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder={currentUser ? "Share your research feedback or thoughts..." : "Sign in to join the conversation..."}
                  disabled={!currentUser}
                  className="w-full p-3 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl text-sm outline-none resize-none disabled:opacity-60"
                />
                {currentUser && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> Post Comment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Comment Tree */}
          {loading ? (
            <div className="py-8 text-center text-xs text-brand-text-secondary">Loading comments...</div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-brand-text-tertiary text-center py-6">No comments yet. Be the first to start the discussion.</p>
          ) : (
            <div className="space-y-6">
              {comments.map(c => (
                <div key={c.id} className="bg-brand-surface border border-brand-border rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.user?.avatarUrl || 'https://picsum.photos/seed/user/100/100'}
                        alt={c.user?.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold text-sm text-brand-text-primary">{c.user?.fullName}</span>
                        <span className="text-xs text-brand-text-tertiary ml-2">@{c.user?.username}</span>
                        <span className="text-[10px] text-brand-text-tertiary block">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setReportingCommentId(c.id); setReportModalOpen(true); }}
                        className="p-1 text-brand-text-tertiary hover:text-amber-500 rounded"
                        title="Report Comment"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      {(currentUser?.id === c.userId || isPostOwner || isStaff) && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-1 text-brand-text-tertiary hover:text-rose-500 rounded"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-brand-text-primary mt-3 whitespace-pre-line">{c.content}</p>

                  <button
                    onClick={() => setReplyToId(replyToId === c.id ? null : c.id)}
                    className="mt-3 text-xs font-semibold text-brand-primary flex items-center gap-1 hover:underline"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" /> Reply
                  </button>

                  {/* Reply Form */}
                  {replyToId === c.id && (
                    <form onSubmit={e => handleAddReply(e, c.id)} className="mt-3 pl-4 border-l-2 border-brand-primary">
                      <textarea
                        rows={2}
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full p-2.5 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl text-xs outline-none"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setReplyToId(null)}
                          className="px-3 py-1.5 text-xs text-brand-text-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded-xl"
                        >
                          Submit Reply
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Nested Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="mt-4 pl-6 space-y-3 border-l-2 border-brand-border-light">
                      {c.replies.map(r => (
                        <div key={r.id} className="pt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={r.user?.avatarUrl || 'https://picsum.photos/seed/user/100/100'} alt="Reply" className="w-6 h-6 rounded-full" />
                              <span className="font-bold text-xs text-brand-text-primary">{r.user?.fullName}</span>
                              <span className="text-[10px] text-brand-text-tertiary">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            {(currentUser?.id === r.userId || isPostOwner || isStaff) && (
                              <button onClick={() => handleDeleteComment(r.id)} className="text-brand-text-tertiary hover:text-rose-500">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-brand-text-primary mt-1">{r.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-brand-text-primary mb-4 flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-500" /> Report Comment
            </h4>
            <form onSubmit={submitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none"
                >
                  <option value="Spam">Spam</option>
                  <option value="Hate Speech">Hate Speech</option>
                  <option value="Harassment">Harassment</option>
                  <option value="False Information">False Information</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-secondary uppercase mb-1">Additional Details</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="Optional details for moderators..."
                  className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-brand-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

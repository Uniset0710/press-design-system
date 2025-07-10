import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface CommentSectionProps {
  itemId: string;
}

export default function CommentSection({ itemId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = async () => {
    const res = await fetch(`/api/comments/${itemId}`, {
      headers: session?.accessToken ? { 'Authorization': `Bearer ${session.accessToken}` } : {},
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = [];
    }
    setComments(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { 'Authorization': `Bearer ${session.accessToken}` } : {})
        },
        body: JSON.stringify({
          content: newComment,
          author: session?.user?.name || 'Anonymous'
        })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Add a comment..."
          rows={3}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
      <div className="space-y-4">
        {Array.isArray(comments) && comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded flex justify-between items-start">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="font-medium">{comment.author}</div>
                <div className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="mt-1">{comment.content}</p>
            </div>
            <button
              className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
              title="코멘트 삭제"
              onClick={async () => {
                if (!window.confirm('이 코멘트를 삭제할까요?')) return;
                await fetch(`/api/comments/${comment.id}`, {
                  method: 'DELETE',
                  headers: session?.accessToken ? { 'Authorization': `Bearer ${session.accessToken}` } : {},
                });
                fetchComments();
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 
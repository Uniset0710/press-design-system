import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

interface History {
  id: string;
  action: string;
  changes: string;
  author: string;
  createdAt: string;
}

interface HistorySectionProps {
  entityType: "checklist" | "tree";
  entityId: string;
}

export default function HistorySection({ entityType, entityId }: HistorySectionProps) {
  const { data: session } = useSession();
  const [history, setHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments/history/${entityType}/${entityId}`, {
        headers: session?.accessToken ? { 'Authorization': `Bearer ${session.accessToken}` } : {},
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = [];
      }
      setHistory(Array.isArray(data) ? data : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId, session]);

  const getActionText = (action: string) => {
    switch (action) {
      case 'create': return '생성';
      case 'update': return '수정';
      case 'delete': return '삭제';
      default: return action;
    }
  };

  const getMessage = (changes: string) => {
    try {
      const obj = JSON.parse(changes);
      if (obj.message) return obj.message;
      return JSON.stringify(obj, null, 2);
    } catch {
      return changes;
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">History</h3>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-2">
          {Array.isArray(history) && history.map(record => (
            <div key={record.id} className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between items-start">
                <div className="font-medium">{record.author}</div>
                <div className="text-sm text-gray-500">
                  {new Date(record.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="mt-1">
                <span className="font-medium">{getActionText(record.action)}</span>
                <div className="mt-1 text-sm bg-gray-100 p-2 rounded whitespace-pre-wrap">
                  {getMessage(record.changes)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
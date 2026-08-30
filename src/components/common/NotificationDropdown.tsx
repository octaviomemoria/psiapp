'use client';

import React, { useState } from 'react';
import { usePsi } from '@/lib/store/psi-context';
import {
  Bell,
  CheckCheck,
  ClipboardList,
  Heart,
  BookOpen,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export const NotificationDropdown: React.FC = () => {
  const {
    getCurrentUserNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = usePsi();

  const [isOpen, setIsOpen] = useState(false);
  const userNotifications = getCurrentUserNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'exercise_completed':
        return <ClipboardList className="w-4 h-4 text-emerald-600" />;
      case 'feedback_received':
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      case 'mood_checkin':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'diary_shared':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'appointment_reminder':
        return <Calendar className="w-4 h-4 text-sky-600" />;
      default:
        return <Bell className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-dropdown border border-slate-100 p-4 z-50 animate-scale-up space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-800 text-sm">Notificações</h4>
                {unreadNotificationsCount > 0 && (
                  <Badge variant="warning" size="sm">
                    {unreadNotificationsCount} nova(s)
                  </Badge>
                )}
              </div>
              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 space-y-1">
              {userNotifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Nenhuma notificação no momento.</p>
              ) : (
                userNotifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-3 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                      !notif.read ? 'bg-teal-50/60 font-medium' : 'hover:bg-slate-50 opacity-80'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeDate(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

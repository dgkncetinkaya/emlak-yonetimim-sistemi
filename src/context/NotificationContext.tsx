import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Müşteri Takibi Gerekli',
    message: 'Ahmet Yılmaz ile 3 gündür iletişim kurulmadı. Takip edilmesi öneriliyor.',
    time: '2 saat önce',
    isRead: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'error',
    title: 'Randevu İptali',
    message: 'Bugün saat 14:00\'daki randevu müşteri tarafından iptal edildi.',
    time: '4 saat önce',
    isRead: false,
    priority: 'high'
  },
  {
    id: '3',
    type: 'info',
    title: 'Yeni Müşteri Kaydı',
    message: 'Zeynep Kaya sisteme yeni müşteri olarak kaydedildi.',
    time: '6 saat önce',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '4',
    type: 'success',
    title: 'Satış Tamamlandı',
    message: 'Beşiktaş\'taki 3+1 daire başarıyla satıldı. Komisyon: ₺15.000',
    time: '1 gün önce',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '5',
    type: 'warning',
    title: 'Belge Eksikliği',
    message: 'Kadıköy\'deki emlak için tapu belgesi henüz yüklenmedi.',
    time: '1 gün önce',
    isRead: false,
    priority: 'medium'
  },
  {
    id: '6',
    type: 'info',
    title: 'Sistem Güncellemesi',
    message: 'Sistem bakımı yarın saat 02:00-04:00 arasında gerçekleştirilecek.',
    time: '2 gün önce',
    isRead: true,
    priority: 'low'
  }
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
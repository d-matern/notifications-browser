import express from 'express';
import cors from 'cors';
import webpush from 'web-push';

const app = express();
const port = 3005;

// ✅ Разрешаем CORS
app.use(cors({
  origin: 'http://localhost:3001', // или ['http://localhost:3001'] если несколько
  methods: ['GET', 'POST', 'PATCH'],
  credentials: true
}));

app.use(express.json());

// 🚨 ВСТАВЬ СЮДА СВОИ КЛЮЧИ
const publicKey = 'BPkJG4Z3IkUYXJriMRNgpvt4ae2mFuDEs6w5pzFuMBbMmyOm1ZXx5202mhERxLpUQESf4n7yl0PUeqEaJzoR7Yw'; // твой публичный ключ
const privateKey = 'gYHN6cMz90bFAvZdgDW8WYd06VI3y-zFRxSGwxEFeMw'; // твой приватный ключ

// Укажи свои VAPID ключи:
webpush.setVapidDetails(
    'mailto:denismatern@gmail.com',
    publicKey,
    privateKey
);

// 📥 Массив подписок
const subscriptions = new Map();

// 📥 Массив уведомлений
const notifications = [];

// Отдаем существующие уведомления
app.get('/api/notifications', (req, res) => {
  res.status(200).json({
    data: notifications.map(n => ({
      id: n.data.id,
      title: n.title,
      content: n.body,
      date: n.data.date,
      img: n.data.img,
      is_read: n.data.is_read,
    }))
  });
});

// Обновляем существующие уведомления
app.patch('/api/notifications/read', (req, res) => {
  const IDs = req.body;
  
  notifications.forEach(n => {
    if (IDs.includes(n.data.id)) {
      n.data.is_read = true;
    }
  });

  res.status(200).json({ success: true });
});

// Получение подписки от клиента
app.post('/api/save-subscription', (req, res) => {
  const { userId, subscription } = req.body;
  
  if (!userId || !subscription) {
    return res.status(400).json({ message: 'userId и subscription обязательны' });
  }
  // Добавляем, если такой еще нет
  const existing = subscriptions.get(userId);
  const isSame = existing && JSON.stringify(existing) === JSON.stringify(subscription);
  if (!isSame) {
    subscriptions.set(userId, subscription);
    console.log(`✅ Подписка обновлена для userId: ${userId}`);
  } else {
    console.log(`ℹ️ Подписка уже актуальна для userId: ${userId}`);
  }

  res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/api/create-notification', (req, res) => {
  console.log(req.body);
  
  const { userId } = req.body;
  const subscription = subscriptions.get(userId);

  const titles = ['🔥 Новость!', '🎉 Акция!', '📢 Объявление', '✅ Успех!', '💡 Идея!'];
  const messages = ['Проверь это!', 'Это может быть интересно.', 'Ты не поверишь...', 'Сработало!', 'Вот это да!'];
  const payload = {
    notification_id: Math.random().toString(36).substring(2), // генерируем ID
    notification_user_relation_id: Math.random().toString(36).substring(2), // генерируем ID
    title: titles[Math.floor(Math.random() * titles.length)],
    content: messages[Math.floor(Math.random() * messages.length)],
    image_url: '/favicon.png',
    is_viewed: false,
    viewed_at: null,
    created_at: new Date().toLocaleDateString(),
    url: 'http://localhost:3001/dashboard', // можно сюда добавить переход по клику
  };

  if (subscription) {
    webpush.sendNotification(subscription, JSON.stringify(payload))
      .then(() => {
        console.log(`✅ Уведомление отправлено для userId: ${userId}`);
        notifications.push(payload);
      })
      .catch(() => console.error(`❌ Ошибка отправки для ${userId}:`, err));
  } else {
    console.warn(`⚠️ Нет подписки для userId: ${userId}`);
  }
});

// Лог: пользователь кликнул по уведомлению
app.post('/api/notification-clicked', (req, res) => {  
  const { notificationId, viewedAt } = req.body;
  console.log(`🟢 Уведомление [${notificationId}] кликнуто в ${viewedAt}`);

  notifications.forEach(n => {
    if (n.notification_id === notificationId) {
      n.is_viewed = true;
      n.viewed_at = viewedAt;
    }
  });
  
  res.status(200).json({ success: true });
});

// Лог: пользователь закрыл уведомление
app.post('/api/notification-closed', (req, res) => {
  const { notificationId, viewedAt } = req.body;
  console.log(`🔴 Уведомление [${notificationId}] закрыто в ${viewedAt}`);

  notifications.forEach(n => {
    if (n.notification_id === notificationId) {
      n.is_viewed = true;
      n.viewed_at = viewedAt;
    }
  });
  
  res.status(200).json({ success: true });
});

// ✅ Запуск сервера на порту 3005
app.listen(port, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${port}`);
});

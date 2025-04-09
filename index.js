import express from 'express';
import cors from 'cors';
import webpush from 'web-push';

const app = express();
const port = 3005;

// ✅ Разрешаем CORS
app.use(cors({
  origin: 'http://localhost:3001', // или ['http://localhost:3001'] если несколько
  methods: ['GET', 'POST'],
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
const subscriptions = [];

// Получение подписки от клиента
app.post('/api/save-subscription', (req, res) => {
  const subscription = req.body;
  
  // Добавляем, если такой еще нет
  const exists = subscriptions.find(s => JSON.stringify(s) === JSON.stringify(subscription));
  if (!exists) {
    subscriptions.push(subscription);
    console.log('✅ Подписка добавлена. Всего:', subscriptions.length);
  }

  res.status(201).json({ message: 'Подписка сохранена' });
});

// 🚀 Пуш уведомления каждые 3 секунды
setInterval(() => {
  if (subscriptions.length === 0) return;

  const titles = ['🔥 Новость!', '🎉 Акция!', '📢 Объявление', '✅ Успех!', '💡 Идея!'];
  const messages = ['Проверь это!', 'Это может быть интересно.', 'Ты не поверишь...', 'Сработало!', 'Вот это да!'];

  const payload = JSON.stringify({
    title: titles[Math.floor(Math.random() * titles.length)],
    body: messages[Math.floor(Math.random() * messages.length)],
  });

  subscriptions.forEach((sub, i) => {
    webpush.sendNotification(sub, payload).catch(err => {
      console.error(`❌ Ошибка в подписке [${i}]:`, err.message);
    });
  });

  console.log('📤 Push отправлен всем подпискам');
}, 5000);

// ✅ Запуск сервера на порту 3005
app.listen(port, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${port}`);
});

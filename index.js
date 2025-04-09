import express from 'express';
import cors from 'cors';
import webpush from 'web-push';

const app = express();

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

// Получение подписки от клиента
app.post('/api/save-subscription', (req, res) => {
  const subscription = req.body;
  // Можно сохранить в базе или в памяти
  console.log('Подписка клиента:', subscription);
  res.status(200).json({ message: 'OK' });
});

// Отправка push уведомления
app.post('/api/send-push', async (req, res) => {
    const subscription = req.body.subscription;
    const payload = JSON.stringify({
        title: 'Новое уведомление',
        body: 'Контент из сервера',
    });

    try {
        await webpush.sendNotification(subscription, payload);
        res.sendStatus(200);
    } catch (error) {
        console.error('Ошибка при отправке push:', err);
        res.sendStatus(500);
    }
});

// ✅ Запуск сервера на порту 3005
app.listen(3005, () => {
    console.log('🚀 Сервер запущен на http://localhost:3005');
});

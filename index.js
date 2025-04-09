import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:you@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

app.post('/api/send-push', async (req, res) => {
  const subscription = req.body.subscription;
  const payload = JSON.stringify({
    title: 'Новое сообщение!',
    body: 'У вас новое уведомление.',
  });

  try {
    await webpush.sendNotification(subscription, payload);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
});

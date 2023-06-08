import webpush from 'web-push'
import express from 'express'
const router = express.Router()

router.get(`/vapidPublicKey`, (req, res) => {
    res.send(process.env.VAPID_PUBLIC_KEY);
  });

router.post(`/register`, (req, res) => {
    res.sendStatus(201);
  });

router.post(`/sendNotification`, (req, res) => {
    const subscription = req.body.subscription;
    const payload = req.body.payload;
    const options = {
      TTL: req.body.ttl,
    };

    setTimeout(() => {
        webpush
        .sendNotification(subscription, payload, options)
        .then(() => {
          res.sendStatus(201);
        })
        .catch((error) => {
          console.log(error);
          res.sendStatus(500);
        });
    }, req.body.delay * 1000);
  });

  export default router
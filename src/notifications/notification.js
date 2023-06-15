import webpush from 'web-push'
import express from 'express'
import transaction from '../db/transaction.js';
import dotenv from 'dotenv'
const router = express.Router()
const config = dotenv.config() 

const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT
};

function sendNotifications(subscriptions) {
  // Create the notification content.
  const notification = JSON.stringify({
    title: "Hello, Notifications!",
    options: {
      body: `ID: ${Math.floor(Math.random() * 100)}`
    }
  });
  // Customize how the push service should attempt to deliver the push message.
  // And provide authentication information.
  const options = {
    TTL: 10000,
    vapidDetails: vapidDetails
  };
  // Send a push message to each client specified in the subscriptions array.
  subscriptions.forEach(subscription => {
    const endpoint = subscription.endpoint;
    const id = endpoint.substring((endpoint.length - 8), endpoint.length);
    webpush.sendNotification(subscription, notification, options)
      .then(result => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Result: ${result.statusCode}`);
      })
      .catch(error => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Error: ${error} `);
      });
  });
}

router.get(`/vapidPublicKey`, (req, res) => {
    res.send(process.env.VAPID_PUBLIC_KEY);
  });

router.post(`/addSubscription`, async (req, res) => {
    const response = await transaction(`INSERT INTO subscriptions (endpoint, keys) VALUES ('${req.body.endpoint}', '${JSON.stringify(req.body.keys)}')`)
    console.log('REGISTRATION COMPLETE')    
    res.sendStatus(201);
  });

router.post(`/sendNotification`, async(req, res) => {
    console.log(`Notifying ${req.body.endpoint}`);
    const subscription = 
        await transaction(`SELECT endpoint, keys from subscriptions where endpoint='${req.body.endpoint}'`)
    sendNotifications(subscription.rows);
    res.sendStatus(200);
  });

  router.post('/removeSubscription', async (req, res) => {
    console.log(`Unsubscribing ${req.body.endpoint}`);
    const response = await transaction(`DELETE FROM subscriptions WHERE endpoint='${req.body.endpoint}'`)
    //   .remove({endpoint: request.body.endpoint})
    //   .write();
    res.sendStatus(200);
  });
  

  export default router
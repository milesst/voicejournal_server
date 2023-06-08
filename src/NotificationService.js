import webPush from 'web-push'
let subscriptions = [];
let pushInterval = 10;

webPush.setGCMAPIKey(process.env.GCM_API_KEY || null);

// Отправляем уведомление push-сервису. 
// Удаляем подписку из общего массива `subscriptions`,
// если push-сервис отвечает на ошибку или подписка отменена или истекла.
function sendNotification(endpoint) {
  webPush.sendNotification({
    endpoint: endpoint
  }).then(function() {
  }).catch(function() {
    subscriptions.splice(subscriptions.indexOf(endpoint), 1);
  });
}

// В реальных условиях приложение отправляет уведовление только в случае
// возникновения события.
// Чтобы имитировать его, сервер отправляет уведомление каждые `pushInterval` секунд
// каждому подписчику
setInterval(function() {
  subscriptions.forEach(sendNotification);
}, pushInterval * 1000);

function isSubscribed(endpoint) {
  return (subscriptions.indexOf(endpoint) >= 0);
}

module.exports = function(app, route) {
  app.post(route + 'register', function(req, res) {
    var endpoint = req.body.endpoint;
    if (!isSubscribed(endpoint)) {
      console.log('We invaded into mind ' + endpoint);
      subscriptions.push(endpoint);
    }
    res.type('js').send('{"success":true}');
  });

  // Unregister a subscription by removing it from the `subscriptions` array
  app.post(route + 'unregister', function(req, res) {
    var endpoint = req.body.endpoint;
    if (isSubscribed(endpoint)) {
      console.log('It was counterspell from ' + endpoint);
      subscriptions.splice(subscriptions.indexOf(endpoint), 1);
    }
    res.type('js').send('{"success":true}');
  });
};
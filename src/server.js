import express from 'express'
import router from './route/router.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
const app = express();
app.use(bodyParser.json())
app.use(cors());
import webpush from 'web-push'

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log(
    "You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
      "environment variables. You can use the following ones:"
  );
  console.log(webpush.generateVAPIDKeys());
  throw new Error();
}

webpush.setVapidDetails(
  "http://localhost:3001",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const config = dotenv.config() 

let controllerLogin

controllerLogin = (await import("./controller/login.js")).default

// const config = process.env;

app.use('/api', (req, res, next) => {
  if (!process.env.VJ_ENV === 'test') {
    const token =
      req.headers['authorization'].split(' ')[1];
  
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      req.user = decoded;
    } catch (err) {
      console.log(err)
      return res.status(401).send("Invalid Token");
    }
    return next();
  }
  next()
}, router)
app.use('/login', controllerLogin)

app.get('/', (req, res) => {
  res.send('Successful response.');
});

let serverPort = process.env.NODE_ENV === 'test' ? 3002 : 3000

app.listen(serverPort, () => console.log(`app is listening on port ${serverPort}.`));

export default app
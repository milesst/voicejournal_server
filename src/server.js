import express from 'express'
import router from './route/router.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
const app = express();
app.use(bodyParser.json())
app.use(cors());

const config = dotenv.config() 

let controllerLogin

if (process.env.VJ_ENV === 'test') {
  controllerLogin = (await import("./testController/login.js")).default
}
else {
  controllerLogin = (await import("./controller/login.js")).default
}

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

app.listen(3000, () => console.log('Example app is listening on port 3000.'));
// console.log(db.connect())

serviceWorker.register('service-worker.js')
import express from 'express'
import router from './route/router.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import controllerLogin from './controller/login.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
const app = express();
app.use(bodyParser.json())
app.use(cors());

const config = dotenv.config() 
// const config = process.env;

app.use('/api', (req, res, next) => {
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
  }, router)
app.use('/login', controllerLogin)

app.get('/', (req, res) => {
  res.send('Successful response.');
});

app.listen(3000, () => console.log('Example app is listening on port 3000.'));
// console.log(db.connect())

import db from '../db/connect.js'
import express from 'express'
import transaction from '../db/transaction.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
// import dot

const  getHash = async (password) => {const hash = await bcrypt.hash(password, 10); return hash}

const router = express.Router()
router.use(bodyParser.json())

router.post('', async (req, res) => {
    const response = await transaction(`select password_hash, user_id, role from lk_user where login='${req.body.username}'`)
    try {
      const userHash = response.rows[0].password_hash
      bcrypt.compare(req.body.password, userHash, function(err, result) {
          if (result) {
              // res.send("true")
              const token = jwt.sign(
                  { user_id: req.body.login },
                  process.env.TOKEN_KEY,
                  {
                    expiresIn: "2h",
                  }
                )
              res.json({accessToken: token, userId: response.rows[0].user_id, isAdmin: response.rows[0].role === 'admin'})  
          }
          else {
              res.json({answer: "INVALID PASSWORD"})
          }
      });
  }
  catch (e) {
    res.json({answer: 'ERROR'})
  }
})

const config = process.env;

export const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"] || req.headers['authorization'];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

export default router
import express from 'express'
import dotenv from 'dotenv'
const config = dotenv.config() 
import {default as documentController} from '../controller/documents.js'
import {default as notifController} from '../notifications/notification.js'
let controllerProf, controllerAdm, controllerLogin


controllerProf = (await import("../controller/professor.js")).default
controllerAdm = (await import("../controller/admin.js")).default

console.log('USING DEV SERVER IMPLEMENTATION')

const router = express.Router()
// router.use((req, res, next) => {
//     const token =
//       req.body.token || req.query.token || req.headers["x-access-token"];
  
//     if (!token) {
//       return res.status(403).send("A token is required for authentication");
//     }
//     try {
//       const decoded = jwt.verify(token, process.env.TOKEN_KEY);
//       req.user = decoded;
//     } catch (err) {
//       return res.status(401).send("Invalid Token");
//     }
//     return next();
//   })
router.use("/professor", controllerProf)
router.use('/admin', controllerAdm)
router.use('/documents', documentController)
router.use('/notification', notifController)

export default router
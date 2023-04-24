import express from 'express'
import controllerAdm from '../controller/admin.js'
import controllerProf from '../controller/professor.js'
import controllerLogin from '../controller/login.js'
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

export default router
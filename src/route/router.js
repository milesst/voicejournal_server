import express from 'express'
import dotenv from 'dotenv'
const config = dotenv.config() 

let controllerProf, controllerAdm, controllerLogin

if (process.env.VJ_ENV === 'test') {
    controllerProf = (await import("../testController/professor.js")).default
    controllerAdm = (await import("../testController/admin.js")).default

    console.log('USING TEST SERVER IMPLEMENTATION')
}
else {
    controllerProf = (await import("../controller/professor.js")).default
    controllerAdm = (await import("../controller/admin.js")).default

    console.log('USING DEV SERVER IMPLEMENTATION')
}

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
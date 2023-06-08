import db from '../db/connect.js'
import express from 'express'
import transaction from '../db/transaction.js'
import bcrypt from 'bcrypt'
let getUsers = async (req, res, next) => {
    const response = await transaction('SELECT * FROM public.lk_user')
    res.json(response.rows)
}
let getDisciplines = async (req, res, next) => {
    const response = await transaction('SELECT * FROM public.discipline')
    res.json(response.rows)
}
let getStudentGroups = async (req, res, next) => {
    const response = await transaction('SELECT * FROM public.student_group')
    res.json(response.rows)
} 
let getProfessors = async (req, res, next) => {
    const response = await transaction('SELECT * FROM public.lk_user')
    res.json(response.rows)
}

let addUser = async (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
    const response = transaction('INSERT INTO lk_user VALUES (' +
    `uuid_generate_v1(), '${req.body.login}', '${hash}', '${req.body.lastName}', '${req.body.firstName}', '${req.body.patronymic}', '${req.body.role}');`)
    res.send(response)
    })
    .catch(err => {
    console.log(err)
    })
}

let updateUser = async (req, res, next) => {
    const response = transaction(
        `UPDATE lk_user SET
        first_name='${req.body.first_name}',
        last_name='${req.body.last_name}',
        patronymic='${req.body.patronymic}',
        role='${req.body.role}'
        WHERE user_id='${req.body.user_id}'
        `
    )
    res.send(response)
}

let deleteUser = async (req, res) => {
    const response = transaction(`DELETE FROM lk_user WHERE user_id='${req.query.userId}'`)
}

const router = express.Router()
router.get('/disciplines', getDisciplines)
router.get('/student_groups', getStudentGroups)

router.get('/users', getUsers)
router.post('/addUser', addUser)
router.put('/updateUser', updateUser)
router.delete('/deleteUser', deleteUser)

export default router
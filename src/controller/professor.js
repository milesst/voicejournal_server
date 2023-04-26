import db from '../db/connect.js'
import express from 'express'
import transaction from '../db/transaction.js'

let getCurrentDisciplines = async(req, res, next) => {
    let client = await db.connect()
    const response = await client.query(`select * from public.prof_get_current_disciplines(\'${req.query.professorId}\');`)
    res.json(response.rows)
}
let getCurrentStudentGroups = async(req, res, next) => {
    let client = await db.connect()
    const response = await client.query(`select * from prof_get_current_student_groups(\'${req.query.professorId}\');`)
    res.json(response.rows)
}
let getCurrentDisciplinesWithGroups = async(req, res) => {
    // let client = await db.connect()
    // const response = await client.query(`select * from prof_get_current_disciplines_with_groups;`)
    const response = await transaction('select * from prof_get_current_disciplines_with_groups;')
    const filteredByUserId = response.rows.filter(obj => obj.user_id == req.query.userId)

    // let data = filteredByUserId.filter((value, index, array) => array.indexOf(value) === index)
    let preparedResponse = filteredByUserId.reduce((acc, obj) => {
        const key = obj['name'];
        const curGroup = acc[key] ?? [];
    
        return { ...acc, [key]: [...curGroup, obj] };
      }, {});
    const preparedRes = Object.keys(preparedResponse).map(obj => {return {discipline: obj, groups: preparedResponse[obj]
                                                                                                                        .map(obj => obj.group_number)
                                                                                                                        .filter((value, index, array) => array.indexOf(value) === index),
                                                                                            disciplineStart: preparedResponse[obj].map(obj => obj.discipline_start_date)
                                                                                            .filter((value, index, array) => array.indexOf(value) === index)[0],   
                                                                                            disciplineEnd: preparedResponse[obj].map(obj => obj.discipline_end_date)
                                                                                            .filter((value, index, array) => array.indexOf(value) === index)[0],                             
                                                                                                                            }}
                                                                                                                        
                                                                                                                            )
    res.json(preparedRes
        )

}
let getPersonalData = async(req, res, next) => {
    // let client = await db.connect()
    const response = await transaction(`select * from prof_get_personal_data;`)
    // const response2 = await transaction(`select * from prof_get_personal_data(\'${req.query.userId}\');`)
    
    res.json(response.rows.find(item => item.user_id))
}
let getTodayClasses = async(req, res) => {
    // let client = await db.connect()
    // const response = await client.query(`select * from prof_get_today_classes;`)
    const response = await transaction('select * from prof_get_today_classes;')
    
    res.json(response.rows.filter(item => item.user_id === req.query.userId))
    // req.end()
}
//todo getCurrentClass
//todo getScheduleForWeek for schedule page
let getScheduleForWeek = async(req, res) => {
    const response = await transaction('select * from prof_get_schedule_week;')
    res.json(response.rows.filter(item => item.user_id === req.query.userId))
}
//todo getComingClasses for homepage

const router = express.Router()
router.get("/disciplines", getCurrentDisciplines)
router.get('/disciplinesAndGroups', getCurrentDisciplinesWithGroups)
router.get('/studentGroups', getCurrentStudentGroups)
router.get('/personalData', getPersonalData)
router.get('/todayClasses', getTodayClasses)
router.get('/scheduleWeek', getScheduleForWeek)

export default router
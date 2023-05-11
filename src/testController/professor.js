import db from '../db/connect.js'
import express from 'express'
import transaction from '../db/transaction.js'

let getCurrentDisciplines = async(req, res, next) => {
    res.json([
        {
            discipline: 'Дискретная математика',
            id: '1111',
            groups: [
                {group_id: '1112',
            group_number: '09-951'}
            ]
        }
    ])
}

let getCurrentStudentGroups = async(req, res, next) => {
    let client = await db.connect()
    const response = await client.query(`select * from prof_get_current_student_groups(\'${req.query.professorId}\');`)
    res.json(response.rows)
}

let getCurrentDisciplinesWithGroups = async(req, res) => {
    res.json([
        {
            discipline: 'Дискретная математика',
            id: '1111',
            groups: [
                {group_id: '1112',
            group_number: '09-951'}
            ],
            disciplineStart: '20230-10-10T00:00:00',
            disciplineEnd: '2023-12-12T00:00:00'
        }
    ])

}

let getPersonalData = async(req, res, next) => {
    const response = await transaction(`select * from prof_get_personal_data;`)
    
    res.json(response.rows.find(item => item.user_id))
}

let getTodayClasses = async(req, res) => {
    const response = await transaction('select * from prof_get_today_classes;')
    
    res.json(response.rows.filter(item => item.user_id === req.query.userId))
}

let getDeadlineAssignments = async(req, res) => {
    const response = await transaction('select * from prof_get_deadline_assignments;')
    
    res.json(response.rows.filter(item => item.user_id === req.query.userId))
}

let getClassScheduleInfo = async(req, res) => {
    const response = await transaction('select * from prof_get_class_schedule;')

    res.json(response.rows.filter(item => item.schedule_id === req.query.scheduleId)[0])
}

let getCurrentClass = async(req, res) => {
    res.json(
        [{
            scheduleId: '123',
            userId: '11111',
            name: 'Дискретная математика',
            start_time: '2023-05-11T18:30:00',
            group_number: '09-951',
            groupId: '1111',

        }]
    )
}

let getGroupStudents = async(req, res) => {
    const response = await transaction('select * from prof_get_group_students')
    res.json(response.rows.filter(item => item.group_id === req.query.groupId))
}

let getAssignmentsForClass = async(req, res) => {
    const response = await transaction(`select * from prof_get_assignments_for_class('${req.query.scheduleId}', '${req.query.userId}')`)
    if (response)
        res.json(response.rows)
    else 
        res.status(500)
}

let getScheduleForWeek = async(req, res) => {
    const response = await transaction('select * from prof_get_schedule_week;')
    res.json(response.rows.filter(item => item.user_id === req.query.userId))
}
//todo getComingClasses for homepage

let postNewAssignment = async(req, res) => {
    const statement = 'insert into assignments(assignment_id, discipline_id, group_id, start_date, deadline, name, description) VALUES' +
    `(uuid_generate_v1(), '${req.body.disciplineId}', '${req.body.groupId}', '${req.body.startDate}', '${req.body.deadline}', '${req.body.name}', '${req.body.description}');`
    const response = await transaction(statement)
    res.json(response)
}

let postCompletedClass = async(req, res) => {
    const statement = 'insert into completed_class(class_id, schedule_id, comment, date, end_date) VALUES' +
    `(uuid_generate_v1(), '${req.body.scheduleId}', '${req.body.comment}', '${req.body.date}', '${req.body.endDate}');`
    const response = await transaction(statement)
    res.json(response)
}

const router = express.Router()
router.get("/disciplines", getCurrentDisciplines)
router.get('/disciplinesAndGroups', getCurrentDisciplinesWithGroups)
router.get('/studentGroups', getCurrentStudentGroups)
router.get('/personalData', getPersonalData)
router.get('/todayClasses', getTodayClasses)
router.get('/deadlineAssignments', getDeadlineAssignments)
router.get('/scheduleWeek', getScheduleForWeek)
router.get('/classScheduleInfo', getClassScheduleInfo)
router.get('/currentClass', getCurrentClass)
router.get('/assignmentsForClass', getAssignmentsForClass)
router.get('/groupStudents', getGroupStudents)

router.post('/newAssignment', postNewAssignment)
router.post('/completedClass', postCompletedClass)

router.use((req, res) => { console.log(res.body) })

export default router
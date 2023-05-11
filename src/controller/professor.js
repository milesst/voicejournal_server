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
    const response = await transaction('select * from prof_get_current_disciplines_with_groups;')
    const filteredByUserId = response.rows.filter(obj => obj.user_id == req.query.userId)

    let preparedResponse = filteredByUserId.reduce((acc, obj) => {
        const key = obj['name'];
        const curGroup = acc[key] ?? [];
    
        return { ...acc, [key]: [...curGroup, obj] };
      }, {});

    
    const preparedRes = Object.keys(preparedResponse).map(obj => {      const groups = preparedResponse[obj]
                                                                                            .map(obj => {return {group_number: obj.group_number, group_id: obj.group_id}})
                                                                        const preparedGroups = [
                                                                            ...new Map(groups.map((item) => [item["group_id"], item])).values(),
                                                                        ];
                                                                        return {discipline: obj, 
                                                                        discipline_id: preparedResponse[obj].map(obj => obj.discipline_id)[0], 
                                                                        groups: preparedGroups,
                                                                        // groups: preparedResponse[obj]
                                                                        //                                                 .map(obj => {return {group_number: obj.group_number, group_id: obj.group_id}})
                                                                                                                        // .filter((value, index, array) => array.indexOf(value) === index),
                                                                                                                        
                                                                        disciplineStart: preparedResponse[obj].map(obj => obj.discipline_start_date)
                                                                                            .filter((value, index, array) => array.indexOf(value) === index)[0],   
                                                                        disciplineEnd: preparedResponse[obj].map(obj => obj.discipline_end_date)
                                                                                            .filter((value, index, array) => array.indexOf(value) === index)[0],                             
                                                                                                                            }}
                                                                                                                        
                                                                                                                            )
    console.log(preparedRes)
    res.json(preparedRes)

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
    const response = await transaction('select * from test_get_current_class')
    res.json(response.rows.filter(item => item.user_id === req.query.userId))
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

router.use((req, res) => { console.log(res.body) })

export default router
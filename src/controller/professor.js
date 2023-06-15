import db from '../db/connect.js'
import express from 'express'
import transaction from '../db/transaction.js'

let getCurrentDisciplines = async(req, res, next) => {
    const response = await transaction(`select * from public.prof_get_current_disciplines(\'${req.query.professorId}\');`)
    res.json(response.rows)
}

let getCurrentStudentGroups = async(req, res, next) => {
    const response = await transaction(`select * from prof_get_current_student_groups(\'${req.query.professorId}\');`)
    res.json(response.rows)
}

let getDataForNewAssignmentForm = async(req, res, next) => {
    const response = await transaction(`select * from prof_get_current_disciplines_with_groups(\'${req.query.userId}\');`)
    res.json(response.rows)
}

let getFullDisciplineInfo = async(req, res, next) => {
    const response = await transaction(`select * from prof_get_full_discipline_info;`)
    const filteredByUserId = response.rows.filter(obj => obj.user_id == req.query.userId)

    let preparedResponse = filteredByUserId.reduce((acc, obj) => {
        const key = obj['discipline_name'];
        const curGroup = acc[key] ?? [];
    
        return { ...acc, [key]: [...curGroup, obj] };
      }, {});

    
    const preparedRes = Object.keys(preparedResponse).map(obj => {      
                                                                        const groups = preparedResponse[obj]
                                                                                            .map(obj => {return {group_number: obj.group_number, group_id: obj.group_id}})
                                                                        const preparedGroups = [
                                                                            ...new Map(groups.map((item) => [item["group_id"], item])).values(),
                                                                        ];

                                                                        const assignments = preparedResponse[obj].map(obj => {return {assignmentId: obj.assignment_id, assignmentName: obj.assignment_name, deadline: obj.deadline}})
                                                                        const preparedAssignments = [
                                                                            ...new Map(assignments.map((item) => [item["assignmentId"], item])).values(),
                                                                        ].filter(item => new Date(item.deadline) >= new Date() );
                                                                        return {discipline: obj, 
                                                                        discipline_id: preparedResponse[obj].map(obj => obj.discipline_id)[0], 
                                                                        groups: preparedGroups,
                                                                        assignments: preparedAssignments,
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


let getCurrentDisciplinesWithGroups = async(req, res) => {
    const response = await transaction('select * from prof_get_current_disciplines_with_groups;')
    const filteredByUserId = response.rows.filter(obj => obj.user_id == req.query.userId)

    let preparedResponse = filteredByUserId.reduce((acc, obj) => {
        const key = obj['discipline_name'];
        const curGroup = acc[key] ?? [];
    
        return { ...acc, [key]: [...curGroup, obj] };
      }, {});

    
    const preparedRes = Object.keys(preparedResponse).map(obj => {      
                                                                        const groups = preparedResponse[obj]
                                                                                            .map(obj => {return {group_number: obj.group_number, group_id: obj.group_id}})
                                                                        const preparedGroups = [
                                                                            ...new Map(groups.map((item) => [item["group_id"], item])).values(),
                                                                        ];

                                                                        const assignments = preparedResponse[obj].map(obj => {return {assignmentId: obj.assignment_id, assignmentName: obj.assignment_name, deadline: obj.deadline}})
                                                                        const preparedAssignments = [
                                                                            ...new Map(assignments.map((item) => [item["assignmentId"], item])).values(),
                                                                        ].filter(item => new Date(item.deadline) >= new Date() );
                                                                        return {discipline: obj, 
                                                                        discipline_id: preparedResponse[obj].map(obj => obj.discipline_id)[0], 
                                                                        groups: preparedGroups,
                                                                        assignments: preparedAssignments,
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
    
    res.json(response.rows.find(item => item.user_id === req.query.userId))
}

let getTodayClasses = async(req, res) => {
    const response = await transaction('select * from prof_get_today_classes;')
    // const response = await transaction('select * from test_get_today_classes;')
    let preparedResponse = response.rows.filter(item => item.user_id === req.query.userId)
    if (req.query.groupId) {
        preparedResponse = response.rows.filter(tclass => tclass.group_id === req.query.groupId)
    }

    res.json(preparedResponse)
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
    const response = await transaction('select * from prof_get_assignments;')
    const filteredByUserId = response.rows.filter(item => item.professor_id === req.query.userId && item.discipline_id === req.query.disciplineId && item.group_id === req.query.groupId)
    let preparedResponse = filteredByUserId.reduce((acc, obj) => {
        const key = obj['discipline_name'];
        const curGroup = acc[key] ?? [];

        return { ...acc, [key]: [...curGroup, obj] };
    }, {});
    const mappedResponse = Object.keys(preparedResponse).map(item => {
        return {
        assignment_id: preparedResponse[item][0].assignment_id,
        name: preparedResponse[item][0].name,
        description: preparedResponse[item][0].description,
        discipline_id: preparedResponse[item][0].discipline_id,
        discipline_name: preparedResponse[item][0].discipline_name,
        start_date: preparedResponse[item][0].start_date,
        deadline: preparedResponse[item][0].deadline,
        group_id: preparedResponse[item][0].group_id,
        group_number: preparedResponse[item][0].group_number,
        completedAssignments: preparedResponse[item].map(assignment => {return {firstName: assignment.first_name, lastName: assignment.last_name, 
            completionDate: assignment.completion_date, grade: assignment.grade, comment: assignment.comment}}).filter(assignment => assignment.completionDate)
    }})  

    if (mappedResponse) {
        res.json(mappedResponse)
        console.log()
    }
    else 
        res.status(500)
}

let getScheduleForWeek = async(req, res) => {
    const response = await transaction('select * from prof_get_schedule_week;')
    res.json(response.rows.filter(item => item.user_id === req.query.userId))
}
//todo getComingClasses for homepage

let postNewAssignment = async(req, res) => {
    const desc = req.body.comment ? ', description' : null
    const statement = `insert into assignments(assignment_id, discipline_id, professor_id, group_id, start_date, deadline, name${desc || ''}) VALUES` +
    `(uuid_generate_v1(), '${req.body.disciplineId}', '${req.body.professorId}', '${req.body.groupId}', '${req.body.startDate}', '${req.body.deadline}', '${req.body.name}' ${desc ? ', \'' + req.body.description + '\'' : ''});`
    const response = await transaction(statement)
    res.json(response)
}

let postCompletedClass = async(req, res) => {
    const statement = 'insert into completed_class(class_id, schedule_id, comment, date) VALUES' +
    `(uuid_generate_v1(), '${req.body.scheduleId}', '${req.body.comment}', '${req.body.date}') returning class_id;`
    const response = await transaction(statement)
    for (let student of req.body.students) {
        const responseAttendance = await transaction(`insert into class_attendance(class_attendance_id, student_id, completed_class_id, attended_class) values (uuid_generate_v1(), '${student.student_id}', '${response.rows[0].class_id}', '${!student.absent}')`)
    }
    res.json(response)
}

let postCompletedAssignment = async(req, res) => {
    const comment = req.body.comment ? ' comment, ' : null
    const statement = `insert into completed_assignment(completed_assignment_id, assignment_id, student_id, grade,${comment || ''} completion_date) VALUES` +
    `(uuid_generate_v1(), '${req.body.assignmentId}', '${req.body.studentId}', '${req.body.grade}', ${comment ? ' \'' + req.body.comment + '\', ' : ''} '${req.body.completionDate}');`
    const response = await transaction(statement)
    res.json(response)
}

let updateCompletedAssignment = async(req, res) => {
    const statement = `update completed_assignment set
    ${req.body.grade ? `grade = '${req.body.grade}', ` : ''}
    ${req.body.comment ? `comment = '${req.body.comment}', ` : ''}
    ${req.body.completionDate ? `completion_date = '${req.body.completionDate}'` : ''}
    where 
    completed_assignment_id = '${req.body.completionId}'
    `
    const response = await transaction(statement)
    res.json(response)
}

let getAssignments = async(req,res) => {
    const response = await transaction('select * from prof_get_assignments;')
    const filteredByUserId = response.rows.filter(item => item.professor_id === req.query.userId)
    let preparedResponse = filteredByUserId.reduce((acc, obj) => {
        const key = obj['name'];
        const curGroup = acc[key] ?? [];
    
        return { ...acc, [key]: [...curGroup, obj] };
      }, {});
    const mappedResponse = Object.keys(preparedResponse).map(item => {
        return {
        assignmentId: preparedResponse[item][0].assignment_id,
        assignmentName: preparedResponse[item][0].name,
        description: preparedResponse[item][0].description,
        disciplineId: preparedResponse[item][0].discipline_id,
        disciplineName: preparedResponse[item][0].discipline_name,
        startDate: preparedResponse[item][0].start_date,
        deadline: preparedResponse[item][0].deadline,
        groupId: preparedResponse[item][0].group_id,
        groupNumber: preparedResponse[item][0].group_number,
        completedAssignments: preparedResponse[item].map(assignment => {return {firstName: assignment.first_name, lastName: assignment.last_name, 
            completionDate: assignment.completion_date, grade: assignment.grade, comment: assignment.comment}}).filter(assignment => assignment.completionDate)
    }})  

    res.json(mappedResponse)
}

let getAssignmentById = async(req,res) => {
    const response = await transaction('select * from prof_get_assignments;')
    const filteredByUserId = response.rows.filter(item => item.assignment_id === req.query.assignmentId)
    let preparedResponse = filteredByUserId.reduce((acc, obj) => {
        const key = obj['name'];
        const curGroup = acc[key] ?? [];
    
        return { ...acc, [key]: [...curGroup, obj] };
      }, {});
    const mappedResponse = Object.keys(preparedResponse).map(item => {
        return {
        assignmentId: preparedResponse[item][0].assignment_id,
        assignmentName: preparedResponse[item][0].name,
        description: preparedResponse[item][0].description,
        disciplineId: preparedResponse[item][0].discipline_id,
        disciplineName: preparedResponse[item][0].discipline_name,
        startDate: preparedResponse[item][0].start_date,
        deadline: preparedResponse[item][0].deadline,
        groupId: preparedResponse[item][0].group_id,
        groupNumber: preparedResponse[item][0].group_number,
        completedAssignments: preparedResponse[item].map(assignment => {return {studentId: assignment.student_id, firstName: assignment.first_name, lastName: assignment.last_name, patronymic: assignment.patronymic,
            completionDate: assignment.completion_date, grade: assignment.grade, comment: assignment.comment, completionId: assignment.completed_assignment_id}})
    }})[0]  

    res.json(mappedResponse)
}

let getCompletedClasses = async(req, res) => {
   const response = await transaction('select * from prof_get_completed_classes;')
   let filtered = response.rows.filter(item => item.user_id=req.query.userId)
   if (req.query.groupId)
    filtered = filtered.filter(item => item.group_id === req.query.groupId)
   if (req.query.disciplineId)
    filtered = filtered.filter(item => item.discipline_id === req.query.disciplineId) 
   console.log(req.query.disciplineId + ' ' + req.query.groupId) 
   res.json(filtered)
}

let getAssignmentsForGroup = async (req, res) => {
    const response = await transaction('select * from prof_get_assignments;')
    const filteredByUserId = response.rows.filter(item => item.professor_id === req.query.userId && item.group_id === req.query.groupId)
    let preparedResponse = filteredByUserId.reduce((acc, obj) => {
        const key = obj['name'];
        const curGroup = acc[key] ?? [];
    
        return { ...acc, [key]: [...curGroup, obj] };
      }, {});
    const mappedResponse = Object.keys(preparedResponse).map(item => {
        return {
        assignmentId: preparedResponse[item][0].assignment_id,
        assignmentName: preparedResponse[item][0].name,
        description: preparedResponse[item][0].description,
        disciplineId: preparedResponse[item][0].discipline_id,
        disciplineName: preparedResponse[item][0].discipline_name,
        startDate: preparedResponse[item][0].start_date,
        deadline: preparedResponse[item][0].deadline,
        groupId: preparedResponse[item][0].group_id,
        groupNumber: preparedResponse[item][0].group_number,
        completedAssignments: preparedResponse[item].map(assignment => {return {firstName: assignment.first_name, lastName: assignment.last_name, 
            completionDate: assignment.completion_date, grade: assignment.grade, comment: assignment.comment}}).filter(assignment => assignment.completionDate)
    }})  

    res.json(mappedResponse)
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
router.get('/assignmentsForGroup', getAssignmentsForGroup)
router.get('/groupStudents', getGroupStudents)
router.get('/assignments', getAssignments)
router.get('/assignment', getAssignmentById)
router.get('/completedClasses', getCompletedClasses)
router.get('/newAssignmentFormData', getDataForNewAssignmentForm)
router.get('/disciplineInfo', getFullDisciplineInfo)

router.post('/newAssignment', postNewAssignment)
router.post('/completedClass', postCompletedClass)
router.post('/completedAssignment', postCompletedAssignment)

router.put('/completedAssignment', updateCompletedAssignment)

router.use((req, res) => { console.log(res.body) })

export default router
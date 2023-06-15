import * as fs from "fs";
// import { Document, Packer, Paragraph, TextRun } from "docx";
import pkg from 'docx';
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType  } = pkg;
import express from 'express'
import {Blob} from 'buffer';
import transaction from '../db/transaction.js'
import path from "path";

let createDocument = (studentData, reportData) => {
    const styles = {
            default: {
            },
            paragraphStyles: [
                {
                    id: "default",
                    name: "default",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        size: 28,
                    },
                    paragraph: {
                        size: 28,
                    },
                },
            ]
    }
    const doc = new Document({
        styles,
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({text: 'Ведомость', alignment: AlignmentType.CENTER,}),
                    new Paragraph('Дисциплина: ' + reportData.disciplineName),
                    new Paragraph('Группа: ' + reportData.groupNumber),
                    new Table({
                        rows: [new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph('Студент')],  
                                    width: {
                                        size: 70,
                                        type: WidthType.PERCENTAGE,
                                    },
                                }),
                                new TableCell({
                                    children: [new Paragraph('Балл')],
                                    width: {
                                        size: 30,
                                        type: WidthType.PERCENTAGE,
                                    },})
                            ],
                            
                        }),
                        ...Object.keys(studentData).map(item => new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph(studentData[item].fullName)],  
                                    width: {
                                        size: 70,
                                        type: WidthType.PERCENTAGE,
                                    },
                                }),
                                new TableCell({
                                    children: [new Paragraph(studentData[item].fullGrade.toString())],
                                    width: {
                                        size: 30,
                                        type: WidthType.PERCENTAGE,
                                    },})
                            ],
                            
                        }))],
                        
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        }
                    })
                ],
            },
            
        ],
    });
    return doc
}

let generateDocument = async (req, res) => {
    const response = await transaction('select * from prof_get_semester_report;')
    const students = (await transaction('select * from prof_get_group_students;'))

    const filteredStudents = students.rows.filter(item => item.group_id === req.body.group)
    const filtered = response.rows.filter(item => item.discipline_id === req.body.id && item.group_id === req.body.group)
    console.log(filtered)
   
    const studentData = filteredStudents.reduce((result, student) => {
        const data = {fullName: student.last_name + ' ' + student.first_name + ' ' + (student.patronymic !== 'undefined' && student.patronymic ? student.patronymic : ''), fullGrade: 0}
        return {
        ...result, 
        [student.student_id]: data
        }
    }, {})

    const reportData = {
        disciplineName: req.body.name,
        groupNumber: filteredStudents[0].group_number
    }

    for (let assignment of filtered) {
        studentData[assignment.student_id].fullGrade += assignment.grade
    }

    const doc = createDocument(studentData, reportData)

    Packer.toBuffer(doc).then((buffer) => {
        const fileName = `${req.body.docType}_${req.body.userId}_${new Date().getTime()}.docx`
        fs.writeFileSync(`./user_files/${fileName}`, buffer);

        const statement = `insert into document(id, doc_type, file_path, user_id, creation_date, group_id, discipline_id) values (uuid_generate_v1(), '${req.body.docType}', '${path.resolve(`./user_files/${fileName}`)}', '${req.body.userId}', '${new Date().toJSON()}', '${req.body.group}', '${req.body.id}');`
        transaction(statement).then(() => {
            console.log('fefwe')
        })
        .catch((e) => {
            console.log(e)
        })

    })

    let currentPath = process.cwd();
    res.sendFile(currentPath + `/doc.docx`)
}

let getDocumentList = async (req, res) => {
    const response = await transaction('select * from prof_get_documents;')
    
    res.json(response.rows.filter(item => item.user_id === req.query.userId))
}

let getDocument = async (req, res) =>  {
    const response = await transaction('select * from prof_get_document;')
    const doc = response.rows.filter(item => item.id === req.query.docId)[0].file_path
    let currentPath = process.cwd();
    res.sendFile(doc)
    
    // res.sendFile(currentPath + "/My Document.docx")
}


const router = express.Router()
router.post('/generate', generateDocument)

router.get('/documentList', getDocumentList)
router.get('/downloadDocument', getDocument)

router.use((req, res) => { console.log(res.body) })
export default router
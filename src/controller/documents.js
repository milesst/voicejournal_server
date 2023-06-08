import * as fs from "fs";
// import { Document, Packer, Paragraph, TextRun } from "docx";
import pkg from 'docx';
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType  } = pkg;
import express from 'express'
import {Blob} from 'buffer';
import transaction from '../db/transaction.js'

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

    const filteredStudents = students.rows.filter(item => item.group_id === req.body.group.group_id)
    const filtered = response.rows.filter(item => item.discipline_id === req.body.id && item.group_id === req.body.group.group_id)
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
        groupNumber: req.body.group.group_number
    }

    for (let assignment of filtered) {
        studentData[assignment.student_id].fullGrade += assignment.grade
    }

    Packer.toBuffer(createDocument(studentData, reportData)).then((buffer) => {
        // fs.writeFileSync(`${req.body.docType}_${reportData[disciplineName]}_${reportData[groupNumber]}.docx`, buffer);
        fs.writeFileSync(`doc.docx`, buffer);
        transaction(`insert into document(id, doc_type, doc, user_id) values (uuid_generate_v1(), '${req.body.docType}', '${buffer.join('')}', '${req.body.userId}');`).then(() => {
            console.log('fefwe')
        })
        .catch((e) => {
            console.log(e)
        })

    });
    let currentPath = process.cwd();
    res.sendFile(currentPath + `/doc.docx`)
}

let getDocumentList = async (req, res) => {
    const response = await transaction('select * from prof_get_documents;')
    
    res.json(response.rows.filter(item => item.user_id === req.query.userId))
}

let getDocument = async (req, res) =>  {
    const response = await transaction('select * from prof_get_document;')
    const doc = response.rows.filter(item => item.id === req.query.docId)[0].doc
    // fs.writeFileSync("My Document2.docx", doc);
    // Packer.toBuffer([doc.buffer]).then((buffer) => {
    //     fs.writeFileSync("My Document2.docx", buffer);
    // });
    fs.writeFileSync("My Document2.docx", doc);
    let currentPath = process.cwd();
    console.log({doc})
    // res.sendFile(currentPath + "/My Document2.docx")
    // const blob = new Blob([doc.buffer])
    res.send(doc.buffer)
    
    // res.sendFile(currentPath + "/My Document.docx")
}


const router = express.Router()
router.post('/generate', generateDocument)

router.get('/documentList', getDocumentList)
router.get('/downloadDocument', getDocument)

router.use((req, res) => { console.log(res.body) })
export default router
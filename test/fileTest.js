import dotenv from 'dotenv'
const config = dotenv.config() 

process.env.NODE_ENV = 'test';
process.env.VJ_ENV = 'test'

import chai from 'chai';
import chaiFiles from 'chai-files'

import app from '../src/server.js'
import chaiHttp from 'chai-http';
let should = chai.should();

chai.use(chaiFiles);
chai.use(chaiHttp);

var expect = chai.expect;
var file = chaiFiles.file;
var dir = chaiFiles.dir;

describe('Document creation', () => {
    describe('/POST a document generation request', () => {
        it('it should have a valid DOCX document', (done) => {
            const docData = {
                docType: 'ved',
                id: '"6370958b-402d-4342-9a7f-0cce51a8ed21',
                name: 'Дискретная математика',
                group: "9050e823-1a3c-4f60-8120-767d1c8db227",
                semester: 'current',
                userId: '9548e9e2-e06c-11ed-b4ba-50ebf6c2246c',
            }
          chai.request(app)
              .post('/api/documents/generate')
              .send(docData)
              .end((err, res) => {
                expect(file('doc.docx')).to.exist;
                done();
              });
        });
    });
  });
import dotenv from 'dotenv'
const config = dotenv.config() 

process.env.NODE_ENV = 'test';
process.env.VJ_ENV = 'test'

//Require the dev-dependencies
import chai from 'chai';
import app from '../src/server.js'
import chaiHttp from 'chai-http';
let should = chai.should();

chai.use(chaiHttp);
describe('Answer /POST call', () => {
  describe('/POST a new assignment', () => {
      it('it should add a new assignment to the DB', (done) => {
        const start = Date.now();
        done();
      });
  });

});
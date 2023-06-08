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
describe('Answer from server', () => {
  describe('/GET', () => {
      it('it should answer within 5 seconds', (done) => {
        const start = Date.now();
        chai.request(app)
            .get('/')
            .end((err, res) => {
                  const end = Date.now()
                  const answerTime = end - start
                  answerTime.should.be.below(3000)
              done();
            });
      });
  });

});
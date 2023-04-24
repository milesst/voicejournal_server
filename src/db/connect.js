import pg from 'pg'
import config from '../config/base-config.js'
const {Pool} = pg

export default new Pool(config.db)
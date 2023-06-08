import db from './connect.js'
export default async queries => {
    let client
    try {
    try {
        client = await db.connect()
    }
    catch (e) {
        console.log('cant connect to db')
    }
    try {
        await client.query('BEGIN')
        let results = await client.query(queries)
        await client.query('COMMIT')
        return results
    } catch (e) {
        await client.query('ROLLBACK')
        console.log(e)
    }
    } catch (e) {
        console.log(e)
    } finally {
        if (client) client.release()
    }
}
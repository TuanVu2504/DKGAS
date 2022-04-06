import  { Router } from 'express'
import { auth } from '../../../auth'
import { settings } from '../../../app.settings'
import { SQLServer } from '../../../toolts'

const router = Router()

router.route('/')
  .post(async (req, res, next) => {
    const { username, password } = req.body
    if(!username || !password) return next({ status: 400, message: "Bad username or password" });
    try {
      // check username password
      const userrecord = await SQLServer.Table("Login")
                              .select({ filter: { operator: "AND", values: [{ "name": username }, { Pass: password }] }})
                              .then( res => res.recordset )
      // .runQuery(`SELECT * FROM ${SQLServer.Tables.Login} WHERE name='${username}' AND Pass='${password}'`)
      if(userrecord.length == 0) return next({ status: 400, message:"Incorrect username or password !!!" })
      const signed = auth.sign(username)
      res.cookie(settings.cookie.name, signed, { maxAge: settings.cookie.duration, httpOnly: true })
      res.status(200).json({ name: username })
    } catch(err){
      console.log(err)
      res.status(500).end()
    }
  })

export default router
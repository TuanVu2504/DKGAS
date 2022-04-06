import express from 'express'
import api from './api'

import authentication from './api/authentication'
import logger from './api/log'
import { settings } from '../app.settings'
import { authenMiddleware, auth, getTokenFromHeaders } from '../auth'


const router  = express();
router.use('/api', logger, authenMiddleware.required, api)
router.use('/authentication', authentication )

router.use('/privateAssets', (req, res, next) => {
  const token = getTokenFromHeaders(req)
  if(!token || auth.decodeCookie(token).exp*1000 - new Date().getTime() < 0) {
    return res.redirect('/login')
  }
  next()
})
router.use('/privateAssets', express.static(settings.appPath.privateAssets))

router.get('/logout', (req, res) => {  
  res.cookie(settings.cookie.name, null, {expires: new Date(0) }).end()
}) 
router.get('/verifycookie', authenMiddleware.required, (req, res) => { 
  const user = req.currentUser!
  res.status(200).json({ name: user.Username })
})

export default router;
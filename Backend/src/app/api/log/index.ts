import { Router } from 'express'

const router = Router()

router.use('/', (req,res,next) => {
  const from    = req.headers.from!
  const method  = req.method
  const origin  = req.headers.origin
  const body    = req.body

  // console.log({
  //   at: new Date().toLocaleString(),
  //   from,
  //   method,
  //   origin,
  //   body,
  // })
  next()
})

export default router
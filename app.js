import express, { json, urlencoded } from 'express'
import { corsMiddleware } from './middlewares/cors.js'
import cookieParser from 'cookie-parser'
import { alumnosRouter } from './routes/alumnos.js'
import { adminsRouter } from './routes/admins.js'

const app = express()

app.use(json({ limit: '50mb' }))
app.use(urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser())
app.disable('x-powered-by')
app.use(corsMiddleware())
app.use('/alumnos', alumnosRouter)
app.use('/admins', adminsRouter)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})
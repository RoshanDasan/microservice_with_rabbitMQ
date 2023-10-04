import * as express from 'express'
import * as cors from 'cors'
import { DataSource } from 'typeorm'

const AppDataSource = new DataSource({
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "r1o2s3h4a5n6",
    "database": "microservice_demo",
})

AppDataSource.initialize().then(() => {
    
    const app = express()

    // cors setup for UI
    app.use(cors({
        origin: ["http://localhost:3000"]
    }))

    app.use(express.json())

    app.listen(5000, () => console.log('Server connected'))
})



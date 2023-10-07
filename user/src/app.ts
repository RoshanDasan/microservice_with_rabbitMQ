import * as express from 'express';
import { Request, Response } from 'express';
import * as cors from 'cors';
import { createConnection, Repository } from 'typeorm'; // Use createConnection
import * as amqp from 'amqplib/callback_api'

import { Product } from './entity/product';

async function startServer() {
  const connection = await createConnection({
    type: 'mongodb',
    synchronize: true,
    database: 'microservice_demo',
    logging: ['query', 'error'],
    entities: [Product],
    migrations: [],
    subscribers: [],
  });
  const productRepository: Repository<Product> = connection.getMongoRepository(Product);


  amqp.connect('amqps://gsjvnbbg:9IORml9yyU6-e17u8O4rVkjVoFhaOEwz@rat.rmq2.cloudamqp.com/gsjvnbbg', (err0, connection) => {
    if (err0) throw err0
    connection.createChannel((err1, channel) => {
      if (err1) throw err1

      channel.assertQueue('hello', { durable: false })

      const app = express();

      // Cors setup for UI 
      app.use(
        cors({
          origin: 'http://localhost:3000', // Allow requests from your frontend
        })
      );

      app.use(express.json());

      channel.consume('hello', (msg) => {
        console.log(msg.content.toString());

      })

      app.listen(6000, () => console.log('Server connected on port 6000'));
      process.on('beforeExit', () => {
        console.log('Connection closed');
        connection.close()

      })

    })

  })
}

startServer();

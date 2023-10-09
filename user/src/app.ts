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

      channel.assertQueue('product_created', { durable: false })
      channel.assertQueue('product_updated', { durable: false })
      channel.assertQueue('product_deleted', { durable: false })

      const app = express();

      // Cors setup for UI 
      app.use(
        cors({
          origin: 'http://localhost:3000', // Allow requests from your frontend
        })
      );

      app.use(express.json());

      channel.consume('product_created', async (msg) => {
        const { title, image, likes, id } = JSON.parse(msg.content.toString())
        const product = new Product()
        product.title = title
        product.image = image
        product.likes = likes
        product.admin_id = id
        await productRepository.save(product)
        console.log('Product created');

      }, { noAck: true })

      channel.consume('product_updated', async (msg) => {
        const { title, image, likes, id } = JSON.parse(msg.content.toString())
        const product = await productRepository.findOne({ where: { admin_id: id } })
        productRepository.merge(product, { title, image, likes })
        console.log('Product updated');
        await productRepository.save(product)
      }, { noAck: true })

      channel.consume('product_deleted', async (msg) => {
        const admin_id = JSON.parse(msg.content.toString())
        await productRepository.delete({ admin_id })
        console.log('Product deleted');

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

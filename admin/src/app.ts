import * as express from 'express';
import { Request, Response } from 'express';
import * as cors from 'cors';
import { createConnection, Repository } from 'typeorm';

import { Product } from './entity/product';

async function startServer() {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'r1o2s3h4a5n6',
      database: 'microservice_demo',
      entities: [Product],
      synchronize: true, // Set to false in production
    });

    const app = express();
    const productRepository: Repository<Product> = connection.getRepository(Product);

    // Cors setup for UI
    app.use(
      cors({
        origin: 'http://localhost:3000', // Allow requests from your frontend
      })
    );

    app.use(express.json());

    // Route endpoints
    app.get('/api/products', async (req: Request, res: Response) => {
      try {
        const products = await productRepository.find();
        res.json(products);
      } catch (error) {
        console.error(`Error while fetching data: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/api/products', async (req: Request, res: Response) => {
      try {
        const product = productRepository.create(req.body);
        const result = await productRepository.save(product);
        res.json(result);
      } catch (error) {
        console.error(`Error while saving product: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/api/products/:id', async (req: Request, res: Response) => {
      try {
        const product = await productRepository.findOne({ where: { id: parseInt(req.params.id) } })
        res.json(product)
      } catch (error) {
        console.error(`Error while fetching product: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    app.put('/api/products/:id', async (req: Request, res: Response) => {
      try {
        const product = await productRepository.findOne({ where: { id: parseInt(req.params.id) } })
        productRepository.merge(product, req.body)
        const result = await productRepository.save(product)
        res.json(result)
      } catch (error) {
        console.error(`Error while updating product: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    app.delete('/api/products/:id', async (req: Request, res: Response) => {
      try {
        const result = await productRepository.delete(req.params.id)
        res.json(result)
      } catch (error) {
        console.error(`Error while deleting product: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    app.post('/api/products/like/:id', async (req: Request, res: Response) => {
      try {
        const product = await productRepository.findOne({ where: { id: parseInt(req.params.id) } })
        if (!product) return res.status(404).json({ error: 'Product not found' });
        product.likes++
        const result = await productRepository.save(product)
        res.json(result)
      } catch (error) {
        console.error(`Error while updating like of the product: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    app.listen(5000, () => console.log('Server connected'));
  } catch (error) {
    console.error(`Error while connecting to the database: ${error}`);
  }
}

startServer();

import 'express-async-errors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import morgan from 'morgan';
import mongoose from 'mongoose';
import { validateTest } from './middleware/validationMiddleware.js';

// ROUTERS
import jobRouter from './routes/jobRouter.js';

// MIDDLEWARE
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';

// middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World');
});

app.post(
  '/api/v1/test',
  validateTest,
  (req, res) => {
    const { name } = req.body;
    res.json({ message: `Hello, ${name}` });
  }
);

app.use('/api/v1/jobs', jobRouter);

// app.get('/api/v1/jobs', getAllJobs);
// app.post('/api/v1/jobs', createJob);
// app.get('/api/v1/jobs/:id', getSingleJob);
// app.patch('/api/v1/jobs/:id', updateJob);
// app.delete('/api/v1/jobs/:id', deleteJob);

app.use('*', (req, res) => {
  res.status(404).json({ msg: 'not found' });
});

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5100;

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}

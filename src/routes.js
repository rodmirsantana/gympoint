import { Router } from 'express';

import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/students/:id/checkins', CheckinController.index);
routes.post('/students/:id/checkins', CheckinController.store);

routes.get('/students/:id?/help_orders', HelpOrderController.index);
routes.post('/students/:id/help_orders/', HelpOrderController.store);

routes.use(authMiddleware);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.put('/users', UserController.update);

routes.get('/students', StudentController.index);
routes.put('/students', StudentController.update);
routes.post('/students', StudentController.store);
routes.delete('/students/:id', StudentController.delete);

routes.get('/help_orders', HelpOrderController.index);
routes.put('/help_orders/:id/answer', HelpOrderController.update);

routes.get('/enrollments', EnrollmentController.index);
routes.put('/enrollments/:id', EnrollmentController.update);
routes.post('/enrollments', EnrollmentController.store);
routes.delete('/enrollments/:id', EnrollmentController.delete);

export default routes;

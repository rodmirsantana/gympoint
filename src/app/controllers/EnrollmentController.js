import Enrollment from '../models/Enrollment';

class EnrollmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const limitPage = 20;

    const enroleds = await Enrollment.findAll({
      order: ['start_date'],
      limit: limitPage,
      offset: (page - 1) * limitPage,
    });

    return res.json(enroleds);
  }
}

export default new EnrollmentController();

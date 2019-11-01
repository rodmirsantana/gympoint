import * as Yup from 'yup';
import { parseISO, addMonths, isBefore } from 'date-fns';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

class EnrollmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const limitPage = 20;

    const enrollments = await Enrollment.findAll({
      order: ['start_date'],
      limit: limitPage,
      offset: (page - 1) * limitPage,
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'price', 'duration'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .positive()
        .integer()
        .required(),
      plan_id: Yup.number()
        .positive()
        .integer()
        .required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const plan_start_date = parseISO(start_date);
    if (isBefore(plan_start_date, new Date())) {
      return res
        .status(400)
        .json({ error: 'Start date must be greater than today' });
    }

    const end_date = addMonths(plan_start_date, plan.duration);
    const price = plan.price * plan.duration;

    const enrolled = await Enrollment.create({
      student_id,
      plan_id,
      start_date: plan_start_date,
      end_date,
      price,
    });

    return res.json(enrolled);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .positive()
        .integer(),
      plan_id: Yup.number()
        .positive()
        .integer(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found' });
    }

    const student_id = req.body.student_id || enrollment.student_id;
    const plan_id = req.body.plan_id || enrollment.plan_id;
    const start_date = req.body.start_date || enrollment.start_date;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const plan_start_date = parseISO(start_date);
    if (isBefore(plan_start_date, new Date())) {
      return res
        .status(400)
        .json({ error: 'Start date must be greater than today' });
    }

    const end_date = addMonths(plan_start_date, plan.duration);
    const price = plan.price * plan.duration;

    const enrolled = await enrollment.update({
      student_id,
      plan_id,
      start_date: plan_start_date,
      end_date,
      price,
    });

    return res.json(enrolled);
  }

  async delete(req, res) {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found' });
    }

    await enrollment.destroy({
      where: { id },
    });

    return res.json({ message: 'Enrollment successfully deleted' });
  }
}

export default new EnrollmentController();

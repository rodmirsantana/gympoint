import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import HelpAnswer from '../jobs/HelpAnswer';
import Student from '../models/Student';
import Queue from '../../lib/Queue';

class HelpOrderController {
  async index(req, res) {
    const { page = 1 } = req.body;
    const { id = null } = req.params;
    const itemsPerPage = 20;

    let helpOrders = null;

    if (id === null) {
      helpOrders = await HelpOrder.findAndCountAll({
        where: { answer: null },
        order: ['created_at'],
        limit: itemsPerPage,
        offset: (page - 1) * 20,
      });
    } else {
      helpOrders = await HelpOrder.findAndCountAll({
        where: { student_id: id },
        order: ['created_at'],
        limit: itemsPerPage,
        offset: (page - 1) * 20,
      });
    }

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string()
        .min(5)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const { question } = req.body;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const newHelpOrder = await HelpOrder.create({
      student_id: id,
      question,
    });

    return res.json(newHelpOrder);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string()
        .min(5)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const { answer } = req.body;

    const order = await HelpOrder.findOne({
      where: { id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!order) {
      return res.status(400).json({ error: 'Help order not found' });
    }

    const orderAnswer = await order.update({
      answer,
      answer_at: new Date(),
    });

    await Queue.add(HelpAnswer.key, {
      help: orderAnswer,
    });

    return res.json(orderAnswer);
  }
}

export default new HelpOrderController();

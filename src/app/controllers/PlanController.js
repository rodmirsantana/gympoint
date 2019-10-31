import * as Yup from 'yup';
import { Op } from 'sequelize';

import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      order: ['duration'],
    });
    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .min(4)
        .required(),
      duration: Yup.number()
        .positive()
        .integer()
        .min(1)
        .required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const planExists = await Plan.findOne({ where: { title: req.body.title } });

    if (planExists) {
      return res
        .status(400)
        .json({ error: 'A plan with the same name already exists.' });
    }

    const newPlan = await Plan.create(req.body);

    return res.json(newPlan);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().min(4),
      duration: Yup.number()
        .positive()
        .integer()
        .min(1),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const planExists = await Plan.findOne({
      where: {
        id: {
          [Op.ne]: req.params.id,
        },
        title: req.body.title,
      },
    });

    if (planExists) {
      return res
        .status(400)
        .json({ error: 'A plan with the same name already exists.' });
    }

    await plan.update(req.body);

    return res.json(plan);
  }

  async delete(req, res) {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    plan.destroy({
      where: { id },
    });

    return res.json({ message: 'Plan has been successfully deleted.' });
  }
}

export default new PlanController();

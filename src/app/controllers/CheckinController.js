import { subDays } from 'date-fns';
import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const { id } = req.params;
    const { page = 1 } = req.query;
    const itemsPerPage = 20;

    const checkins = await Checkin.findAndCountAll({
      where: { student_id: id },
      order: [['created_at', 'desc']],
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
    });

    const total = checkins.count;
    const data = checkins.rows;

    return res.json({ page, total, data });
  }

  async store(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const enrolled = await Enrollment.findAll({
      where: {
        student_id: student.id,
      },
      limit: 1,
      order: [['end_date', 'desc']],
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
        'overdue',
      ],
    });

    if (!enrolled || enrolled.length === 0 || enrolled[0].overdue) {
      return res
        .status(400)
        .json({ error: 'No active plans found for this student' });
    }

    const daysBefore = subDays(new Date(), 7);
    const checkinLimitPerWeek = 5;

    const checkins = await Checkin.findAndCountAll({
      where: {
        student_id: student.id,
        created_at: {
          [Op.gt]: daysBefore,
        },
      },
    });

    if (checkins && checkins.count >= checkinLimitPerWeek) {
      return res.status(400).json({
        error: `Cannot check in, weekly limit of ${checkinLimitPerWeek} checkins reached`,
      });
    }

    const checkin = await Checkin.create({
      student_id: student.id,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();

import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const students = await Student.findAll({ order: [['name', 'asc']] });
    return res.json(students);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .required()
        .integer()
        .moreThan(0),
      weight: Yup.number()
        .required()
        .moreThan(0),
      height: Yup.number()
        .required()
        .moreThan(0),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const student = await Student.findOne({ where: { email: req.body.email } });

    if (student) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    await Student.create(req.body);

    return res.json(req.body);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .required()
        .integer()
        .moreThan(0),
      weight: Yup.number()
        .required()
        .moreThan(0),
      height: Yup.number()
        .required()
        .moreThan(0),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { email } = req.body;

    const student = await Student.findByPk(req.userId);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    if (email !== student.email) {
      const studentExists = await Student.findOne({ where: { email } });

      if (studentExists) {
        return res.status(400).json({ error: 'Student already exists.' });
      }
    }

    await student.update(req.body);

    return res.json(req.body);
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(400).json({ error: 'Student not found' });
      }

      student.destroy({
        where: { id },
      });

      return res.json({ message: 'Student has been successfully deleted' });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
}

export default new StudentController();

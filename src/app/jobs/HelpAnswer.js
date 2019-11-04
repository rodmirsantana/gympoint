import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class HelpAnswerMail {
  get key() {
    return 'HelpAnswerMail';
  }

  async handle({ data }) {
    const { help } = data;

    await Mail.sendMail({
      to: `${help.student.name} <${help.student.email}>`,
      subject: 'Resposta a dúvida ou solicitação ',
      template: 'helpAnswer',
      context: {
        student: help.student.name,
        question: help.question,
        answer: help.answer,
        date_answer: format(
          parseISO(help.answer_at),
          "dd 'de' MMMM 'de' yyyy 'às' HH:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new HelpAnswerMail();

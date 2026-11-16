import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';

import { fetchPoll } from '../../slices/pollSlice';
import { addQuestion, setQuestions } from '../../slices/questionsSlice';
import { navigateTo, routes } from '../../slices/routerSlice';
import { dateFormat, getInitialPollId } from '../../shared/utils';

export function StartScreen() {
  const dispatch = useDispatch();
  const poll = useSelector((state) => state.poll);
  const questionsQueue = useSelector((state) => state.questions);
  const pollId = getInitialPollId();

  useEffect(() => {
    if (!poll.id && pollId !== null) {
      dispatch(fetchPoll(pollId));
    }
  }, [dispatch, poll.id, pollId]);

  if (pollId === null) {
    return <Alert variant="warning">Идентификатор опроса не указан в ссылке.</Alert>;
  }

  if (poll.error) {
    return <Alert variant="danger">Не удалось загрузить опрос: {poll.error}</Alert>;
  }

  if (poll.isLoading)
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
      </div>
    );

  /**
   * Инициализирует очередь вопросов и открывает экран прохождения.
   * Если опрос уже завершен на сервере (есть poll_result), восстанавливает
   * в очередь только те вопросы, на которые были даны ответы.
   */
  const handleStartPoll = () => {
    if (questionsQueue.length === 0) {
      if (poll.poll_result) {
        const questions = [];
        for (const question of poll.questions) {
          const answersSet = new Set(question.answers.map((answer) => answer.id));
          const answersResult = poll.poll_result.answers.filter((answer) =>
            answersSet.has(answer.answer)
          );

          if (answersResult.length > 0)
            questions.push({ ...question, answers_result: answersResult });
        }

        dispatch(setQuestions(questions));
      } else {
        dispatch(addQuestion(poll.questions[0]));
      }
    }

    dispatch(navigateTo(routes.QUESTIONS));
  };

  return (
    <Card className="text-center">
      <Card.Header>
        <h3>{poll.name}</h3>

        {poll.completed_at && poll.created_at && (
          <span>
            {`Период проведения: с ${dateFormat(poll.created_at)} по ${dateFormat(poll.completed_at)}`}
          </span>
        )}
      </Card.Header>

      {poll.description && (
        <Card.Body>
          <div dangerouslySetInnerHTML={{ __html: poll.description }} />
        </Card.Body>
      )}

      <Card.Footer>
        <Row className="g-2">
          {poll.report && (
            <Col sm={6} xs={12}>
              <div className="d-grid">
                <Button
                  as="a"
                  href={poll.report.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  variant="outline-secondary"
                  className="d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <span>Скачать отчет</span>
                  <Download size={18} />
                </Button>
              </div>
            </Col>
          )}

          <Col sm={{ span: 6, offset: poll.report ? 0 : 3 }} xs={12}>
            <div className="d-grid">
              <Button variant={poll.completed ? 'primary' : 'success'} onClick={handleStartPoll}>
                {poll.completed ? 'Просмотреть ответы' : 'Начать опрос'}
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}

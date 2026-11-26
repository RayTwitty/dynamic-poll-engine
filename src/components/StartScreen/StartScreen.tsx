import { useEffect } from 'react';
import { Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Question } from '@/types/poll';
import { ScreenProps } from '@/types/ui';
import { fetchPoll } from '@/slices/pollSlice';
import { addQuestion, setQuestions } from '@/slices/questionsSlice';
import { navigateTo, Routes } from '@/slices/routerSlice';
import { dateFormat, getInitialPollId } from '@/shared/utils';

export function StartScreen({ onNotify }: ScreenProps) {
  const dispatch = useAppDispatch();
  const poll = useAppSelector((state) => state.poll);
  const questionsQueue = useAppSelector((state) => state.questions);
  const pollId = getInitialPollId();

  useEffect(() => {
    if (!poll.id && pollId !== null) {
      dispatch(fetchPoll(pollId));
    }
  }, [dispatch, poll.id, pollId]);

  if (pollId === null) {
    return (
      <Card className="poll-card">
        <Alert variant="warning">
          <span>Идентификатор опроса не указан в ссылке.</span>
        </Alert>
      </Card>
    );
  }

  if (poll.error) {
    return (
      <Card className="poll-card">
        <Alert variant="danger">
          <span>Не удалось загрузить опрос: {poll.error}</span>
        </Alert>
      </Card>
    );
  }

  if (poll.isLoading)
    return (
      <div className="poll-spinner d-flex align-items-center justify-content-center">
        <Spinner animation="grow" />
      </div>
    );

  /**
   * Инициализирует очередь вопросов и открывает экран прохождения.
   * Если опрос уже завершен на сервере (есть poll_result), восстанавливает
   * в очередь только те вопросы, на которые были даны ответы.
   */
  const handleStartPoll = () => {
    if (!poll.questions?.length) {
      onNotify('В данном опросе пока нет доступных вопросов.', 'danger');
      return;
    }

    if (questionsQueue.length === 0) {
      if (poll.poll_result) {
        const questions: Question[] = [];
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

    dispatch(navigateTo(Routes.QuestionsScreen));
  };

  return (
    <Card className="poll-card text-center">
      <Card.Header>
        <h3 className="poll-title">{poll.name}</h3>

        {poll.completed_at && poll.created_at && (
          <span className="poll-description">
            {`Период проведения: с ${dateFormat(poll.created_at)} по ${dateFormat(poll.completed_at)}`}
          </span>
        )}
      </Card.Header>

      {poll.description && (
        <Card.Body>
          <div
            dangerouslySetInnerHTML={{ __html: poll.description }}
            className="poll-description"
          />
        </Card.Body>
      )}

      <Card.Footer>
        <Row className="g-2">
          {poll.report && (
            <Col sm={6} xs={12} className="order-2 order-sm-1">
              <div className="d-grid">
                <Button
                  as="a"
                  href={poll.report.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  variant="primary"
                  className="d-inline-flex align-items-center justify-content-center gap-2 btn-poll-secondary"
                >
                  <span>Скачать отчет</span>
                  <Download size={18} />
                </Button>
              </div>
            </Col>
          )}

          <Col sm={{ span: 6, offset: poll.report ? 0 : 3 }} xs={12} className="order-1 order-sm-2">
            <div className="d-grid">
              <Button variant="primary" onClick={handleStartPoll} className="btn-poll-primary">
                {poll.completed ? 'Просмотреть ответы' : 'Начать опрос'}
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}

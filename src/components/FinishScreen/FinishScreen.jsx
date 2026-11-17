import { useDispatch, useSelector } from 'react-redux';
import { Button, Row, Col, Card, Spinner } from 'react-bootstrap';

import { setPollFinished, submitPoll } from '@/slices/pollSlice';
import { navigateTo, routes } from '@/slices/routerSlice';

export function FinishScreen({ onNotify }) {
  const dispatch = useDispatch();
  const questionsQueue = useSelector((state) => state.questions);
  const { isSubmitting, submittedSuccessfully } = useSelector((state) => state.poll);

  const handleReviewAnswers = () => {
    dispatch(setPollFinished());
    dispatch(navigateTo(routes.QUESTIONS));
  };

  const handleSendResults = async () => {
    try {
      const answers = questionsQueue.flatMap((question) => question.answers_result ?? []);
      await dispatch(submitPoll(answers)).unwrap();

      onNotify?.('Спасибо! Ваши ответы успешно отправлены.', 'success');
    } catch (error) {
      onNotify?.(`Ошибка при отправке: ${error}`, 'danger');
    }
  };

  return (
    <Card className="text-center">
      <Card.Header>
        <h3>Опрос завершен, спасибо за участие!</h3>
      </Card.Header>

      <Card.Body>
        <p>
          {submittedSuccessfully
            ? 'Ваши результаты сохранены. Теперь вы можете посмотреть общую статистику голосования.'
            : 'Перед отправлением опроса вы можете вернуться и проверить свои ответы.'}
        </p>
      </Card.Body>

      <Card.Footer>
        <Row className="g-2">
          {/* После отправки результатов центрируем оставшуюся кнопку просмотра (offset: 3) */}
          <Col sm={{ span: 6, offset: !submittedSuccessfully ? 0 : 3 }} xs={12}>
            <div className="d-grid">
              <Button
                variant="outline-primary"
                onClick={handleReviewAnswers}
                disabled={isSubmitting}
              >
                {submittedSuccessfully ? 'Посмотреть статистику' : 'Просмотреть ответы'}
              </Button>
            </div>
          </Col>

          {!submittedSuccessfully && (
            <Col sm={6} xs={12}>
              <div className="d-grid">
                <Button variant="success" onClick={handleSendResults} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Отправка...
                    </>
                  ) : (
                    'Отправить результаты'
                  )}
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </Card.Footer>
    </Card>
  );
}

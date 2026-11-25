import { Button, Row, Col, Card, Spinner } from 'react-bootstrap';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { ScreenProps } from '@/types/ui';
import { setPollFinished, submitPoll } from '@/slices/pollSlice';
import { navigateTo, Routes } from '@/slices/routerSlice';

export function FinishScreen({ onNotify }: ScreenProps) {
  const dispatch = useAppDispatch();
  const questionsQueue = useAppSelector((state) => state.questions);
  const { isSubmitting, submittedSuccessfully } = useAppSelector((state) => state.poll);

  const handleReviewAnswers = () => {
    dispatch(setPollFinished());
    dispatch(navigateTo(Routes.QuestionsScreen));
  };

  const handleSendResults = async () => {
    try {
      const answers = questionsQueue.flatMap((question) => question.answers_result ?? []);
      await dispatch(submitPoll(answers)).unwrap();

      onNotify('Спасибо! Ваши ответы успешно отправлены.', 'success');
    } catch (error) {
      onNotify(`Ошибка при отправке: ${error}`, 'danger');
    }
  };

  return (
    <Card className="poll-card text-center">
      <Card.Header>
        <h3 className="poll-title">Опрос завершен, спасибо за участие!</h3>
      </Card.Header>

      <Card.Body>
        <p className="poll-description">
          {submittedSuccessfully
            ? 'Ваши результаты сохранены. Теперь вы можете посмотреть общую статистику голосования.'
            : 'Перед отправлением опроса вы можете вернуться и проверить свои ответы.'}
        </p>
      </Card.Body>

      <Card.Footer>
        <Row className="g-2">
          {/* После отправки результатов центрируем оставшуюся кнопку просмотра (offset: 3) */}
          <Col
            sm={{ span: 6, offset: !submittedSuccessfully ? 0 : 3 }}
            xs={12}
            className="order-2 order-sm-1"
          >
            <div className="d-grid">
              <Button
                variant="primary"
                onClick={handleReviewAnswers}
                disabled={isSubmitting}
                className="btn-poll-secondary"
              >
                {submittedSuccessfully ? 'Посмотреть статистику' : 'Просмотреть ответы'}
              </Button>
            </div>
          </Col>

          {!submittedSuccessfully && (
            <Col sm={6} xs={12} className="order-1 order-sm-2">
              <div className="d-grid">
                <Button
                  variant="primary"
                  onClick={handleSendResults}
                  disabled={isSubmitting}
                  className="btn-poll-primary"
                >
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

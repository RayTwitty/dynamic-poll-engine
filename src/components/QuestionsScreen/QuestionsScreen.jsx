import { ListGroup, Button, Row, Col, Card, ProgressBar } from 'react-bootstrap';

import { useQuestionsScreen } from '@/hooks/useQuestionsScreen';
import { AnswerItem } from './AnswerItem';

export function QuestionsScreen() {
  const {
    poll,
    curQuestion,
    selectedAnswers,
    answerValues,
    handleToggleAnswer,
    handleTextChange,
    handleNextButton,
    handlePrevButton,
    totalVotes,
    pollProgress,
  } = useQuestionsScreen();

  const showMaxAnswersHint =
    !poll.completed &&
    curQuestion.max_answer > 1 &&
    curQuestion.max_answer !== curQuestion.answers.length;

  const canSkipQuestion = !poll.completed && curQuestion.skippable;
  const isLastQuestion = pollProgress === 100;

  const hasEmptyCustomAnswer = curQuestion.answers.some(
    (answer) =>
      !answer.text && selectedAnswers.includes(answer.id) && !answerValues[answer.id]?.trim()
  );
  const isNextDisabled = selectedAnswers.length === 0 || hasEmptyCustomAnswer;

  return (
    <Card>
      <Card.Header className="text-center">
        <h3>{poll.name}</h3>
        <ProgressBar now={pollProgress} />
      </Card.Header>

      <Card.Body>
        <p>{curQuestion.text}</p>

        {showMaxAnswersHint && (
          <span className="mt-2">
            * максимальное количество вариантов ответа: {curQuestion.max_answer}
          </span>
        )}

        <ListGroup>
          {curQuestion.answers.map((answer) => (
            <AnswerItem
              key={answer.id}
              answer={answer}
              isRadio={curQuestion.max_answer === 1}
              isSelected={selectedAnswers.includes(answer.id)}
              isMaxReached={
                curQuestion.max_answer > 1 && selectedAnswers.length >= curQuestion.max_answer
              }
              isPollCompleted={poll.completed}
              customValue={answerValues[answer.id] ?? ''}
              totalVotes={totalVotes}
              onToggle={handleToggleAnswer}
              onTextChange={handleTextChange}
            />
          ))}
        </ListGroup>
      </Card.Body>

      <Card.Footer className="text-center">
        <Row className="g-2">
          <Col sm={4} xs={12}>
            <div className="d-grid">
              <Button variant="outline-secondary" onClick={handlePrevButton}>
                Назад
              </Button>
            </div>
          </Col>

          {canSkipQuestion && (
            <Col sm={4} xs={12}>
              <div className="d-grid">
                <Button variant="outline-warning" onClick={() => handleNextButton(true)}>
                  Пропустить
                </Button>
              </div>
            </Col>
          )}

          <Col sm={{ span: 4, offset: canSkipQuestion ? 0 : 4 }} xs={12}>
            <div className="d-grid">
              <Button
                variant={isLastQuestion ? 'success' : 'primary'}
                disabled={isNextDisabled}
                onClick={() => handleNextButton(false)}
              >
                {isLastQuestion ? 'Завершить' : 'Далее'}
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}

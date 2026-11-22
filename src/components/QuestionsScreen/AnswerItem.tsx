import { Form, ListGroup, ProgressBar } from 'react-bootstrap';

import { Answer } from '@/types/poll';
import { wordDeclension } from '@/shared/utils';

interface AnswerItemProps {
  answer: Answer;
  isRadio: boolean;
  isSelected: boolean;
  isMaxReached: boolean;
  isPollCompleted: boolean;
  customValue: string;
  totalVotes: number;
  onToggle: (id: number, isChecked: boolean) => void;
  onTextChange: (id: number, value: string) => void;
}

/**
 * Карточка отдельного варианта ответа в вопросе.
 */
export function AnswerItem({
  answer,
  isRadio,
  isSelected,
  isMaxReached,
  isPollCompleted,
  customValue,
  totalVotes,
  onToggle,
  onTextChange,
}: AnswerItemProps) {
  const isCustomAnswer = !answer.text;

  // Ответ заблокирован, если опрос завершен ИЛИ достигнут лимит выбора
  const isDisabled = isPollCompleted || (!isSelected && isMaxReached);

  // Процент голосов для отображения статистики после завершения опроса
  const votesRatio = answer.votes > 0 && totalVotes > 0 ? (answer.votes / totalVotes) * 100 : 0;

  return (
    <ListGroup.Item>
      {answer.media && <div dangerouslySetInnerHTML={{ __html: answer.media }} />}

      <Form.Check
        type={isRadio ? 'radio' : 'checkbox'}
        label={answer.text || 'Свой вариант'}
        name="answer"
        id={`answer-${answer.id}`}
        className={isCustomAnswer ? 'mb-2' : ''}
        onChange={(e) => onToggle(answer.id, e.target.checked)}
        checked={isSelected}
        disabled={isDisabled}
      />

      {isCustomAnswer && (
        <Form.Control
          placeholder="Введите свой вариант ответа"
          value={customValue}
          onChange={(e) => onTextChange(answer.id, e.target.value)}
          disabled={isDisabled || !isSelected}
        />
      )}

      {isPollCompleted && (
        <>
          <ProgressBar
            now={votesRatio}
            label={votesRatio > 0 ? `${parseFloat(votesRatio.toFixed(1))}%` : ''}
          />
          <span>
            {`${answer.votes} ${wordDeclension(answer.votes, 'голос', 'голоса', 'голосов')}`}
          </span>
        </>
      )}
    </ListGroup.Item>
  );
}

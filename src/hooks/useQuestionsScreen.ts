import { useState, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Question } from '@/types/poll';
import { incQuestionIdx, decQuestionIdx, setPollFinished } from '@/slices/pollSlice';
import {
  addQuestion,
  removeQuestion,
  saveAnswers,
  setQuestions,
  clearEmptyQuestions,
} from '@/slices/questionsSlice';
import { navigateTo, Routes } from '@/slices/routerSlice';

type AnswerValue = Record<number, string>;

/**
 * Извлекает из объекта вопроса список ID выбранных ответов и словарь их текстовых значений (если есть).
 * @param question - Объект вопроса.
 * @param [question.answers_result] - Массив выбранных ответов.
 * @returns Объект с массивом ID ответов и мапой их значений.
 */
const getAnswersFromQuestion = (question?: Question) => {
  const answerValues: AnswerValue = {};
  const answers =
    question?.answers_result?.map((answer) => {
      if (answer.answer_value != null) answerValues[answer.answer] = answer.answer_value;
      return answer.answer;
    }) ?? [];

  return { answers, answerValues };
};

export const useQuestionsScreen = () => {
  const dispatch = useAppDispatch();
  const poll = useAppSelector((state) => state.poll);
  const questionsQueue = useAppSelector((state) => state.questions);

  const curQuestion: Question | undefined = questionsQueue[poll.curQuestionIdx];

  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(() =>
    poll.completed ? getAnswersFromQuestion(curQuestion).answers : []
  );

  const [answerValues, setAnswerValues] = useState<AnswerValue>(() =>
    poll.completed ? getAnswersFromQuestion(curQuestion).answerValues : {}
  );

  /** Процент выполнения опроса (от 0 до 100) */
  const pollProgress = useMemo(() => {
    let maxIdx;

    if (poll.completed) {
      maxIdx = questionsQueue.length - 1;
    } else {
      const answers: Record<number, boolean> = {};
      for (const question of questionsQueue) {
        if (question.answers_result) {
          for (const answer of question.answers_result) answers[answer.answer] = true;
        }
      }

      // Учитываем базовые вопросы и связанные, для которых уже выбран нужный ответ
      const questionsCount =
        poll.questions?.filter(
          (question) => question.related_answer_id === null || answers[question.related_answer_id]
        ).length ?? 0;

      maxIdx = questionsCount - 1;
    }

    return maxIdx > 0 ? (poll.curQuestionIdx / maxIdx) * 100 : 0;
  }, [poll.completed, poll.curQuestionIdx, poll.questions, questionsQueue]);

  // Проголосовавших подсчитываем только если с сервера пришли результаты или пользователь уже отправил свои ответы
  const totalVotes =
    poll.poll_result || poll.submittedSuccessfully
      ? (curQuestion?.answers?.reduce((acc: number, answer) => acc + answer.votes, 0) ?? 0)
      : -1;

  /**
   * Управляет видимостью связанных вопросов на основе выбранных ответов.
   * Находит вопросы, привязанные к ID выбранных ответов, и добавляет/удаляет их из очереди.
   *
   * @param answerIds - Массив ID выбранных ответов.
   * @param shouldRemove - Флаг: true для удаления вопросов, false для их добавления.
   * @returns Количество найденных связанных вопросов.
   */
  const updateRelatedQuestions = (answerIds: number[], shouldRemove: boolean): number => {
    const selectedAnswersSet = new Set(answerIds);

    // Фильтруем вопросы, у которых related_answer_id совпадает с выбранными ответами
    const relatedQuestions =
      poll.questions?.filter(
        (question) =>
          question.related_answer_id !== null && selectedAnswersSet.has(question.related_answer_id)
      ) ?? [];

    if (relatedQuestions.length === 0) return 0;

    if (shouldRemove) {
      dispatch(removeQuestion(relatedQuestions.map((question) => question.id)));
    } else {
      dispatch(addQuestion(relatedQuestions));
    }

    return relatedQuestions.length;
  };

  const handleToggleAnswer = (id: number, isChecked: boolean) => {
    if (!curQuestion) return;

    if (curQuestion.max_answer === 1) {
      setSelectedAnswers([id]);
    } else if (isChecked) {
      setSelectedAnswers((prev) => [...prev, id]);
    } else {
      setSelectedAnswers((prev) => prev.filter((answerId) => answerId !== id));
    }
  };

  const handleTextChange = (id: number, value: string) => {
    setAnswerValues((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * Переходит к следующему вопросу или завершает опрос.
   * @param skipQuestion - Флаг пропуска текущего вопроса без сохранения ответов.
   */
  const handleNextButton = (skipQuestion = false) => {
    let lastQuestionsIdx = questionsQueue.length - 1;

    // В режиме просмотра завершенного опроса просто подгружаем сохраненные ответы
    if (poll.completed) {
      if (poll.curQuestionIdx === lastQuestionsIdx) {
        dispatch(navigateTo(Routes.FinishScreen));
        return;
      }

      const { answers, answerValues } = getAnswersFromQuestion(
        questionsQueue[poll.curQuestionIdx + 1]
      );
      setSelectedAnswers(answers);
      setAnswerValues(answerValues);
      dispatch(incQuestionIdx());
      return;
    }

    // Сохраняем ответы на текущий вопрос и подтягиваем в очередь связанные вопросы
    if (!skipQuestion) {
      const answers = selectedAnswers.map((id) => ({
        answer: id,
        answer_value: answerValues[id] ?? null,
      }));

      dispatch(saveAnswers({ idx: poll.curQuestionIdx, answers }));
      lastQuestionsIdx += updateRelatedQuestions(selectedAnswers, false);
    }

    setSelectedAnswers([]);
    setAnswerValues({});

    // Если дошли до конца текущей очереди, ищем следующий несвязанный вопрос в общем списке
    if (poll.curQuestionIdx === lastQuestionsIdx) {
      const nextQuestion = poll.questions?.find(
        (question) => question.id > curQuestion.id && question.related_answer_id === null
      );

      if (nextQuestion) {
        dispatch(addQuestion(nextQuestion));
      } else {
        dispatch(clearEmptyQuestions());
        dispatch(setPollFinished());
        dispatch(navigateTo(Routes.FinishScreen));
        return;
      }
    }

    dispatch(incQuestionIdx());
  };

  const handlePrevButton = () => {
    // На первом вопросе кнопка "Назад" сбрасывает очередь вопросов и возвращает на стартовый экран
    if (poll.curQuestionIdx === 0) {
      if (!poll.completed) dispatch(setQuestions([]));
      dispatch(navigateTo(Routes.StartScreen));
      return;
    }

    const prevIdx = poll.curQuestionIdx - 1;
    const { answers, answerValues } = getAnswersFromQuestion(questionsQueue[prevIdx]);
    setSelectedAnswers(answers);
    setAnswerValues(answerValues);

    // В режиме прохождения: удаляем связанные вопросы и очищаем сохраненные ответы
    if (!poll.completed) {
      updateRelatedQuestions(answers, true);
      dispatch(saveAnswers({ idx: prevIdx, answers: [] }));
    }

    dispatch(decQuestionIdx());
  };

  return {
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
  };
};

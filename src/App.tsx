import { useState } from 'react';
import { Container, Row, Col, Toast, ToastContainer } from 'react-bootstrap';

import { useAppSelector } from '@/hooks/redux';
import { ToastVariant } from '@/types/ui';
import { Routes } from '@/slices/routerSlice';
import { StartScreen } from '@/components/StartScreen/StartScreen';
import { QuestionsScreen } from '@/components/QuestionsScreen/QuestionsScreen';
import { FinishScreen } from '@/components/FinishScreen/FinishScreen';

interface ToastState {
  show: boolean;
  message: string;
  variant: ToastVariant;
}

export default function App() {
  const path = useAppSelector((state) => state.router.path);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', variant: 'success' });

  const showToast = (message: string, variant: ToastVariant = 'success') => {
    setToast({ show: true, message, variant });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  let CurrentScreen;
  switch (path) {
    case Routes.QuestionsScreen:
      CurrentScreen = QuestionsScreen;
      break;
    case Routes.FinishScreen:
      CurrentScreen = FinishScreen;
      break;
    default:
      CurrentScreen = StartScreen;
  }

  return (
    <>
      <Container className="my-4">
        <Row>
          <Col sm={12} md={{ span: 8, offset: 2 }}>
            <CurrentScreen onNotify={showToast} />
          </Col>
        </Row>
      </Container>

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
        <Toast show={toast.show} onClose={hideToast} delay={4000} autohide bg={toast.variant}>
          <Toast.Header closeButton>
            <strong className="me-auto">
              {toast.variant === 'success' ? 'Успешно' : 'Ошибка'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Toast, ToastContainer } from 'react-bootstrap';

import { StartScreen } from '@/components/StartScreen/StartScreen';
import { QuestionsScreen } from '@/components/QuestionsScreen/QuestionsScreen';
import { FinishScreen } from '@/components/FinishScreen/FinishScreen';
import { routes } from '@/slices/routerSlice';

export default function App() {
  const path = useSelector((state) => state.router.path);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  let CurrentScreen;
  switch (path) {
    case routes.QUESTIONS:
      CurrentScreen = QuestionsScreen;
      break;
    case routes.FINISH_SCREEN:
      CurrentScreen = FinishScreen;
      break;
    default:
      CurrentScreen = StartScreen;
  }

  return (
    <>
      <Container>
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

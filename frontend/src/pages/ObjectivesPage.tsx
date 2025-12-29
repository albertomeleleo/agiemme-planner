import { Container } from '@chakra-ui/react';
import { OKRDashboard } from '../components/OKRDashboard';

/**
 * ObjectivesPage Component
 * Main page for viewing objectives
 */

export function ObjectivesPage(): JSX.Element {
  return (
    <Container maxW="container.xl" py={8}>
      <OKRDashboard />
    </Container>
  );
}

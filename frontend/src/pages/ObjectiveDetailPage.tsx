import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Spinner,
  Center,
  useToast,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { FiArrowLeft, FiEdit, FiTrash2, FiCalendar } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { KeyResultProgress } from '../components/KeyResultProgress';
import {
  ObjectiveWithKeyResults,
  getObjective,
  deleteObjective,
  getCategoryLabel,
} from '../services/objectives-api';

/**
 * ObjectiveDetailPage Component
 * Detailed view of a single objective with all key results
 */

export function ObjectiveDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [objective, setObjective] = useState<ObjectiveWithKeyResults | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (id) {
      loadObjective(id);
    }
  }, [id]);

  const loadObjective = async (objectiveId: string) => {
    try {
      setLoading(true);
      const data = await getObjective(objectiveId);
      setObjective(data);
    } catch (error) {
      toast({
        title: 'Error loading objective',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/objectives');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!objective || !window.confirm('Are you sure you want to delete this objective?')) {
      return;
    }

    try {
      await deleteObjective(objective.id);
      toast({
        title: 'Objective deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/objectives');
    } catch (error) {
      toast({
        title: 'Error deleting objective',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!objective) {
    return <></>;
  }

  // Calculate overall progress
  const overallProgress =
    objective.keyResults.length > 0
      ? objective.keyResults.reduce((sum, kr) => sum + kr.completionPercentage, 0) /
        objective.keyResults.length
      : 0;

  // Format target date
  const targetDate = new Date(objective.targetDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Category colors
  const categoryColors: Record<string, string> = {
    career: 'blue',
    health: 'green',
    relationships: 'pink',
    skills: 'purple',
    financial: 'orange',
    personal: 'teal',
  };

  const categoryColor = categoryColors[objective.category] || 'gray';

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="stretch" spacing={6}>
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/objectives')}>Objectives</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{objective.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              <Button
                leftIcon={<Icon as={FiArrowLeft} />}
                variant="ghost"
                onClick={() => navigate('/objectives')}
              >
                Back
              </Button>
              <HStack>
                <Button
                  leftIcon={<Icon as={FiEdit} />}
                  variant="outline"
                  onClick={() => navigate(`/objectives/${objective.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  leftIcon={<Icon as={FiTrash2} />}
                  colorScheme="red"
                  variant="outline"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </HStack>
            </HStack>

            <VStack align="start" spacing={3}>
              <HStack>
                <Badge colorScheme={categoryColor}>{getCategoryLabel(objective.category)}</Badge>
                <Badge colorScheme={objective.status === 'active' ? 'blue' : 'gray'}>
                  {objective.status}
                </Badge>
              </HStack>

              <Heading size="xl">{objective.title}</Heading>

              {objective.description && <Text color="gray.600">{objective.description}</Text>}

              <HStack spacing={6} color="gray.600">
                <HStack>
                  <Icon as={FiCalendar} />
                  <Text>Target: {targetDate}</Text>
                </HStack>
                <Text fontWeight="bold">
                  Overall Progress: {Math.round(overallProgress)}%
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* Key Results */}
        <Box>
          <Heading size="md" mb={4}>
            Key Results ({objective.keyResults.length})
          </Heading>
          <VStack align="stretch" spacing={3}>
            {objective.keyResults.map((keyResult) => (
              <KeyResultProgress
                key={keyResult.id}
                keyResult={keyResult}
                onUpdateProgress={() => {
                  // TODO: Open update progress modal
                  toast({
                    title: 'Feature coming soon',
                    description: 'Progress update dialog will be implemented',
                    status: 'info',
                    duration: 3000,
                  });
                }}
              />
            ))}
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

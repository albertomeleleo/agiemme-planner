import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Button,
  HStack,
  Select,
  Text,
  Spinner,
  Center,
  VStack,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { ObjectiveCard } from './ObjectiveCard';
import {
  ObjectiveWithKeyResults,
  ObjectiveCategory,
  ObjectiveStatus,
  getObjectives,
} from '../services/objectives-api';

/**
 * OKRDashboard Component
 * Main dashboard for viewing and managing objectives
 */

export function OKRDashboard(): JSX.Element {
  const [objectives, setObjectives] = useState<ObjectiveWithKeyResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<ObjectiveCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<ObjectiveStatus | ''>('');
  const navigate = useNavigate();
  const toast = useToast();

  // Load objectives
  useEffect(() => {
    loadObjectives();
  }, [categoryFilter, statusFilter]);

  const loadObjectives = async () => {
    try {
      setLoading(true);
      const filters: { category?: ObjectiveCategory; status?: ObjectiveStatus } = {};
      if (categoryFilter) filters.category = categoryFilter;
      if (statusFilter) filters.status = statusFilter;

      const data = await getObjectives(filters);
      setObjectives(data);
    } catch (error) {
      toast({
        title: 'Error loading objectives',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleObjectiveClick = (id: string) => {
    navigate(`/objectives/${id}`);
  };

  const handleCreateObjective = () => {
    navigate('/objectives/new');
  };

  return (
    <Box>
      {/* Header */}
      <VStack align="stretch" spacing={4} mb={6}>
        <HStack justify="space-between">
          <Heading size="lg">My Objectives</Heading>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="blue"
            onClick={handleCreateObjective}
          >
            New Objective
          </Button>
        </HStack>

        {/* Filters */}
        <HStack spacing={3}>
          <Icon as={FiFilter} color="gray.500" />
          <Select
            placeholder="All categories"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ObjectiveCategory | '')}
            maxW="200px"
            size="sm"
          >
            <option value="career">Career</option>
            <option value="health">Health</option>
            <option value="relationships">Relationships</option>
            <option value="skills">Skills</option>
            <option value="financial">Financial</option>
            <option value="personal">Personal</option>
          </Select>

          <Select
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ObjectiveStatus | '')}
            maxW="200px"
            size="sm"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
            <option value="abandoned">Abandoned</option>
          </Select>
        </HStack>
      </VStack>

      {/* Content */}
      {loading ? (
        <Center py={10}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : objectives.length === 0 ? (
        <Center py={10}>
          <VStack spacing={3}>
            <Text color="gray.500" fontSize="lg">
              No objectives found
            </Text>
            <Button colorScheme="blue" variant="outline" onClick={handleCreateObjective}>
              Create your first objective
            </Button>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {objectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              onClick={() => handleObjectiveClick(objective.id)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

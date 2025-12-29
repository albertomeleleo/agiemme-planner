import { Box, Heading, Text, Badge, Progress, HStack, VStack, Icon } from '@chakra-ui/react';
import { FiCalendar, FiTarget } from 'react-icons/fi';
import { ObjectiveWithKeyResults, getCategoryLabel } from '../services/objectives-api';

/**
 * ObjectiveCard Component
 * Displays objective summary with key results progress
 */

interface ObjectiveCardProps {
  objective: ObjectiveWithKeyResults;
  onClick?: () => void;
}

export function ObjectiveCard({ objective, onClick }: ObjectiveCardProps): JSX.Element {
  // Calculate overall progress (average of key results)
  const overallProgress =
    objective.keyResults.length > 0
      ? objective.keyResults.reduce((sum, kr) => sum + kr.completionPercentage, 0) /
        objective.keyResults.length
      : 0;

  // Format target date
  const targetDate = new Date(objective.targetDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Get category color
  const categoryColors: Record<string, string> = {
    career: 'blue',
    health: 'green',
    relationships: 'pink',
    skills: 'purple',
    financial: 'orange',
    personal: 'teal',
  };

  const categoryColor = categoryColors[objective.category] || 'gray';

  // Get status color
  const statusColors: Record<string, string> = {
    active: 'blue',
    completed: 'green',
    archived: 'gray',
    abandoned: 'red',
  };

  const statusColor = statusColors[objective.status] || 'gray';

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      shadow="sm"
      _hover={{ shadow: 'md', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={3}>
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <HStack>
              <Badge colorScheme={categoryColor}>{getCategoryLabel(objective.category)}</Badge>
              <Badge colorScheme={statusColor}>{objective.status}</Badge>
            </HStack>
            <Heading size="md">{objective.title}</Heading>
          </VStack>
        </HStack>

        {/* Description */}
        {objective.description && (
          <Text color="gray.600" fontSize="sm" noOfLines={2}>
            {objective.description}
          </Text>
        )}

        {/* Progress */}
        <Box>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="sm" fontWeight="medium">
              Overall Progress
            </Text>
            <Text fontSize="sm" fontWeight="bold" color={categoryColor + '.500'}>
              {Math.round(overallProgress)}%
            </Text>
          </HStack>
          <Progress
            value={overallProgress}
            colorScheme={categoryColor}
            size="sm"
            borderRadius="full"
          />
        </Box>

        {/* Footer */}
        <HStack justify="space-between" fontSize="sm" color="gray.600">
          <HStack>
            <Icon as={FiTarget} />
            <Text>
              {objective.keyResults.length} Key Result{objective.keyResults.length !== 1 ? 's' : ''}
            </Text>
          </HStack>
          <HStack>
            <Icon as={FiCalendar} />
            <Text>{targetDate}</Text>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
}

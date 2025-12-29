import {
  Box,
  Text,
  Progress,
  HStack,
  VStack,
  Badge,
  Icon,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { KeyResult, getKeyResultStatusLabel } from '../services/objectives-api';
import { getStatusColor, getDaysUntilDeadline } from '../services/key-results-api';

/**
 * KeyResultProgress Component
 * Displays key result with progress bar and status
 */

interface KeyResultProgressProps {
  keyResult: KeyResult;
  onUpdateProgress?: () => void;
  showActions?: boolean;
}

export function KeyResultProgress({
  keyResult,
  onUpdateProgress,
  showActions = true,
}: KeyResultProgressProps): JSX.Element {
  const statusColor = getStatusColor(keyResult.status);
  const daysRemaining = getDaysUntilDeadline(keyResult.deadline);

  // Format deadline
  const deadline = new Date(keyResult.deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Determine deadline color
  const getDeadlineColor = () => {
    if (keyResult.status === 'completed') return 'green.600';
    if (daysRemaining < 0) return 'red.600';
    if (daysRemaining < 7) return 'orange.600';
    if (daysRemaining < 14) return 'yellow.700';
    return 'gray.600';
  };

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderRadius="md"
      p={3}
      borderLeftWidth="4px"
      borderLeftColor={`${statusColor}.500`}
    >
      <VStack align="stretch" spacing={2}>
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="medium">{keyResult.description}</Text>
            <HStack spacing={2}>
              <Badge colorScheme={statusColor}>{getKeyResultStatusLabel(keyResult.status)}</Badge>
              <HStack spacing={1} fontSize="xs" color="gray.600">
                <Icon as={FiCalendar} />
                <Text color={getDeadlineColor()}>{deadline}</Text>
                {daysRemaining >= 0 && (
                  <Text color={getDeadlineColor()}>
                    ({daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left)
                  </Text>
                )}
                {daysRemaining < 0 && (
                  <Text color={getDeadlineColor()}>
                    (overdue by {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? 's' : ''})
                  </Text>
                )}
              </HStack>
            </HStack>
          </VStack>

          {showActions && onUpdateProgress && (
            <Tooltip label="Update progress">
              <IconButton
                aria-label="Update progress"
                icon={<Icon as={FiTrendingUp} />}
                size="sm"
                variant="ghost"
                onClick={onUpdateProgress}
              />
            </Tooltip>
          )}
        </HStack>

        {/* Progress bar */}
        <Box>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="sm" color="gray.600">
              {keyResult.currentValue.toLocaleString()} / {keyResult.targetValue.toLocaleString()}{' '}
              {keyResult.unit}
            </Text>
            <Text fontSize="sm" fontWeight="bold" color={`${statusColor}.600`}>
              {Math.round(keyResult.completionPercentage)}%
            </Text>
          </HStack>
          <Progress
            value={keyResult.completionPercentage}
            colorScheme={statusColor}
            size="sm"
            borderRadius="full"
            hasStripe={keyResult.status === 'in_progress'}
            isAnimated={keyResult.status === 'in_progress'}
          />
        </Box>
      </VStack>
    </Box>
  );
}

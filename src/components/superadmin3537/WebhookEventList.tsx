import React from 'react';
import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Text,
    VStack,
    HStack,
    Badge,
    Icon,
    useColorModeValue,
    IconButton,
    Tooltip
} from '@chakra-ui/react';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

interface WebhookEvent {
    id: string;
    event_type: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
    retry_count?: number;
}

interface WebhookEventListProps {
    events: WebhookEvent[];
    onRetry?: (eventId: string) => void;
}

const WebhookEventList: React.FC<WebhookEventListProps> = ({ events, onRetry }) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return CheckCircle;
            case 'failed':
                return XCircle;
            case 'pending':
                return Clock;
            default:
                return Clock;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'green';
            case 'failed':
                return 'red';
            case 'pending':
                return 'yellow';
            default:
                return 'gray';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Tamamlandı';
            case 'failed':
                return 'Başarısız';
            case 'pending':
                return 'Bekliyor';
            default:
                return status;
        }
    };

    return (
        <Card bg={bg} borderColor={borderColor} borderWidth="1px" shadow="sm">
            <CardHeader>
                <Text fontWeight="bold" fontSize="lg">
                    Webhook Events
                </Text>
            </CardHeader>
            <CardBody pt={0}>
                <VStack align="stretch" spacing={2}>
                    {events.length === 0 ? (
                        <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                            Henüz webhook event bulunmuyor
                        </Text>
                    ) : (
                        events.map((event) => (
                            <HStack
                                key={event.id}
                                justify="space-between"
                                p={3}
                                bg={hoverBg}
                                borderRadius="lg"
                                _hover={{ bg: hoverBg }}
                            >
                                <HStack spacing={3} flex={1}>
                                    <Icon
                                        as={getStatusIcon(event.status)}
                                        color={`${getStatusColor(event.status)}.500`}
                                        boxSize={5}
                                    />
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" fontWeight="medium">
                                            {event.event_type}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            {new Date(event.created_at).toLocaleString('tr-TR')}
                                        </Text>
                                    </VStack>
                                </HStack>

                                <HStack spacing={2}>
                                    <Badge colorScheme={getStatusColor(event.status)} variant="subtle">
                                        {getStatusText(event.status)}
                                    </Badge>
                                    {event.retry_count !== undefined && event.retry_count > 0 && (
                                        <Badge colorScheme="orange" variant="subtle">
                                            {event.retry_count} retry
                                        </Badge>
                                    )}
                                    {event.status === 'failed' && onRetry && (
                                        <Tooltip label="Tekrar Dene">
                                            <IconButton
                                                aria-label="Retry webhook"
                                                icon={<RefreshCw size={16} />}
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="blue"
                                                onClick={() => onRetry(event.id)}
                                            />
                                        </Tooltip>
                                    )}
                                </HStack>
                            </HStack>
                        ))
                    )}
                </VStack>
            </CardBody>
        </Card>
    );
};

export default WebhookEventList;

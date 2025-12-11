import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';

type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Box p={8}>
          <Heading size="md" mb={3}>Bir şeyler ters gitti</Heading>
          <Text mb={4}>{String(this.state.error ?? 'Bilinmeyen hata')}</Text>
          <Button onClick={() => location.reload()}>Sayfayı Yenile</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
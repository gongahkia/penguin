import React, { Suspense } from 'react';
import './LazyWrapper.css';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

const DefaultFallback: React.FC = () => (
  <div className="lazy-wrapper-loading">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="lazy-wrapper-error">
    <h3>Failed to load component</h3>
    <p>{error?.message || 'An unexpected error occurred'}</p>
    <button onClick={() => window.location.reload()}>Retry</button>
  </div>
);

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error?: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyWrapper Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <DefaultFallback />,
  errorFallback = <DefaultErrorFallback />
}) => {
  return (
    <ErrorBoundary fallback={() => errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyWrapper;
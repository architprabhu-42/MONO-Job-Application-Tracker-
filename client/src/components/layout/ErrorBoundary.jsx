import { Component } from 'react';
import ErrorState from '../ui/ErrorState.jsx';

// Shows a friendly message instead of a blank screen if a page crashes while rendering.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="not-found">
        <ErrorState
          title="Something went wrong"
          message="This page ran into an unexpected problem. Reloading usually fixes it."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }
}

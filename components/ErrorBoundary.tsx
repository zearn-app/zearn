import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full border border-gray-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-6 text-sm">
              We encountered an unexpected error. Please try reloading the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-black transition shadow-lg active:scale-95"
            >
              <RefreshCw size={18} />
              <span>Reload App</span>
            </button>
            {this.state.error && (
                <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-left text-gray-500 overflow-auto max-h-32">
                    <p className="font-semibold mb-1">Error Details:</p>
                    {this.state.error.toString()}
                </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
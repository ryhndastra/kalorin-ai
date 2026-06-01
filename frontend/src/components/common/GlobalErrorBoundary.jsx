import React from "react";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Global UI error:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#eefaf1] flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              Please refresh the page or check your internet connection.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 w-full rounded-2xl bg-[#22C55E] py-3 font-semibold text-white hover:bg-[#1eb053] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

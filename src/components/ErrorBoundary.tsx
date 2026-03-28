import * as React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-8 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto border border-red-600/50">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">SOMETHING WENT WRONG</h1>
              <p className="text-zinc-500 font-medium">
                The application encountered an unexpected error. This might be due to a synchronization issue or a temporary network failure.
              </p>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-left overflow-auto max-h-40">
              <code className="text-xs text-red-400 font-mono">
                {this.state.error?.message}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-black py-4 px-6 rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
            >
              <RefreshCcw className="w-5 h-5" />
              RELOAD APPLICATION
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

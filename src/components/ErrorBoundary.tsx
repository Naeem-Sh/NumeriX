import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Download, RefreshCw, ShieldCheck } from 'lucide-react';
import { downloadWorkspaceBackup } from '../utils/storage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NumeriX ErrorBoundary caught an unhandled display error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleEmergencyBackup = () => {
    downloadWorkspaceBackup();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          id="error-boundary-screen"
          className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#dedbd2] text-stone-900 font-sans"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border-2 border-stone-300 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-5">
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Title & Assurance */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Display Recovery Mode
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your calculation data and audit records are safe</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                An unexpected display issue occurred. Your stored calculations, tape history, and accounting preferences have been preserved in local storage.
              </p>
            </div>

            {/* Error Message Snippet */}
            {this.state.error && (
              <div className="w-full p-3 rounded-xl bg-stone-100 border border-stone-200 text-left overflow-x-auto text-[11px] font-mono text-stone-700 max-h-24">
                <strong>Error:</strong> {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="emergency-backup-btn"
                type="button"
                onClick={this.handleEmergencyBackup}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Emergency Backup</span>
              </button>

              <button
                id="reset-display-btn"
                type="button"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-900 border border-stone-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Display & Reload</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-500 pt-1">
              NumeriX Financial Calculator • IOOC-ShirazOffice
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { Component } from "react";

/**
 * Garde-fou d'erreur global (doc 19 §4.2) — utilisé 2 fois :
 * ShellBoundary (autour des shells) et FeatureBoundary (autour de chaque page).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erreur: null };
  }

  static getDerivedStateFromError(erreur) {
    return { erreur };
  }

  render() {
    if (this.state.erreur) {
      return (
        <div className="panel p-8 m-5 max-w-lg" role="alert">
          <div className="kente-band rounded-t-md -mx-8 -mt-8 mb-6" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Une erreur est survenue
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            La section « {this.props.label} » n'a pas pu s'afficher. Tu peux réessayer —
            si le problème persiste, signale-le à l'administration.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center rounded-[var(--radius-chip)] bg-[var(--accent-green)] px-4 py-2 text-sm font-semibold text-[var(--emsp-cream)] hover:bg-[var(--emsp-green-bright)]"
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

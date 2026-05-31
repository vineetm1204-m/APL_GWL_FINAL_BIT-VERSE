/**
 * App Component
 * ---------------
 * Root application component combining providers and router.
 */

import { AppProviders } from './Providers';
import { AppRouter } from './Router';

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

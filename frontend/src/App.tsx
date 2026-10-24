import { AppProviders } from "./app/components/AppProviders/AppProviders";
import { Layout } from "./app/components/Layout/Layout";
import { PlannerPage } from "./app/views/PlannerPage";

export default function App() {
  return (
    <AppProviders>
      <Layout>
        <PlannerPage />
      </Layout>
    </AppProviders>
  );
}

import { Loader2 } from "lucide-react";
import { useStore } from "./store/useStore";
import Layout from "./components/Layout";
import Stepper from "./components/Stepper";
import ProjectsList from "./components/ProjectsList";
import WorksList from "./components/WorksList";
import InitStep from "./components/steps/InitStep";
import AnalyzeStep from "./components/steps/AnalyzeStep";
import ScenarioStep from "./components/steps/ScenarioStep";
import GenerateStep from "./components/steps/GenerateStep";
import EditorStep from "./components/steps/EditorStep";
import ProviderSettings from "./components/settings/ProviderSettings";
import ToastContainer from "./components/ui/Toast";

function StepContent() {
  const { currentStep } = useStore();

  switch (currentStep) {
    case 0: return <InitStep />;
    case 1: return <AnalyzeStep />;
    case 2: return <ScenarioStep />;
    case 3: return <GenerateStep />;
    case 4: return <EditorStep />;
  }
}

export default function App() {
  const { currentProjectId, currentWorkId, loadingProject } = useStore();

  if (currentProjectId === null) {
    return (
    <Layout>
      <ProjectsList />
      <ProviderSettings />
      <ToastContainer />
    </Layout>
  );
  }

  if (currentWorkId === null) {
    return (
    <Layout>
      <WorksList projectId={currentProjectId} />
      <ProviderSettings />
      <ToastContainer />
    </Layout>
  );
  }

  if (loadingProject) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
          <p className="text-gray-400">Loading work...</p>
        </div>
        <ProviderSettings />
        <ToastContainer />
      </Layout>
    );
  }

  return (
    <Layout>
      <Stepper />
      <StepContent />
      <ProviderSettings />
      <ToastContainer />
    </Layout>
  );
}

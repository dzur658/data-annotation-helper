import { useState } from "react";

import BackButton from "../../../../_components/back_button";
import NewButton from "../../../../_components/button";
import ResponsePanel from "./response_panel";

export interface ResponseEditorProps {
  taskId: number;

  // for flip to flag workspace after initiating citation check
  onCompleted: () => void;
}

export default function ResponseEditor({ taskId, onCompleted }: ResponseEditorProps) {
  const [responseA, setResponseA] = useState("");
  const [responseB, setResponseB] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ensure both responses are non-empty before allowing submission
  const canSubmit = Boolean(responseA.trim()) && Boolean(responseB.trim()) && !checking;

  const handleCheck = async () => {
    // setChecking(true);
    // try {
    //   // One command that saves the pair AND runs the citation analysis —
    //   // see note below on why not two invokes
    //   await invoke("check_citations", {
    //     taskId,
    //     responseA: labelA,
    //     responseB: labelB,
    //   });
    //   router.refresh(); // or a local refetch — flips the branch to FlagWorkspace
    // } finally {
    //   setChecking(false);
    // }
    console.log('In progress...');
  };

    return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-2xl font-bold tracking-tight text-white">Responses</h1>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ResponsePanel
            label="Response A"
            value={responseA}
            onChange={setResponseA}
            disabled={checking}
            autoFocus
          />
          <ResponsePanel
            label="Response B"
            value={responseB}
            onChange={setResponseB}
            disabled={checking}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <NewButton
            buttonText={checking ? "Checking…" : "Check for Citations"}
            onClick={handleCheck}
            disabled={!canSubmit}
          />
        </div>
      </div>
    </div>
  );
}
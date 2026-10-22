import { useState } from "react";

import { invoke } from "@tauri-apps/api/core";

import { useRouter } from "next/navigation";

import BackButton from "../../../../_components/back_button";
import NewButton from "../../../../_components/button";
import ResponsePanel from "./response_panel";

import type { NewResponsePair, NewResponse } from "../../../../../lib/types";

export interface ResponseEditorProps {
  taskId: number;

  // for flip to flag workspace after initiating citation check
  onCompleted: () => void;
}

export default function ResponseEditor({ taskId, onCompleted }: ResponseEditorProps) {
  const router = useRouter();

  const [responseAText, setResponseAText] = useState<string>("");
  const [responseBText, setResponseBText] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ensure both responses are non-empty before allowing submission
  const canSubmit = Boolean(responseAText.trim()) && Boolean(responseBText.trim()) && !checking;

  const handleCheck = async () => {
    setChecking(true);

    try {
      const newResponseA: NewResponse = {
        responseLabel: "A",
        responseText: responseAText,
      }

      const newResponseB: NewResponse = {
        responseLabel: "B",
        responseText: responseBText,
      }

      const responsePair: NewResponsePair = {
        taskId: taskId,
        responseA: newResponseA,
        responseB: newResponseB,
      }

      const payload = { "pair": responsePair };

      console.log("Submitting response pair:", responsePair);

      // One command that saves the pair AND runs the citation analysis —
      // see note below on why not two invokes
      await invoke("add_response_pair", {
        ...payload,
      });
      router.refresh(); // or a local refetch — flips the branch to FlagWorkspace
    } finally {
      setChecking(false);
    }
    console.log('Fired.');
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
            value={responseAText}
            onChange={setResponseAText}
            disabled={checking}
            autoFocus
          />
          <ResponsePanel
            label="Response B"
            value={responseBText}
            onChange={setResponseBText}
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
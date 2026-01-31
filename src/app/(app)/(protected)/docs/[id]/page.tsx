"use client";

import React from "react";
import { useSearchParams, useParams } from "next/navigation";
import { EditorThemeProvider } from "@/app/(app)/(protected)/docs/[id]/editor";
import EditorContent from "./EditorContent";

// --- Main Page Component ---
const DocEditorPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const docId = params?.id as string;
  const outlineId = searchParams.get("outlineId");

  return (
    <EditorThemeProvider>
      <EditorContent 
        docId={docId}
        outlineId={outlineId}
      />
    </EditorThemeProvider>
  );
};

export default DocEditorPage;

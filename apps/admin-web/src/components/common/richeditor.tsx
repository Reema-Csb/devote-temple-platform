"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentState,
} from "draft-js";
import type { EditorProps } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const Editor = dynamic<EditorProps>(
  async () => {
    const mod = await import("react-draft-wysiwyg");
    return mod.Editor as React.ComponentType<EditorProps>;
  },
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[160px] rounded-xl border border-[#d6b982] bg-white p-4 text-sm text-[#8B7355]">
        Loading editor...
      </div>
    ),
  },
);

type RichEditorProps = {
  value: string;
  onChange: (rawJson: string) => void;
  placeholder?: string;
};

export default function RichEditor({
  value,
  onChange,
  placeholder,
}: RichEditorProps) {
  const [editorState, setEditorState] = useState(() => {
    if (!value) return EditorState.createEmpty();

    try {
      return EditorState.createWithContent(convertFromRaw(JSON.parse(value)));
    } catch {
      return EditorState.createWithContent(ContentState.createFromText(value));
    }
  });

  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;

      try {
        setEditorState(
          value
            ? EditorState.createWithContent(convertFromRaw(JSON.parse(value)))
            : EditorState.createEmpty(),
        );
      } catch {
        setEditorState(
          value
            ? EditorState.createWithContent(ContentState.createFromText(value))
            : EditorState.createEmpty(),
        );
      }
    }
  }, [value]);

  const handleChange = (state: EditorState) => {
    setEditorState(state);

    const content = state.getCurrentContent();

    onChange(content.hasText() ? JSON.stringify(convertToRaw(content)) : "");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#d6b982] bg-white">
      <Editor
        editorState={editorState}
        onEditorStateChange={handleChange}
        placeholder={placeholder}
        toolbar={{
          options: ["inline", "list", "link"],
          inline: { options: ["bold", "italic", "underline"] },
        }}
        editorStyle={{
          padding: "0 12px",
          minHeight: 140,
          fontSize: 14,
        }}
      />
    </div>
  );
}

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { $getRoot, COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND } from "lexical";
import { useEffect } from "react";

import * as styles from "./lexical-agent-editor.module.css";

interface LexicalAgentEditorProps {
  readonly ariaLabel: string;
  readonly clearVersion: number;
  readonly disabled: boolean;
  readonly onChange: (content: string) => void;
  readonly onSubmit: () => void;
  readonly placeholder: string;
}

const editorConfig = {
  namespace: "agent-composer",
  onError(error: Error): never {
    throw error;
  },
};

export function LexicalAgentEditor({
  ariaLabel,
  clearVersion,
  disabled,
  onChange,
  onSubmit,
  placeholder,
}: LexicalAgentEditorProps) {
  return (
    <LexicalComposer initialConfig={{ ...editorConfig, editable: !disabled }}>
      <PlainTextPlugin
        contentEditable={
          <ContentEditable
            aria-label={ariaLabel}
            aria-placeholder={placeholder}
            className={styles.editor}
            placeholder={
              <span className={styles.placeholder}>{placeholder}</span>
            }
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
        placeholder={null}
      />
      <OnChangePlugin
        ignoreSelectionChange
        onChange={(editorState) => {
          editorState.read(() => onChange($getRoot().getTextContent()));
        }}
      />
      <EnterSubmitPlugin disabled={disabled} onSubmit={onSubmit} />
      <EditablePlugin disabled={disabled} />
      <ClearEditorPlugin clearVersion={clearVersion} />
    </LexicalComposer>
  );
}

function EnterSubmitPlugin({
  disabled,
  onSubmit,
}: Pick<LexicalAgentEditorProps, "disabled" | "onSubmit">) {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (event?.shiftKey || disabled) return false;
          event?.preventDefault();
          onSubmit();
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    [disabled, editor, onSubmit],
  );

  return null;
}

function ClearEditorPlugin({
  clearVersion,
}: Pick<LexicalAgentEditorProps, "clearVersion">) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (clearVersion === 0) return;
    editor.update(() => $getRoot().clear());
  }, [clearVersion, editor]);

  return null;
}

function EditablePlugin({
  disabled,
}: Pick<LexicalAgentEditorProps, "disabled">) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => editor.setEditable(!disabled), [disabled, editor]);

  return null;
}

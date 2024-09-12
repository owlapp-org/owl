import { EditorView } from "@uiw/react-codemirror";

export const getSelectedLines = (view: EditorView): string[] => {
  const state = view.state;
  const selection = state.selection.main;
  const doc = state.doc;

  const startLine = doc.lineAt(selection.from).number;
  const endLine = doc.lineAt(selection.to).number;

  // If no text is selected (cursor is on a single line), return an empty array
  if (selection.from === selection.to) {
    return [];
  }

  let selectedLines = [];
  for (let i = startLine; i <= endLine; i++) {
    selectedLines.push(doc.line(i).text);
  }

  return selectedLines;
};

export const getSelection = (view: EditorView): string => {
  const state = view.state;
  const selection = state.selection.main;
  const doc = state.doc;

  // If no text is selected (cursor is on a single line), return an empty string
  if (selection.from === selection.to) {
    return "";
  }

  // Extract the selected text from the document
  const selectedText = doc.sliceString(selection.from, selection.to);

  return selectedText;
};

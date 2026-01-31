import { CodeContentSchema, type CodeContent } from "@/types";

export const createCodeContent = (): CodeContent => ({
  type: "code",
  language: "javascript",
  code: `function greet(name) {
  return \`Hello, \${name}!\`;
}`,
  showLineNumbers: true,
  theme: "light",
});

export const normalizeCodeContent = (content: any): CodeContent => {
  const result = CodeContentSchema.safeParse(content);
  if (result.success) {
    return result.data;
  }
  
  return createCodeContent();
};

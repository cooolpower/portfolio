import { inlineTextHighlight } from "@/components/ui/typography.css";

export function parseHighlight(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <strong key={index} className={inlineTextHighlight}>
          {part}
        </strong>
      );
    }
    return part;
  });
}

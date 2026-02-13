import type { ThreadNode } from "@/lib/data/question-thread";
import { QuestionCard } from "./question-card";

type QuestionThreadGroupProps = {
  node: ThreadNode;
};

export function QuestionThreadGroup({ node }: QuestionThreadGroupProps) {
  return (
    <div>
      <QuestionCard question={node.question} conditionallyHidden={node.conditionallyHidden} />

      {node.children.length > 0 && (
        <div className="ml-6 mt-2 space-y-2 border-l-2 border-primary/20 pl-4">
          {node.children.map((child) => (
            <QuestionCard
              key={child.question.index}
              question={child.question}
              conditionallyHidden={child.conditionallyHidden}
            />
          ))}
        </div>
      )}
    </div>
  );
}

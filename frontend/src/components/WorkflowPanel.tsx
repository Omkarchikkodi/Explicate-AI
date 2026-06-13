interface Props {
  steps: string[];
}

export default function WorkflowPanel({ steps }: Props) {
  if (!steps.length) return null;

  return (
    <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="font-semibold mb-3">
        Agent Workflow
      </h3>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isCurrent =
            idx === steps.length - 1;

          return (
            <div
              key={idx}
              className="flex items-center gap-3"
            >
              {isCurrent ? (
                <div
                  className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"
                />
              ) : (
                <div
                  className="w-3 h-3 rounded-full bg-green-500"
                />
              )}

              <span
                className={
                  isCurrent
                    ? "font-medium text-blue-600"
                    : "text-gray-700"
                }
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
interface Props {
  steps: number;
}

export default function ResearchStats({ steps }: Props) {
  return (
    <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="font-semibold mb-4">
        Research Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-2xl font-bold text-blue-600">
            {steps}
          </p>
          <p className="text-sm text-gray-500">
            Workflow Steps
          </p>
        </div>

        <div>
          <p className="text-2xl font-bold text-green-600">
            1
          </p>
          <p className="text-sm text-gray-500">
            AI Calls
          </p>
        </div>

        <div>
          <p className="text-2xl font-bold text-orange-600">
            3
          </p>
          <p className="text-sm text-gray-500">
            Sources Read
          </p>
        </div>

        <div>
          <p className="text-2xl font-bold text-purple-600">
            Agentic
          </p>
          <p className="text-sm text-gray-500">
            Mode
          </p>
        </div>
      </div>
    </div>
  );
}
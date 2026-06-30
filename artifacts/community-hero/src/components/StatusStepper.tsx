import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { IssueStatus } from "@workspace/api-client-react";

const steps = [
  { id: IssueStatus.reported, label: "Reported" },
  { id: IssueStatus.verified, label: "Verified" },
  { id: IssueStatus.in_progress, label: "In Progress" },
  { id: IssueStatus.resolved, label: "Resolved" },
];

export function StatusStepper({ currentStatus }: { currentStatus: IssueStatus }) {
  const currentIndex = steps.findIndex((s) => s.id === currentStatus);

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between w-full">
        {/* Background track */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full overflow-hidden">
          {/* Progress fill */}
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="relative flex flex-col items-center group">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? "hsl(var(--primary))" : "hsl(var(--muted))",
                  borderColor: isCompleted ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  scale: isCurrent ? 1.2 : 1,
                }}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 
                  ${isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </motion.div>
              <div className="absolute top-10 text-center w-24 -ml-8">
                <span className={`text-xs font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

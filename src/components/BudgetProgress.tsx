import { formatCurrency } from '../domain/accounting';
import { cn } from '../utils/ui';

interface BudgetProgressProps {
  currentSpent: number;
  limitAmount: number;
  compact?: boolean;
}

export function BudgetProgress({ currentSpent, limitAmount, compact = false }: BudgetProgressProps) {
  const percentage = Math.min((currentSpent / limitAmount) * 100, 100);
  const isOver = currentSpent > limitAmount;

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium text-gray-700">{formatCurrency(currentSpent)}</span>
          <span className="text-gray-400">of {formatCurrency(limitAmount)}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
              isOver ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{formatCurrency(currentSpent)} spent</span>
        <span className="text-gray-500">of {formatCurrency(limitAmount)}</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500",
            isOver ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-end">
        <p className="text-right text-xs text-gray-400">
          {isOver ? 'Over budget' : `${(100 - percentage).toFixed(0)}% remaining`}
        </p>
      </div>
    </div>
  );
}

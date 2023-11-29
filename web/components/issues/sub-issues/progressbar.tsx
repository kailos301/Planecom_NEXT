export interface IProgressBar {
  total: number;
  done: number;
}

export const ProgressBar = ({ total = 0, done = 0 }: IProgressBar) => {
  const calPercentage = (doneValue: number, totalValue: number): string => {
    if (doneValue === 0 || totalValue === 0) return (0).toFixed(0);
    return ((100 * doneValue) / totalValue).toFixed(0);
  };

  return (
    <div className="relative flex items-center gap-2">
      <div className="w-full">
        <div className="w-full rounded-full bg-custom-background-80 overflow-hidden shadow">
          <div
            className="bg-green-500 h-[6px] rounded-full transition-all"
            style={{ width: `${calPercentage(done, total)}%` }}
          />
        </div>
      </div>
      <div className="flex-shrink-0 text-xs font-medium">{calPercentage(done, total)}% Done</div>
    </div>
  );
};

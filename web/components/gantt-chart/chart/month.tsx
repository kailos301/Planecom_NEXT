import { FC } from "react";

// hooks
import { useChart } from "../hooks";
// types
import { IMonthBlock } from "../views";

export const MonthChartView: FC<any> = () => {
  const { currentViewData, renderView } = useChart();

  const monthBlocks: IMonthBlock[] = renderView;

  return (
    <>
      <div className="absolute flex h-full flex-grow divide-x divide-custom-border-100/50">
        {monthBlocks &&
          monthBlocks.length > 0 &&
          monthBlocks.map((block, _idxRoot) => (
            <div key={`month-${block?.month}-${block?.year}`} className="relative flex flex-col">
              <div className="h-[60px] w-full">
                <div className="relative h-[30px]">
                  <div className="sticky left-0 inline-flex whitespace-nowrap px-3 py-2 text-xs font-medium capitalize">
                    {block?.title}
                  </div>
                </div>

                <div className="flex w-full h-[30px]">
                  {block?.children &&
                    block?.children.length > 0 &&
                    block?.children.map((monthDay, _idx) => (
                      <div
                        key={`sub-title-${_idxRoot}-${_idx}`}
                        className="flex-shrink-0 border-b py-1 text-center capitalize border-custom-border-200"
                        style={{ width: `${currentViewData?.data.width}px` }}
                      >
                        <div className="text-xs space-x-1">
                          <span className="text-custom-text-200">{monthDay.dayData.shortTitle[0]}</span>{" "}
                          <span className={monthDay.today ? "bg-custom-primary-100 text-white px-1 rounded-full" : ""}>
                            {monthDay.day}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex h-full w-full divide-x divide-custom-border-100/50">
                {block?.children &&
                  block?.children.length > 0 &&
                  block?.children.map((monthDay, _idx) => (
                    <div
                      key={`column-${_idxRoot}-${_idx}`}
                      className="relative flex h-full flex-col overflow-hidden whitespace-nowrap"
                      style={{ width: `${currentViewData?.data.width}px` }}
                    >
                      <div
                        className={`relative h-full w-full flex-1 flex justify-center ${
                          ["sat", "sun"].includes(monthDay?.dayData?.shortTitle || "") ? `bg-custom-background-90` : ``
                        }`}
                      >
                        {/* {monthDay?.today && (
                          <div className="absolute top-0 bottom-0 w-[1px] bg-red-500" />
                        )} */}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

import React from "react";

// ui
import { LineGraph } from "components/ui";
// helpers
import { getDatesInRange, renderShortNumericDateFormat } from "helpers/date-time.helper";
//types
import { TCompletionChartDistribution } from "types";

type Props = {
  distribution: TCompletionChartDistribution;
  startDate: string | Date;
  endDate: string | Date;
  totalIssues: number;
};

const styleById = {
  ideal: {
    strokeDasharray: "6, 3",
    strokeWidth: 1,
  },
  default: {
    strokeWidth: 1,
  },
};

const DashedLine = ({ series, lineGenerator, xScale, yScale }: any) =>
  series.map(({ id, data, color }: any) => (
    <path
      key={id}
      d={lineGenerator(
        data.map((d: any) => ({
          x: xScale(d.data.x),
          y: yScale(d.data.y),
        }))
      )}
      fill="none"
      stroke={color ?? "#ddd"}
      style={styleById[id as keyof typeof styleById] || styleById.default}
    />
  ));

const ProgressChart: React.FC<Props> = ({ distribution, startDate, endDate, totalIssues }) => {
  const chartData = Object.keys(distribution).map((key) => ({
    currentDate: renderShortNumericDateFormat(key),
    pending: distribution[key],
  }));

  const generateXAxisTickValues = () => {
    const dates = getDatesInRange(startDate, endDate);

    const maxDates = 4;
    const totalDates = dates.length;

    if (totalDates <= maxDates) return dates.map((d) => renderShortNumericDateFormat(d));
    else {
      const interval = Math.ceil(totalDates / maxDates);
      const limitedDates = [];

      for (let i = 0; i < totalDates; i += interval) limitedDates.push(renderShortNumericDateFormat(dates[i]));

      if (!limitedDates.includes(renderShortNumericDateFormat(dates[totalDates - 1])))
        limitedDates.push(renderShortNumericDateFormat(dates[totalDates - 1]));

      return limitedDates;
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      <LineGraph
        animate
        curve="monotoneX"
        height="160px"
        width="100%"
        enableGridY={false}
        lineWidth={1}
        margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
        data={[
          {
            id: "pending",
            color: "#3F76FF",
            data: chartData.map((item, index) => ({
              index,
              x: item.currentDate,
              y: item.pending,
              color: "#3F76FF",
            })),
            enableArea: true,
          },
          {
            id: "ideal",
            color: "#a9bbd0",
            fill: "transparent",
            data:
              chartData.length > 0
                ? [
                    {
                      x: chartData[0].currentDate,
                      y: totalIssues,
                    },
                    {
                      x: chartData[chartData.length - 1].currentDate,
                      y: 0,
                    },
                  ]
                : [],
          },
        ]}
        layers={["grid", "markers", "areas", DashedLine, "slices", "points", "axes", "legends"]}
        axisBottom={{
          tickValues: generateXAxisTickValues(),
        }}
        enablePoints={false}
        enableArea
        colors={(datum) => datum.color ?? "#3F76FF"}
        customYAxisTickValues={[0, totalIssues]}
        gridXValues={chartData.map((item, index) => (index % 2 === 0 ? item.currentDate : ""))}
        enableSlices="x"
        sliceTooltip={(datum) => (
          <div className="rounded-md border border-custom-border-200 bg-custom-background-80 p-2 text-xs">
            {datum.slice.points[0].data.yFormatted}
            <span className="text-custom-text-200"> issues pending on </span>
            {datum.slice.points[0].data.xFormatted}
          </div>
        )}
        theme={{
          background: "transparent",
          axis: {
            domain: {
              line: {
                stroke: "rgb(var(--color-border))",
                strokeWidth: 1,
              },
            },
          },
        }}
      />
    </div>
  );
};

export default ProgressChart;

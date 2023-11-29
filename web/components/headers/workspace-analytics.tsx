import { useRouter } from "next/router";
import { ArrowLeft, BarChart2 } from "lucide-react";
// ui
import { Breadcrumbs } from "@plane/ui";

export const WorkspaceAnalyticsHeader = () => {
  const router = useRouter();

  return (
    <>
      <div
        className={`relative flex w-full flex-shrink-0 flex-row z-10 h-[3.75rem] items-center justify-between gap-x-2 gap-y-4 border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4`}
      >
        <div className="flex items-center gap-2 flex-grow w-full whitespace-nowrap overflow-ellipsis">
          <div className="block md:hidden">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded border border-custom-border-200"
              onClick={() => router.back()}
            >
              <ArrowLeft fontSize={14} strokeWidth={2} />
            </button>
          </div>
          <div>
            <Breadcrumbs>
              <Breadcrumbs.BreadcrumbItem
                type="text"
                icon={<BarChart2 className="h-4 w-4 text-custom-text-300" />}
                label="Analytics"
              />
            </Breadcrumbs>
          </div>
        </div>
      </div>
    </>
  );
};

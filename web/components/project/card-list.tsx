import { FC } from "react";
import { observer } from "mobx-react-lite";
// lib
import { useMobxStore } from "lib/mobx/store-provider";
// components
import { ProjectCard } from "components/project";
import { EmptyState } from "components/common";
import { Loader } from "@plane/ui";
// images
import emptyProject from "public/empty-state/project.svg";
// icons
import { Plus } from "lucide-react";

export interface IProjectCardList {
  workspaceSlug: string;
}

export const ProjectCardList: FC<IProjectCardList> = observer((props) => {
  const { workspaceSlug } = props;
  // store
  const { project: projectStore, commandPalette: commandPaletteStore } = useMobxStore();

  const projects = workspaceSlug ? projectStore.projects[workspaceSlug.toString()] : null;

  if (!projects) {
    return (
      <Loader className="grid grid-cols-3 gap-4">
        <Loader.Item height="100px" />
        <Loader.Item height="100px" />
        <Loader.Item height="100px" />
        <Loader.Item height="100px" />
        <Loader.Item height="100px" />
        <Loader.Item height="100px" />
      </Loader>
    );
  }

  return (
    <>
      {projects.length > 0 ? (
        <div className="h-full w-full p-8 overflow-y-auto">
          {projectStore.searchedProjects.length == 0 ? (
            <div className="w-full text-center text-custom-text-400 mt-10">No matching projects</div>
          ) : (
            <div className="grid grid-cols-1 gap-9 md:grid-cols-2 lg:grid-cols-3">
              {projectStore.searchedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          image={emptyProject}
          title="No projects yet"
          description="Get started by creating your first project"
          primaryButton={{
            icon: <Plus className="h-4 w-4" />,
            text: "New Project",
            onClick: () => commandPaletteStore.toggleCreateProjectModal(true),
          }}
        />
      )}
    </>
  );
});

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import { Command } from "cmdk";
import { Dialog, Transition } from "@headlessui/react";
import { observer } from "mobx-react-lite";
import {
  FileText,
  FolderPlus,
  LinkIcon,
  MessageSquare,
  Rocket,
  Search,
  Settings,
  Signal,
  Trash2,
  UserMinus2,
  UserPlus2,
} from "lucide-react";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// services
import { WorkspaceService } from "services/workspace.service";
import { IssueService } from "services/issue";
// hooks
import useDebounce from "hooks/use-debounce";
import useToast from "hooks/use-toast";
// components
import {
  ChangeInterfaceTheme,
  ChangeIssueAssignee,
  ChangeIssuePriority,
  ChangeIssueState,
  commandGroups,
} from "components/command-palette";
import {
  ContrastIcon,
  DiceIcon,
  DoubleCircleIcon,
  LayersIcon,
  Loader,
  PhotoFilterIcon,
  ToggleSwitch,
  Tooltip,
  UserGroupIcon,
} from "@plane/ui";
// icons
import { DiscordIcon, GithubIcon, SettingIcon } from "components/icons";
// helpers
import { copyTextToClipboard } from "helpers/string.helper";
// types
import { IIssue, IWorkspaceSearchResults } from "types";
// fetch-keys
import { ISSUE_DETAILS, PROJECT_ISSUES_ACTIVITY } from "constants/fetch-keys";

type Props = {
  deleteIssue: () => void;
  isPaletteOpen: boolean;
  closePalette: () => void;
};

// services
const workspaceService = new WorkspaceService();
const issueService = new IssueService();

export const CommandModal: React.FC<Props> = observer((props) => {
  const { deleteIssue, isPaletteOpen, closePalette } = props;
  // states
  const [placeholder, setPlaceholder] = useState("Type a command or search...");
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<IWorkspaceSearchResults>({
    results: {
      workspace: [],
      project: [],
      issue: [],
      cycle: [],
      module: [],
      issue_view: [],
      page: [],
    },
  });
  const [isWorkspaceLevel, setIsWorkspaceLevel] = useState(false);
  const [pages, setPages] = useState<string[]>([]);

  const { user: userStore, commandPalette: commandPaletteStore } = useMobxStore();
  const user = userStore.currentUser ?? undefined;

  // router
  const router = useRouter();
  const { workspaceSlug, projectId, issueId } = router.query;

  const page = pages[pages.length - 1];

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { setToastAlert } = useToast();

  const { data: issueDetails } = useSWR(
    workspaceSlug && projectId && issueId ? ISSUE_DETAILS(issueId as string) : null,
    workspaceSlug && projectId && issueId
      ? () => issueService.retrieve(workspaceSlug as string, projectId as string, issueId as string)
      : null
  );

  const updateIssue = useCallback(
    async (formData: Partial<IIssue>) => {
      if (!workspaceSlug || !projectId || !issueId) return;

      mutate<IIssue>(
        ISSUE_DETAILS(issueId as string),

        (prevData) => {
          if (!prevData) return prevData;

          return {
            ...prevData,
            ...formData,
          };
        },
        false
      );

      const payload = { ...formData };
      await issueService
        .patchIssue(workspaceSlug as string, projectId as string, issueId as string, payload, user)
        .then(() => {
          mutate(PROJECT_ISSUES_ACTIVITY(issueId as string));
          mutate(ISSUE_DETAILS(issueId as string));
        })
        .catch((e) => {
          console.error(e);
        });
    },
    [workspaceSlug, issueId, projectId, user]
  );

  const handleIssueAssignees = (assignee: string) => {
    if (!issueDetails) return;

    closePalette();
    const updatedAssignees = issueDetails.assignees ?? [];

    if (updatedAssignees.includes(assignee)) {
      updatedAssignees.splice(updatedAssignees.indexOf(assignee), 1);
    } else {
      updatedAssignees.push(assignee);
    }
    updateIssue({ assignees: updatedAssignees });
  };

  const redirect = (path: string) => {
    closePalette();
    router.push(path);
  };

  const createNewWorkspace = () => {
    closePalette();
    router.push("/create-workspace");
  };

  const copyIssueUrlToClipboard = useCallback(() => {
    if (!router.query.issueId) return;

    const url = new URL(window.location.href);
    copyTextToClipboard(url.href)
      .then(() => {
        setToastAlert({
          type: "success",
          title: "Copied to clipboard",
        });
      })
      .catch(() => {
        setToastAlert({
          type: "error",
          title: "Some error occurred",
        });
      });
  }, [router, setToastAlert]);

  useEffect(
    () => {
      if (!workspaceSlug) return;

      setIsLoading(true);

      if (debouncedSearchTerm) {
        setIsSearching(true);
        workspaceService
          .searchWorkspace(workspaceSlug as string, {
            ...(projectId ? { project_id: projectId.toString() } : {}),
            search: debouncedSearchTerm,
            workspace_search: !projectId ? true : isWorkspaceLevel,
          })
          .then((results) => {
            setResults(results);
            const count = Object.keys(results.results).reduce(
              (accumulator, key) => (results.results as any)[key].length + accumulator,
              0
            );
            setResultsCount(count);
          })
          .finally(() => {
            setIsLoading(false);
            setIsSearching(false);
          });
      } else {
        setResults({
          results: {
            workspace: [],
            project: [],
            issue: [],
            cycle: [],
            module: [],
            issue_view: [],
            page: [],
          },
        });
        setIsLoading(false);
        setIsSearching(false);
      }
    },
    [debouncedSearchTerm, isWorkspaceLevel, projectId, workspaceSlug] // Only call effect if debounced search term changes
  );

  if (!user) return null;

  return (
    <Transition.Root
      show={isPaletteOpen}
      afterLeave={() => {
        setSearchTerm("");
      }}
      as={React.Fragment}
    >
      <Dialog as="div" className="relative z-30" onClose={() => closePalette()}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-custom-backdrop transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-30 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative flex items-center justify-center w-full ">
              <div className="w-full max-w-2xl transform divide-y divide-custom-border-200 divide-opacity-10 rounded-lg bg-custom-background-100 shadow-custom-shadow-md transition-all">
                <Command
                  filter={(value, search) => {
                    if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                    return 0;
                  }}
                  onKeyDown={(e) => {
                    // when search is empty and page is undefined
                    // when user tries to close the modal with esc
                    if (e.key === "Escape" && !page && !searchTerm) {
                      closePalette();
                    }
                    // Escape goes to previous page
                    // Backspace goes to previous page when search is empty
                    if (e.key === "Escape" || (e.key === "Backspace" && !searchTerm)) {
                      e.preventDefault();
                      setPages((pages) => pages.slice(0, -1));
                      setPlaceholder("Type a command or search...");
                    }
                  }}
                >
                  <div
                    className={`flex sm:items-center gap-4 p-3 pb-0 ${
                      issueDetails ? "flex-col sm:flex-row justify-between" : "justify-end"
                    }`}
                  >
                    {issueDetails && (
                      <div className="overflow-hidden truncate rounded-md bg-custom-background-80 p-2 text-xs font-medium text-custom-text-200">
                        {issueDetails.project_detail.identifier}-{issueDetails.sequence_id} {issueDetails.name}
                      </div>
                    )}
                    {projectId && (
                      <Tooltip tooltipContent="Toggle workspace level search">
                        <div className="flex-shrink-0 self-end sm:self-center flex items-center gap-1 text-xs cursor-pointer">
                          <button
                            type="button"
                            onClick={() => setIsWorkspaceLevel((prevData) => !prevData)}
                            className="flex-shrink-0"
                          >
                            Workspace Level
                          </button>
                          <ToggleSwitch
                            value={isWorkspaceLevel}
                            onChange={() => setIsWorkspaceLevel((prevData) => !prevData)}
                          />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-custom-text-200"
                      aria-hidden="true"
                      strokeWidth={2}
                    />
                    <Command.Input
                      className="w-full border-0 border-b border-custom-border-200 bg-transparent p-4 pl-11 text-custom-text-100 placeholder:text-custom-text-400 outline-none focus:ring-0 text-sm"
                      placeholder={placeholder}
                      value={searchTerm}
                      onValueChange={(e) => {
                        setSearchTerm(e);
                      }}
                      autoFocus
                      tabIndex={1}
                    />
                  </div>

                  <Command.List className="max-h-96 overflow-scroll p-2">
                    {searchTerm !== "" && (
                      <h5 className="text-xs text-custom-text-100 mx-[3px] my-4">
                        Search results for{" "}
                        <span className="font-medium">
                          {'"'}
                          {searchTerm}
                          {'"'}
                        </span>{" "}
                        in {!projectId || isWorkspaceLevel ? "workspace" : "project"}:
                      </h5>
                    )}

                    {!isLoading && resultsCount === 0 && searchTerm !== "" && debouncedSearchTerm !== "" && (
                      <div className="my-4 text-center text-custom-text-200">No results found.</div>
                    )}

                    {(isLoading || isSearching) && (
                      <Command.Loading>
                        <Loader className="space-y-3">
                          <Loader.Item height="40px" />
                          <Loader.Item height="40px" />
                          <Loader.Item height="40px" />
                          <Loader.Item height="40px" />
                        </Loader>
                      </Command.Loading>
                    )}

                    {debouncedSearchTerm !== "" &&
                      Object.keys(results.results).map((key) => {
                        const section = (results.results as any)[key];
                        const currentSection = commandGroups[key];

                        if (section.length > 0) {
                          return (
                            <Command.Group key={key} heading={currentSection.title}>
                              {section.map((item: any) => (
                                <Command.Item
                                  key={item.id}
                                  onSelect={() => {
                                    closePalette();
                                    router.push(currentSection.path(item));
                                  }}
                                  value={`${key}-${item?.name}`}
                                  className="focus:outline-none"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden text-custom-text-200">
                                    {currentSection.icon}
                                    <p className="block flex-1 truncate">{currentSection.itemName(item)}</p>
                                  </div>
                                </Command.Item>
                              ))}
                            </Command.Group>
                          );
                        }
                      })}

                    {!page && (
                      <>
                        {issueId && (
                          <Command.Group heading="Issue actions">
                            <Command.Item
                              onSelect={() => {
                                closePalette();
                                setPlaceholder("Change state...");
                                setSearchTerm("");
                                setPages([...pages, "change-issue-state"]);
                              }}
                              className="focus:outline-none"
                            >
                              <div className="flex items-center gap-2 text-custom-text-200">
                                <DoubleCircleIcon className="h-3.5 w-3.5" />
                                Change state...
                              </div>
                            </Command.Item>
                            <Command.Item
                              onSelect={() => {
                                setPlaceholder("Change priority...");
                                setSearchTerm("");
                                setPages([...pages, "change-issue-priority"]);
                              }}
                              className="focus:outline-none"
                            >
                              <div className="flex items-center gap-2 text-custom-text-200">
                                <Signal className="h-3.5 w-3.5" />
                                Change priority...
                              </div>
                            </Command.Item>
                            <Command.Item
                              onSelect={() => {
                                setPlaceholder("Assign to...");
                                setSearchTerm("");
                                setPages([...pages, "change-issue-assignee"]);
                              }}
                              className="focus:outline-none"
                            >
                              <div className="flex items-center gap-2 text-custom-text-200">
                                <UserGroupIcon className="h-3.5 w-3.5" />
                                Assign to...
                              </div>
                            </Command.Item>
                            <Command.Item
                              onSelect={() => {
                                handleIssueAssignees(user.id);
                                setSearchTerm("");
                              }}
                              className="focus:outline-none"
                            >
                              <div className="flex items-center gap-2 text-custom-text-200">
                                {issueDetails?.assignees.includes(user.id) ? (
                                  <>
                                    <UserMinus2 className="h-3.5 w-3.5" />
                                    Un-assign from me
                                  </>
                                ) : (
                                  <>
                                    <UserPlus2 className="h-3.5 w-3.5" />
                                    Assign to me
                                  </>
                                )}
                              </div>
                            </Command.Item>
                            <Command.Item onSelect={deleteIssue} className="focus:outline-none">
                              <div className="flex items-center gap-2 text-custom-text-200">
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete issue
                              </div>
                            </Command.Item>
                            <Command.Item
                              onSelect={() => {
                                closePalette();
                                copyIssueUrlToClipboard();
                              }}
                              className="focus:outline-none"
                            >
                              <div className="flex items-center gap-2 text-custom-text-200">
                                <LinkIcon className="h-3.5 w-3.5" />
                                Copy issue URL
                              </div>
                            </Command.Item>
                          </Command.Group>
                        )}
                        <Command.Group heading="Issue">
                          <Command.Item
                            onSelect={() => {
                              closePalette();
                              commandPaletteStore.toggleCreateIssueModal(true);
                            }}
                            className="focus:bg-custom-background-80"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <LayersIcon className="h-3.5 w-3.5" />
                              Create new issue
                            </div>
                            <kbd>C</kbd>
                          </Command.Item>
                        </Command.Group>

                        {workspaceSlug && (
                          <Command.Group heading="Project">
                            <Command.Item
                              onSelect={() => {
                                closePalette();
                                commandPaletteStore.toggleCreateProjectModal(true);
                              }}
                              className="focus:outline-none"
                            >
                              <div className="flex items-center gap-2 text-custom-text-200">
                                <FolderPlus className="h-3.5 w-3.5" />
                                Create new project
                              </div>
                              <kbd>P</kbd>
                            </Command.Item>
                          </Command.Group>
                        )}

                        {projectId && (
                          <>
                            <Command.Group heading="Cycle">
                              <Command.Item
                                onSelect={() => {
                                  closePalette();
                                  commandPaletteStore.toggleCreateCycleModal(true);
                                }}
                                className="focus:outline-none"
                              >
                                <div className="flex items-center gap-2 text-custom-text-200">
                                  <ContrastIcon className="h-3.5 w-3.5" />
                                  Create new cycle
                                </div>
                                <kbd>Q</kbd>
                              </Command.Item>
                            </Command.Group>
                            <Command.Group heading="Module">
                              <Command.Item
                                onSelect={() => {
                                  closePalette();
                                  commandPaletteStore.toggleCreateModuleModal(true);
                                }}
                                className="focus:outline-none"
                              >
                                <div className="flex items-center gap-2 text-custom-text-200">
                                  <DiceIcon className="h-3.5 w-3.5" />
                                  Create new module
                                </div>
                                <kbd>M</kbd>
                              </Command.Item>
                            </Command.Group>
                            <Command.Group heading="View">
                              <Command.Item
                                onSelect={() => {
                                  closePalette();
                                  commandPaletteStore.toggleCreateViewModal(true);
                                }}
                                className="focus:outline-none"
                              >
                                <div className="flex items-center gap-2 text-custom-text-200">
                                  <PhotoFilterIcon className="h-3.5 w-3.5" />
                                  Create new view
                                </div>
                                <kbd>V</kbd>
                              </Command.Item>
                            </Command.Group>
                            <Command.Group heading="Page">
                              <Command.Item
                                onSelect={() => {
                                  closePalette();
                                  commandPaletteStore.toggleCreatePageModal(true);
                                }}
                                className="focus:outline-none"
                              >
                                <div className="flex items-center gap-2 text-custom-text-200">
                                  <FileText className="h-3.5 w-3.5" />
                                  Create new page
                                </div>
                                <kbd>D</kbd>
                              </Command.Item>
                            </Command.Group>
                          </>
                        )}

                        <Command.Group heading="Workspace Settings">
                          <Command.Item
                            onSelect={() => {
                              setPlaceholder("Search workspace settings...");
                              setSearchTerm("");
                              setPages([...pages, "settings"]);
                            }}
                            className="focus:outline-none"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <Settings className="h-3.5 w-3.5" />
                              Search settings...
                            </div>
                          </Command.Item>
                        </Command.Group>
                        <Command.Group heading="Account">
                          <Command.Item onSelect={createNewWorkspace} className="focus:outline-none">
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <FolderPlus className="h-3.5 w-3.5" />
                              Create new workspace
                            </div>
                          </Command.Item>
                          <Command.Item
                            onSelect={() => {
                              setPlaceholder("Change interface theme...");
                              setSearchTerm("");
                              setPages([...pages, "change-interface-theme"]);
                            }}
                            className="focus:outline-none"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <Settings className="h-3.5 w-3.5" />
                              Change interface theme...
                            </div>
                          </Command.Item>
                        </Command.Group>
                        <Command.Group heading="Help">
                          <Command.Item
                            onSelect={() => {
                              closePalette();
                              commandPaletteStore.toggleShortcutModal(true);
                            }}
                            className="focus:outline-none"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <Rocket className="h-3.5 w-3.5" />
                              Open keyboard shortcuts
                            </div>
                          </Command.Item>
                          <Command.Item
                            onSelect={() => {
                              closePalette();
                              window.open("https://docs.plane.so/", "_blank");
                            }}
                            className="focus:outline-none"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <FileText className="h-3.5 w-3.5" />
                              Open Plane documentation
                            </div>
                          </Command.Item>
                          <Command.Item
                            onSelect={() => {
                              closePalette();
                              window.open("https://discord.com/invite/A92xrEGCge", "_blank");
                            }}
                            className="focus:outline-none"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <DiscordIcon className="h-4 w-4" color="rgb(var(--color-text-200))" />
                              Join our Discord
                            </div>
                          </Command.Item>
                          <Command.Item
                            onSelect={() => {
                              closePalette();
                              window.open("https://github.com/makeplane/plane/issues/new/choose", "_blank");
                            }}
                            className="focus:outline-none"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <GithubIcon className="h-4 w-4" color="rgb(var(--color-text-200))" />
                              Report a bug
                            </div>
                          </Command.Item>
                          <Command.Item
                            onSelect={() => {
                              closePalette();
                              (window as any).$crisp.push(["do", "chat:open"]);
                            }}
                            className="focus:outline-none"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Chat with us
                            </div>
                          </Command.Item>
                        </Command.Group>
                      </>
                    )}

                    {page === "settings" && workspaceSlug && (
                      <>
                        <Command.Item
                          onSelect={() => redirect(`/${workspaceSlug}/settings`)}
                          className="focus:outline-none"
                        >
                          <div className="flex items-center gap-2 text-custom-text-200">
                            <SettingIcon className="h-4 w-4 text-custom-text-200" />
                            General
                          </div>
                        </Command.Item>
                        <Command.Item
                          onSelect={() => redirect(`/${workspaceSlug}/settings/members`)}
                          className="focus:outline-none"
                        >
                          <div className="flex items-center gap-2 text-custom-text-200">
                            <SettingIcon className="h-4 w-4 text-custom-text-200" />
                            Members
                          </div>
                        </Command.Item>
                        <Command.Item
                          onSelect={() => redirect(`/${workspaceSlug}/settings/billing`)}
                          className="focus:outline-none"
                        >
                          <div className="flex items-center gap-2 text-custom-text-200">
                            <SettingIcon className="h-4 w-4 text-custom-text-200" />
                            Billing and Plans
                          </div>
                        </Command.Item>
                        <Command.Item
                          onSelect={() => redirect(`/${workspaceSlug}/settings/integrations`)}
                          className="focus:outline-none"
                        >
                          <div className="flex items-center gap-2 text-custom-text-200">
                            <SettingIcon className="h-4 w-4 text-custom-text-200" />
                            Integrations
                          </div>
                        </Command.Item>
                        <Command.Item
                          onSelect={() => redirect(`/${workspaceSlug}/settings/imports`)}
                          className="focus:outline-none"
                        >
                          <div className="flex items-center gap-2 text-custom-text-200">
                            <SettingIcon className="h-4 w-4 text-custom-text-200" />
                            Import
                          </div>
                        </Command.Item>
                        <Command.Item
                          onSelect={() => redirect(`/${workspaceSlug}/settings/exports`)}
                          className="focus:outline-none"
                        >
                          <div className="flex items-center gap-2 text-custom-text-200">
                            <SettingIcon className="h-4 w-4 text-custom-text-200" />
                            Export
                          </div>
                        </Command.Item>
                      </>
                    )}
                    {page === "change-issue-state" && issueDetails && (
                      <ChangeIssueState issue={issueDetails} setIsPaletteOpen={closePalette} user={user} />
                    )}
                    {page === "change-issue-priority" && issueDetails && (
                      <ChangeIssuePriority issue={issueDetails} setIsPaletteOpen={closePalette} user={user} />
                    )}
                    {page === "change-issue-assignee" && issueDetails && (
                      <ChangeIssueAssignee issue={issueDetails} setIsPaletteOpen={closePalette} user={user} />
                    )}
                    {page === "change-interface-theme" && <ChangeInterfaceTheme setIsPaletteOpen={closePalette} />}
                  </Command.List>
                </Command>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
});

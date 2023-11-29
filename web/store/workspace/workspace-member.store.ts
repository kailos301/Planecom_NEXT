import { action, computed, observable, makeObservable, runInAction } from "mobx";
import { RootStore } from "../root";
// types
import { IUser, IWorkspaceMember, IWorkspaceMemberInvitation, IWorkspaceBulkInviteFormData } from "types";
// services
import { WorkspaceService } from "services/workspace.service";

export interface IWorkspaceMemberStore {
  // states
  loader: boolean;
  error: any | null;

  // observables
  members: { [workspaceSlug: string]: IWorkspaceMember[] }; // workspaceSlug: members[]
  memberInvitations: { [workspaceSlug: string]: IWorkspaceMemberInvitation[] };
  // actions
  fetchWorkspaceMembers: (workspaceSlug: string) => Promise<void>;
  fetchWorkspaceMemberInvitations: (workspaceSlug: string) => Promise<IWorkspaceMemberInvitation[]>;
  updateMember: (workspaceSlug: string, memberId: string, data: Partial<IWorkspaceMember>) => Promise<void>;
  removeMember: (workspaceSlug: string, memberId: string) => Promise<void>;
  inviteMembersToWorkspace: (workspaceSlug: string, data: IWorkspaceBulkInviteFormData) => Promise<any>;
  deleteWorkspaceInvitation: (workspaceSlug: string, memberId: string) => Promise<void>;
  // computed
  workspaceMembers: IWorkspaceMember[] | null;
  workspaceMemberInvitations: IWorkspaceMemberInvitation[] | null;
  workspaceMembersWithInvitations: any[] | null;
}

export class WorkspaceMemberStore implements IWorkspaceMemberStore {
  // states
  loader: boolean = false;
  error: any | null = null;
  // observables
  members: { [workspaceSlug: string]: IWorkspaceMember[] } = {};
  memberInvitations: { [workspaceSlug: string]: IWorkspaceMemberInvitation[] } = {};
  // services
  workspaceService;
  // root store
  rootStore;

  constructor(_rootStore: RootStore) {
    makeObservable(this, {
      // states
      loader: observable.ref,
      error: observable.ref,

      // observables
      members: observable.ref,
      memberInvitations: observable.ref,
      // actions
      fetchWorkspaceMembers: action,
      fetchWorkspaceMemberInvitations: action,
      updateMember: action,
      removeMember: action,
      inviteMembersToWorkspace: action,
      deleteWorkspaceInvitation: action,
      // computed
      workspaceMembers: computed,
      workspaceMemberInvitations: computed,
      workspaceMembersWithInvitations: computed,
    });

    this.rootStore = _rootStore;
    this.workspaceService = new WorkspaceService();
  }

  /**
   * computed value of workspace members using the workspace slug from the store
   */
  get workspaceMembers() {
    if (!this.rootStore.workspace.workspaceSlug) return null;
    const members = this.members?.[this.rootStore.workspace.workspaceSlug];
    if (!members) return null;
    return members;
  }

  /**
   * Computed value of workspace member invitations using workspace slug from store
   */
  get workspaceMemberInvitations() {
    if (!this.rootStore.workspace.workspaceSlug) return null;
    const invitations = this.memberInvitations?.[this.rootStore.workspace.workspaceSlug];
    if (!invitations) return null;
    return invitations;
  }

  /**
   * computed value provides the members information including the invitations.
   */
  get workspaceMembersWithInvitations() {
    if (!this.workspaceMembers || !this.workspaceMemberInvitations) return null;
    return [
      ...(this.workspaceMemberInvitations?.map((item) => ({
        id: item.id,
        memberId: item.id,
        avatar: "",
        first_name: item.email,
        last_name: "",
        email: item.email,
        display_name: item.email,
        role: item.role,
        status: item.accepted,
        member: false,
        accountCreated: item.accepted,
      })) || []),
      ...(this.workspaceMembers?.map((item) => ({
        id: item.id,
        memberId: item.member?.id,
        avatar: item.member?.avatar,
        first_name: item.member?.first_name,
        last_name: item.member?.last_name,
        email: item.member?.email,
        display_name: item.member?.display_name,
        role: item.role,
        status: true,
        member: true,
        accountCreated: true,
      })) || []),
    ];
  }

  /**
   * fetch workspace members using workspace slug
   * @param workspaceSlug
   */
  fetchWorkspaceMembers = async (workspaceSlug: string) => {
    try {
      runInAction(() => {
        this.loader = true;
        this.error = null;
      });

      const membersResponse = await this.workspaceService.fetchWorkspaceMembers(workspaceSlug);

      runInAction(() => {
        this.members = {
          ...this.members,
          [workspaceSlug]: membersResponse,
        };
        this.loader = false;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.loader = false;
        this.error = error;
      });
    }
  };

  /**
   * fetching workspace member invitations
   * @param workspaceSlug
   * @returns
   */
  fetchWorkspaceMemberInvitations = async (workspaceSlug: string) => {
    try {
      const membersInvitations = await this.workspaceService.workspaceInvitations(workspaceSlug);
      runInAction(() => {
        this.memberInvitations = {
          ...this.memberInvitations,
          [workspaceSlug]: membersInvitations,
        };
      });
      return membersInvitations;
    } catch (error) {
      throw error;
    }
  };

  /**
   * invite members to the workspace using emails
   * @param workspaceSlug
   * @param data
   */
  inviteMembersToWorkspace = async (workspaceSlug: string, data: IWorkspaceBulkInviteFormData) => {
    try {
      await this.workspaceService.inviteWorkspace(workspaceSlug, data, this.rootStore.user.currentUser as IUser);
      await this.fetchWorkspaceMemberInvitations(workspaceSlug);
    } catch (error) {
      throw error;
    }
  };

  /**
   * delete the workspace invitation
   * @param workspaceSlug
   * @param memberId
   */
  deleteWorkspaceInvitation = async (workspaceSlug: string, memberId: string) => {
    try {
      runInAction(() => {
        this.memberInvitations = {
          ...this.memberInvitations,
          [workspaceSlug]: [...this.memberInvitations[workspaceSlug].filter((inv) => inv.id !== memberId)],
        };
      });
      await this.workspaceService.deleteWorkspaceInvitations(workspaceSlug.toString(), memberId);
    } catch (error) {
      throw error;
    }
  };

  /**
   * update workspace member using workspace slug and member id and data
   * @param workspaceSlug
   * @param memberId
   * @param data
   */
  updateMember = async (workspaceSlug: string, memberId: string, data: Partial<IWorkspaceMember>) => {
    const members = this.members?.[workspaceSlug];
    members?.map((m) => (m.id === memberId ? { ...m, ...data } : m));

    try {
      runInAction(() => {
        this.loader = true;
        this.error = null;
      });

      await this.workspaceService.updateWorkspaceMember(workspaceSlug, memberId, data);

      runInAction(() => {
        this.loader = false;
        this.error = null;
        this.members = {
          ...this.members,
          [workspaceSlug]: members,
        };
      });
    } catch (error) {
      runInAction(() => {
        this.loader = false;
        this.error = error;
      });

      throw error;
    }
  };

  /**
   * remove workspace member using workspace slug and member id
   * @param workspaceSlug
   * @param memberId
   */
  removeMember = async (workspaceSlug: string, memberId: string) => {
    const members = this.members?.[workspaceSlug];
    members?.filter((m) => m.id !== memberId);

    try {
      runInAction(() => {
        this.loader = true;
        this.error = null;
      });

      await this.workspaceService.deleteWorkspaceMember(workspaceSlug, memberId);

      runInAction(() => {
        this.loader = false;
        this.error = null;
        this.members = {
          ...this.members,
          [workspaceSlug]: members,
        };
      });
    } catch (error) {
      runInAction(() => {
        this.loader = false;
        this.error = error;
      });

      throw error;
    }
  };
}

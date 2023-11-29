import { APIService } from "services/api.service";
import { TrackEventService } from "services/track_event.service";
// helpers
import { API_BASE_URL } from "helpers/common.helper";
// types
import type { IInboxIssue, IInbox, TInboxStatus, IUser, IInboxQueryParams } from "types";

const trackEventService = new TrackEventService();

export class InboxService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getInboxes(workspaceSlug: string, projectId: string): Promise<IInbox[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/inboxes/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getInboxById(workspaceSlug: string, projectId: string, inboxId: string): Promise<IInbox> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/inboxes/${inboxId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async patchInbox(workspaceSlug: string, projectId: string, inboxId: string, data: Partial<IInbox>): Promise<any> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/inboxes/${inboxId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getInboxIssues(
    workspaceSlug: string,
    projectId: string,
    inboxId: string,
    params?: IInboxQueryParams
  ): Promise<IInboxIssue[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/inboxes/${inboxId}/inbox-issues/`, {
      params,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getInboxIssueById(
    workspaceSlug: string,
    projectId: string,
    inboxId: string,
    inboxIssueId: string
  ): Promise<IInboxIssue> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/inboxes/${inboxId}/inbox-issues/${inboxIssueId}/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteInboxIssue(
    workspaceSlug: string,
    projectId: string,
    inboxId: string,
    inboxIssueId: string,
    user: IUser | undefined
  ): Promise<any> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/inboxes/${inboxId}/inbox-issues/${inboxIssueId}/`
    )
      .then((response) => {
        if (user) trackEventService.trackInboxEvent(response?.data, "INBOX_ISSUE_DELETE", user);
        return response?.data;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async markInboxStatus(
    workspaceSlug: string,
    projectId: string,
    inboxId: string,
    inboxIssueId: string,
    data: TInboxStatus,
    user: IUser | undefined
  ): Promise<IInboxIssue> {
    return this.patch(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/inboxes/${inboxId}/inbox-issues/${inboxIssueId}/`,
      data
    )
      .then((response) => {
        const action =
          data.status === -1
            ? "INBOX_ISSUE_REJECTED"
            : data.status === 0
            ? "INBOX_ISSUE_SNOOZED"
            : data.status === 1
            ? "INBOX_ISSUE_ACCEPTED"
            : "INBOX_ISSUE_DUPLICATED";
        trackEventService.trackInboxEvent(response?.data, action, user as IUser);
        return response?.data;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async patchInboxIssue(
    workspaceSlug: string,
    projectId: string,
    inboxId: string,
    inboxIssueId: string,
    data: { issue: Partial<IInboxIssue> },
    user: IUser | undefined
  ): Promise<any> {
    return this.patch(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/inboxes/${inboxId}/inbox-issues/${inboxIssueId}/`,
      data
    )
      .then((response) => {
        if (user) trackEventService.trackInboxEvent(response?.data, "INBOX_ISSUE_UPDATE", user);
        return response?.data;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createInboxIssue(
    workspaceSlug: string,
    projectId: string,
    inboxId: string,
    data: any,
    user: IUser | undefined
  ): Promise<IInboxIssue> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/inboxes/${inboxId}/inbox-issues/`, data)
      .then((response) => {
        if (user) trackEventService.trackInboxEvent(response?.data, "INBOX_ISSUE_CREATE", user);
        return response?.data;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

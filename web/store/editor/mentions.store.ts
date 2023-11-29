import { IMentionHighlight, IMentionSuggestion } from "@plane/lite-text-editor";
import { RootStore } from "../root";
import { computed, makeObservable } from "mobx";

export interface IMentionsStore {
  mentionSuggestions: IMentionSuggestion[];
  mentionHighlights: IMentionHighlight[];
}

export class MentionsStore implements IMentionsStore {
  // root store
  rootStore;

  constructor(_rootStore: RootStore) {
    // rootStore
    this.rootStore = _rootStore;

    makeObservable(this, {
      mentionHighlights: computed,
      mentionSuggestions: computed,
    });
  }

  get mentionSuggestions() {
    const projectMembers = this.rootStore.projectMember.projectMembers;

    const suggestions =
      projectMembers === null
        ? []
        : projectMembers.map((member) => ({
            id: member.member.id,
            type: "User",
            title: member.member.display_name,
            subtitle: member.member.email ?? "",
            avatar: member.member.avatar,
            redirect_uri: `/${member.workspace.slug}/profile/${member.member.id}`,
          }));

    return suggestions;
  }

  get mentionHighlights() {
    const user = this.rootStore.user.currentUser;
    return user ? [user.id] : [];
  }
}

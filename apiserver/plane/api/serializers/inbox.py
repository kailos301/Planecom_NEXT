# Third party frameworks
from rest_framework import serializers

# Module imports
from .base import BaseSerializer
from .issue import IssueFlatSerializer, LabelLiteSerializer
from .project import ProjectLiteSerializer
from .state import StateLiteSerializer
from .user import UserLiteSerializer
from plane.db.models import Inbox, InboxIssue, Issue


class InboxSerializer(BaseSerializer):
    project_detail = ProjectLiteSerializer(source="project", read_only=True)
    pending_issue_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Inbox
        fields = "__all__"
        read_only_fields = [
            "project",
            "workspace",
        ]


class InboxIssueSerializer(BaseSerializer):
    issue_detail = IssueFlatSerializer(source="issue", read_only=True)
    project_detail = ProjectLiteSerializer(source="project", read_only=True)

    class Meta:
        model = InboxIssue
        fields = "__all__"
        read_only_fields = [
            "project",
            "workspace",
        ]


class InboxIssueLiteSerializer(BaseSerializer):
    class Meta:
        model = InboxIssue
        fields = ["id", "status", "duplicate_to", "snoozed_till", "source"]
        read_only_fields = fields


class IssueStateInboxSerializer(BaseSerializer):
    state_detail = StateLiteSerializer(read_only=True, source="state")
    project_detail = ProjectLiteSerializer(read_only=True, source="project")
    label_details = LabelLiteSerializer(read_only=True, source="labels", many=True)
    assignee_details = UserLiteSerializer(read_only=True, source="assignees", many=True)
    sub_issues_count = serializers.IntegerField(read_only=True)
    bridge_id = serializers.UUIDField(read_only=True)
    issue_inbox = InboxIssueLiteSerializer(read_only=True, many=True)

    class Meta:
        model = Issue
        fields = "__all__"

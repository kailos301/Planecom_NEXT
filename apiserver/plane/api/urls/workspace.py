from django.urls import path


from plane.api.views import (
    WorkSpaceViewSet,
    InviteWorkspaceEndpoint,
    WorkSpaceMemberViewSet,
    WorkspaceInvitationsViewset,
    WorkspaceMemberUserEndpoint,
    WorkspaceMemberUserViewsEndpoint,
    WorkSpaceAvailabilityCheckEndpoint,
    TeamMemberViewSet,
    UserLastProjectWithWorkspaceEndpoint,
    WorkspaceThemeViewSet,
    WorkspaceUserProfileStatsEndpoint,
    WorkspaceUserActivityEndpoint,
    WorkspaceUserProfileEndpoint,
    WorkspaceUserProfileIssuesEndpoint,
    WorkspaceLabelsEndpoint,
    LeaveWorkspaceEndpoint,
)


urlpatterns = [
    path(
        "workspace-slug-check/",
        WorkSpaceAvailabilityCheckEndpoint.as_view(),
        name="workspace-availability",
    ),
    path(
        "workspaces/",
        WorkSpaceViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="workspace",
    ),
    path(
        "workspaces/<str:slug>/",
        WorkSpaceViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="workspace",
    ),
    path(
        "workspaces/<str:slug>/invite/",
        InviteWorkspaceEndpoint.as_view(),
        name="invite-workspace",
    ),
    path(
        "workspaces/<str:slug>/invitations/",
        WorkspaceInvitationsViewset.as_view({"get": "list"}),
        name="workspace-invitations",
    ),
    path(
        "workspaces/<str:slug>/invitations/<uuid:pk>/",
        WorkspaceInvitationsViewset.as_view(
            {
                "delete": "destroy",
                "get": "retrieve",
            }
        ),
        name="workspace-invitations",
    ),
    path(
        "workspaces/<str:slug>/members/",
        WorkSpaceMemberViewSet.as_view({"get": "list"}),
        name="workspace-member",
    ),
    path(
        "workspaces/<str:slug>/members/<uuid:pk>/",
        WorkSpaceMemberViewSet.as_view(
            {
                "patch": "partial_update",
                "delete": "destroy",
                "get": "retrieve",
            }
        ),
        name="workspace-member",
    ),
    path(
        "workspaces/<str:slug>/teams/",
        TeamMemberViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="workspace-team-members",
    ),
    path(
        "workspaces/<str:slug>/teams/<uuid:pk>/",
        TeamMemberViewSet.as_view(
            {
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
                "get": "retrieve",
            }
        ),
        name="workspace-team-members",
    ),
    path(
        "users/last-visited-workspace/",
        UserLastProjectWithWorkspaceEndpoint.as_view(),
        name="workspace-project-details",
    ),
    path(
        "workspaces/<str:slug>/workspace-members/me/",
        WorkspaceMemberUserEndpoint.as_view(),
        name="workspace-member-details",
    ),
    path(
        "workspaces/<str:slug>/workspace-views/",
        WorkspaceMemberUserViewsEndpoint.as_view(),
        name="workspace-member-views-details",
    ),
    path(
        "workspaces/<str:slug>/workspace-themes/",
        WorkspaceThemeViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="workspace-themes",
    ),
    path(
        "workspaces/<str:slug>/workspace-themes/<uuid:pk>/",
        WorkspaceThemeViewSet.as_view(
            {
                "get": "retrieve",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="workspace-themes",
    ),
    path(
        "workspaces/<str:slug>/user-stats/<uuid:user_id>/",
        WorkspaceUserProfileStatsEndpoint.as_view(),
        name="workspace-user-stats",
    ),
    path(
        "workspaces/<str:slug>/user-activity/<uuid:user_id>/",
        WorkspaceUserActivityEndpoint.as_view(),
        name="workspace-user-activity",
    ),
    path(
        "workspaces/<str:slug>/user-profile/<uuid:user_id>/",
        WorkspaceUserProfileEndpoint.as_view(),
        name="workspace-user-profile-page",
    ),
    path(
        "workspaces/<str:slug>/user-issues/<uuid:user_id>/",
        WorkspaceUserProfileIssuesEndpoint.as_view(),
        name="workspace-user-profile-issues",
    ),
    path(
        "workspaces/<str:slug>/labels/",
        WorkspaceLabelsEndpoint.as_view(),
        name="workspace-labels",
    ),
    path(
        "workspaces/<str:slug>/members/leave/",
        LeaveWorkspaceEndpoint.as_view(),
        name="leave-workspace-members",
    ),
]

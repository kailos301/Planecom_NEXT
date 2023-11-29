# Third Party imports
from rest_framework.permissions import BasePermission, SAFE_METHODS

# Module import
from plane.db.models import WorkspaceMember, ProjectMember

# Permission Mappings
Admin = 20
Member = 15
Viewer = 10
Guest = 5


class ProjectBasePermission(BasePermission):
    def has_permission(self, request, view):

        if request.user.is_anonymous:
            return False

        ## Safe Methods -> Handle the filtering logic in queryset
        if request.method in SAFE_METHODS:
            return WorkspaceMember.objects.filter(
                workspace__slug=view.workspace_slug, member=request.user
            ).exists()

        ## Only workspace owners or admins can create the projects
        if request.method == "POST":
            return WorkspaceMember.objects.filter(
                workspace__slug=view.workspace_slug,
                member=request.user,
                role__in=[Admin, Member],
            ).exists()

        ## Only Project Admins can update project attributes
        return ProjectMember.objects.filter(
            workspace__slug=view.workspace_slug,
            member=request.user,
            role=Admin,
            project_id=view.project_id,
        ).exists()


class ProjectMemberPermission(BasePermission):
    def has_permission(self, request, view):

        if request.user.is_anonymous:
            return False

        ## Safe Methods -> Handle the filtering logic in queryset
        if request.method in SAFE_METHODS:
            return ProjectMember.objects.filter(
                workspace__slug=view.workspace_slug, member=request.user
            ).exists()
        ## Only workspace owners or admins can create the projects
        if request.method == "POST":
            return WorkspaceMember.objects.filter(
                workspace__slug=view.workspace_slug,
                member=request.user,
                role__in=[Admin, Member],
            ).exists()

        ## Only Project Admins can update project attributes
        return ProjectMember.objects.filter(
            workspace__slug=view.workspace_slug,
            member=request.user,
            role__in=[Admin, Member],
            project_id=view.project_id,
        ).exists()


class ProjectEntityPermission(BasePermission):
    def has_permission(self, request, view):

        if request.user.is_anonymous:
            return False

        ## Safe Methods -> Handle the filtering logic in queryset
        if request.method in SAFE_METHODS:
            return ProjectMember.objects.filter(
                workspace__slug=view.workspace_slug,
                member=request.user,
                project_id=view.project_id,
            ).exists()

        ## Only project members or admins can create and edit the project attributes
        return ProjectMember.objects.filter(
            workspace__slug=view.workspace_slug,
            member=request.user,
            role__in=[Admin, Member],
            project_id=view.project_id,
        ).exists()


class ProjectLitePermission(BasePermission):

    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        
        return ProjectMember.objects.filter(
            workspace__slug=view.workspace_slug,
            member=request.user,
            project_id=view.project_id,
        ).exists()

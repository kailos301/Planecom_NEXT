# Python imports
from datetime import timedelta, date

# Django imports
from django.db.models import Exists, OuterRef, Q, Prefetch
from django.utils import timezone

# Third party imports
from rest_framework import status
from rest_framework.response import Response
from sentry_sdk import capture_exception

# Module imports
from .base import BaseViewSet, BaseAPIView
from plane.api.permissions import ProjectEntityPermission
from plane.db.models import (
    Page,
    PageBlock,
    PageFavorite,
    Issue,
    IssueAssignee,
    IssueActivity,
)
from plane.api.serializers import (
    PageSerializer,
    PageBlockSerializer,
    PageFavoriteSerializer,
    IssueLiteSerializer,
)


class PageViewSet(BaseViewSet):
    serializer_class = PageSerializer
    model = Page
    permission_classes = [
        ProjectEntityPermission,
    ]
    search_fields = [
        "name",
    ]

    def get_queryset(self):
        subquery = PageFavorite.objects.filter(
            user=self.request.user,
            page_id=OuterRef("pk"),
            project_id=self.kwargs.get("project_id"),
            workspace__slug=self.kwargs.get("slug"),
        )
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .filter(project__project_projectmember__member=self.request.user)
            .filter(Q(owned_by=self.request.user) | Q(access=0))
            .select_related("project")
            .select_related("workspace")
            .select_related("owned_by")
            .annotate(is_favorite=Exists(subquery))
            .order_by(self.request.GET.get("order_by", "-created_at"))
            .prefetch_related("labels")
            .order_by("name", "-is_favorite")
            .prefetch_related(
                Prefetch(
                    "blocks",
                    queryset=PageBlock.objects.select_related(
                        "page", "issue", "workspace", "project"
                    ),
                )
            )
            .distinct()
        )

    def perform_create(self, serializer):
        serializer.save(
            project_id=self.kwargs.get("project_id"), owned_by=self.request.user
        )

    def create(self, request, slug, project_id):
        serializer = PageSerializer(
            data=request.data,
            context={"project_id": project_id, "owned_by_id": request.user.id},
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, slug, project_id, pk):
        page = Page.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        # Only update access if the page owner is the requesting  user
        if (
            page.access != request.data.get("access", page.access)
            and page.owned_by_id != request.user.id
        ):
            return Response(
                {
                    "error": "Access cannot be updated since this page is owned by someone else"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = PageSerializer(page, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def list(self, request, slug, project_id):
        queryset = self.get_queryset()
        page_view = request.GET.get("page_view", False)

        if not page_view:
            return Response({"error": "Page View parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        # All Pages
        if page_view == "all":
            return Response(PageSerializer(queryset, many=True).data, status=status.HTTP_200_OK)

        # Recent pages
        if page_view == "recent":
            current_time = date.today()
            day_before = current_time - timedelta(days=1)
            todays_pages = queryset.filter(updated_at__date=date.today())
            yesterdays_pages = queryset.filter(updated_at__date=day_before)
            earlier_this_week = queryset.filter(                    updated_at__date__range=(
                    (timezone.now() - timedelta(days=7)),
                    (timezone.now() - timedelta(days=2)),
                ))
            return Response(
            {
                "today": PageSerializer(todays_pages, many=True).data,
                "yesterday": PageSerializer(yesterdays_pages, many=True).data,
                "earlier_this_week": PageSerializer(earlier_this_week, many=True).data,
            },
            status=status.HTTP_200_OK,
        )

        # Favorite Pages
        if page_view == "favorite":
            queryset = queryset.filter(is_favorite=True)
            return Response(PageSerializer(queryset, many=True).data, status=status.HTTP_200_OK)
        
        # My pages
        if page_view == "created_by_me":
            queryset = queryset.filter(owned_by=request.user)
            return Response(PageSerializer(queryset, many=True).data, status=status.HTTP_200_OK)

        # Created by other Pages
        if page_view == "created_by_other":
            queryset = queryset.filter(~Q(owned_by=request.user),  access=0)
            return Response(PageSerializer(queryset, many=True).data, status=status.HTTP_200_OK)

        return Response({"error": "No matching view found"}, status=status.HTTP_400_BAD_REQUEST)


class PageBlockViewSet(BaseViewSet):
    serializer_class = PageBlockSerializer
    model = PageBlock
    permission_classes = [
        ProjectEntityPermission,
    ]

    def get_queryset(self):
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .filter(page_id=self.kwargs.get("page_id"))
            .filter(project__project_projectmember__member=self.request.user)
            .select_related("project")
            .select_related("workspace")
            .select_related("page")
            .select_related("issue")
            .order_by("sort_order")
            .distinct()
        )

    def perform_create(self, serializer):
        serializer.save(
            project_id=self.kwargs.get("project_id"),
            page_id=self.kwargs.get("page_id"),
        )


class PageFavoriteViewSet(BaseViewSet):
    permission_classes = [
        ProjectEntityPermission,
    ]

    serializer_class = PageFavoriteSerializer
    model = PageFavorite

    def get_queryset(self):
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(user=self.request.user)
            .select_related("page", "page__owned_by")
        )

    def create(self, request, slug, project_id):
        serializer = PageFavoriteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, project_id=project_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, slug, project_id, page_id):
        page_favorite = PageFavorite.objects.get(
            project=project_id,
            user=request.user,
            workspace__slug=slug,
            page_id=page_id,
        )
        page_favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CreateIssueFromPageBlockEndpoint(BaseAPIView):
    permission_classes = [
        ProjectEntityPermission,
    ]

    def post(self, request, slug, project_id, page_id, page_block_id):
        page_block = PageBlock.objects.get(
            pk=page_block_id,
            workspace__slug=slug,
            project_id=project_id,
            page_id=page_id,
        )
        issue = Issue.objects.create(
            name=page_block.name,
            project_id=project_id,
            description=page_block.description,
            description_html=page_block.description_html,
            description_stripped=page_block.description_stripped,
        )
        _ = IssueAssignee.objects.create(
            issue=issue, assignee=request.user, project_id=project_id
        )

        _ = IssueActivity.objects.create(
            issue=issue,
            actor=request.user,
            project_id=project_id,
            comment=f"created the issue from {page_block.name} block",
            verb="created",
        )

        page_block.issue = issue
        page_block.save()

        return Response(IssueLiteSerializer(issue).data, status=status.HTTP_200_OK)

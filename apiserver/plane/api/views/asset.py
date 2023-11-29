# Third party imports
from rest_framework import status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from sentry_sdk import capture_exception
from django.conf import settings
# Module imports
from .base import BaseAPIView
from plane.db.models import FileAsset, Workspace
from plane.api.serializers import FileAssetSerializer


class FileAssetEndpoint(BaseAPIView):
    parser_classes = (MultiPartParser, FormParser)

    """
    A viewset for viewing and editing task instances.
    """

    def get(self, request, workspace_id, asset_key):
        asset_key = str(workspace_id) + "/" + asset_key
        files = FileAsset.objects.filter(asset=asset_key)
        if files.exists():
            serializer = FileAssetSerializer(files, context={"request": request}, many=True)
            return Response({"data": serializer.data, "status": True}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Asset key does not exist", "status": False}, status=status.HTTP_200_OK)


    def post(self, request, slug):
        serializer = FileAssetSerializer(data=request.data)
        if serializer.is_valid():
            # Get the workspace
            workspace = Workspace.objects.get(slug=slug)
            serializer.save(workspace_id=workspace.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, workspace_id, asset_key):
        asset_key = str(workspace_id) + "/" + asset_key
        file_asset = FileAsset.objects.get(asset=asset_key)
        # Delete the file from storage
        file_asset.asset.delete(save=False)
        # Delete the file object
        file_asset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserAssetsEndpoint(BaseAPIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, asset_key):
            files = FileAsset.objects.filter(asset=asset_key, created_by=request.user)
            if files.exists():
                serializer = FileAssetSerializer(files, context={"request": request})
                return Response({"data": serializer.data, "status": True}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Asset key does not exist", "status": False}, status=status.HTTP_200_OK)

    def post(self, request):
            serializer = FileAssetSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, asset_key):
            file_asset = FileAsset.objects.get(asset=asset_key, created_by=request.user)
            # Delete the file from storage
            file_asset.asset.delete(save=False)
            # Delete the file object
            file_asset.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

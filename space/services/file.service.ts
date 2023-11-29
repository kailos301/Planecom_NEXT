import APIService from "services/api.service";
import { API_BASE_URL } from "helpers/common.helper";
import axios from "axios";

interface UnSplashImage {
  id: string;
  created_at: Date;
  updated_at: Date;
  promoted_at: Date;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: null;
  alt_description: string;
  urls: UnSplashImageUrls;
  [key: string]: any;
}

interface UnSplashImageUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
  small_s3: string;
}

class FileService extends APIService {
  private cancelSource: any;

  constructor() {
    super(API_BASE_URL);
    this.uploadFile = this.uploadFile.bind(this);
    this.deleteImage = this.deleteImage.bind(this);
    this.cancelUpload = this.cancelUpload.bind(this);
  }

  async uploadFile(workspaceSlug: string, file: FormData): Promise<any> {
    this.cancelSource = axios.CancelToken.source();
    return this.post(`/api/workspaces/${workspaceSlug}/file-assets/`, file, {
      headers: {
        ...this.getHeaders(),
        "Content-Type": "multipart/form-data",
      },
      cancelToken: this.cancelSource.token,
    })
      .then((response) => response?.data)
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log(error.message);
        } else {
          throw error?.response?.data;
        }
      });
  }

  cancelUpload() {
    this.cancelSource.cancel("Upload cancelled");
  }
  getUploadFileFunction(workspaceSlug: string): (file: File) => Promise<string> {
    return async (file: File) => {
      const formData = new FormData();
      formData.append("asset", file);
      formData.append("attributes", JSON.stringify({}));

      const data = await this.uploadFile(workspaceSlug, formData);
      return data.asset;
    };
  }

  async deleteImage(assetUrlWithWorkspaceId: string): Promise<any> {
    return this.delete(`/api/workspaces/file-assets/${assetUrlWithWorkspaceId}/`)
      .then((response) => response?.status)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteFile(workspaceId: string, assetUrl: string): Promise<any> {
    const lastIndex = assetUrl.lastIndexOf("/");
    const assetId = assetUrl.substring(lastIndex + 1);

    return this.delete(`/api/workspaces/file-assets/${workspaceId}/${assetId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
  async uploadUserFile(file: FormData): Promise<any> {
    return this.mediaUpload(`/api/users/file-assets/`, file)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteUserFile(assetUrl: string): Promise<any> {
    const lastIndex = assetUrl.lastIndexOf("/");
    const assetId = assetUrl.substring(lastIndex + 1);

    return this.delete(`/api/users/file-assets/${assetId}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

const fileService = new FileService();

export default fileService;

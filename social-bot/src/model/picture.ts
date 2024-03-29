import { Media } from './media';
import { Metadata } from './metadata';

export class Picture implements Media {
  id: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: Metadata;
  filename: object;
  fullSizeUrl!: string;
  downloadUrl!: string;
  postedToFB: boolean;
  fbId: string | undefined;
  description?: string;
  constructor(obj: any) {
    this.id = obj.id;
    this.productUrl = obj.productUrl;
    this.baseUrl = obj.baseUrl;
    this.mimeType = obj.mimeType;
    this.mediaMetadata = new Metadata(obj.mediaMetadata);
    this.filename = obj.filename;
    this.setUrls();
    this.description = obj?.description;
    this.postedToFB = false;
    this.fbId = undefined;
  }

  public setUrls() {
    this.fullSizeUrl =
      this.baseUrl +
      `=w${this.mediaMetadata.width}-h${this.mediaMetadata.height}`;
    this.downloadUrl = this.baseUrl + `=d`;
  }
}

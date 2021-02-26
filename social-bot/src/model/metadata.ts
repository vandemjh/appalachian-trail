export class Metadata {
  creationTime: Date;
  width: string;
  height: string;
  photo: {
    cameraMake: string;
    cameraModel: string;
    focalLength: number;
    apertureFNumber: number;
    isoEquivalent: number;
  };
  constructor(obj: any) {
    this.creationTime = new Date(obj.creationTime);
    this.width = obj.width;
    this.height = obj.height;
    this.photo = obj.photo;
  }
}

/**
 * Interface defining the component's options object
 */
export interface CoreComponentOptions {
  // Add the definitions here
}

/**
 * Default options for the component
 */
export const DEFAULT_CORE_OPTIONS: CoreComponentOptions = {
  // Specify the values here
};

export type FileMetadata = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  bucket: string;
  key: string;
  acl: string;
  contentType: string;
  contentDisposition: string | null;
  contentEncoding: string | null;
  storageClass: string;
  serverSideEncryption: string | null;
  metadata: {
    fieldName: string;
  };
  location: string;
  etag: string;
  versionId?: string;
};

export enum StorageSource {
  S3,
}

export enum DeviceType {
  Web = 'web',
  Android = 'android',
  IOS = 'ios',
}

export interface PushRecipient {
  id: string;
  name?: string;
}

export interface PushReceiver {
  to: PushRecipient[];
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  receiver: PushReceiver;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface UserFcmRegistration {
  fcmToken: string;
  deviceId: string;
  userTenantId: string;
  deviceType?: DeviceType;
}

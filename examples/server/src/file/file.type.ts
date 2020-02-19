export interface File {
  fieldname: string;
  originalname: string;
  encoding: '7bit' | string;
  mimetype: 'image/jpeg' | string;
  buffer: Buffer;
  size: number;
}

export interface Owner {
  app_id: string;
  user_id: string;
  // upload time
  timestamp: number;
}

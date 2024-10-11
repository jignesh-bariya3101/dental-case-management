import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AwsAccessKeyId,
      secretAccessKey: process.env.AwsSecretAccessKey,
      region: process.env.AwsRegion
    });
  }
  async uploadOnS3(data: any) {
    let s3 = new AWS.S3({
      accessKeyId: process.env.AwsAccessKeyId,
      secretAccessKey: process.env.AwsSecretAccessKey
    });

    const params = {
      Bucket: data.bucket,
      Key: data.name,
      Body: data.file
    };

    try {
      let s3Response = await s3.upload(params).promise();
      return s3Response;
    } catch (e) {
      console.info(e);
    }
  }

  async getPresignedUrl(data: any) {
    let s3 = new AWS.S3({
      region: process.env.AwsRegion,
      signatureVersion: 'v4',
      accessKeyId: process.env.AwsAccessKeyId,
      secretAccessKey: process.env.AwsSecretAccessKey
    });
    const params = {
      Bucket: data.bucket,
      Key: data.key,
      Expires: 60 // Expiration time in seconds
    };

    // Generate the pre-signed URL
    try {
      let s3Response = await s3.getSignedUrlPromise('getObject', params);
      return {
        success: true,
        data: s3Response,
        message: 'Sussess'
      };
    } catch (e) {
      return {
        success: true,
        data: null,
        message: e.message
      };
    }
  }

  async deleteFile(bucketName: string, fileName: string) {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    try {
      const deleteFile = await this.s3.deleteObject(params).promise();

      return {
        success: true,
        data: deleteFile,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error(
        `Failed to delete file ${fileName} from ${bucketName}`,
        error,
      );
      return {
        success: false,
        data: {},
        message: error.message
      };
    }
  }
}

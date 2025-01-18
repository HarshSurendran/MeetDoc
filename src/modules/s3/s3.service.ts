import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Express } from 'express';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
    private client: S3Client;
    private bucketName: string;

    constructor() {
        this.client = new S3Client({
            region: process.env.AWS_BUCKET_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
            },
        });
        this.bucketName = process.env.AWS_BUCKET_NAME;
    }

    async uploadSingleFile({ file, isPublic = true }: { file: Express.Multer.File; isPublic: boolean }) {
        const key = `${uuidv4()}-${file.originalname}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: isPublic ? 'public-read' : 'private',
            Metadata: {
                originalName: file.originalname,
            },
        });

        const uploadResult = await this.client.send(command); 
        console.log("Uploaded result", uploadResult);

        return {            
            key,
            isPublic,
        };
    };

    // async getFileUrl(key: string) {
    //     return { url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
    // }

    async getPresignedSignedUrl(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const url = await getSignedUrl(this.client, command, {
            expiresIn: 60 * 60 * 24, // 24 hours
        });

        return { url };
    };

    async deleteFile(key: string): Promise<void> {
        try {
          const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          });
    
          await this.client.send(command);
          console.log(`File deleted successfully: ${key}`);
        } catch (error) {
          throw new Error(`Failed to delete file: ${error.message}`);
        }
    };

    async uploadPrescriptionFile({ file, isPublic = false }: { file: {originalname: string; buffer: Buffer, mimetype: string}; isPublic: boolean }) {
        const key = `prescriptions/${file.originalname}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: isPublic ? 'public-read' : 'private',
            Metadata: {
                originalName: file.originalname,
            },
        });

        const uploadResult = await this.client.send(command);
        console.log("Uploaded result", uploadResult);

        return {
            key,
            isPublic,
        };
    }
}
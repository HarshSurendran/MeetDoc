export interface IS3Service {
    uploadSingleFile({ file, isPublic }: { file: Express.Multer.File; isPublic: boolean }): Promise<{ key: string; isPublic: boolean }>
    getPresignedSignedUrl(key: string): Promise<{ url: string }>
    deleteFile(key: string): Promise<void> 
    uploadPrescriptionFile({ file, isPublic }: { file: {originalname: string; buffer: Buffer, mimetype: string}; isPublic: boolean }) : Promise<{ key: string; isPublic: boolean }>
}
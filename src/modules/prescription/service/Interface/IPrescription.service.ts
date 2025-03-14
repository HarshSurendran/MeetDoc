


export interface IPrescriptionService {
    generatePrescriptionPDF(prescription): Promise<{ key: string; isPublic: boolean; }>
}
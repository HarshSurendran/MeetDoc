import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrescriptionDocument } from './prescription.entity';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class PrescriptionService {
    constructor(
        @InjectModel('Prescription') private PrescriptionModel: Model<PrescriptionDocument>,
        private s3Service: S3Service,
    ) { }

    async generatePrescriptionPDF(prescription): Promise<{ key: string; isPublic: boolean; }>{
        try {
            const doc = new PDFDocument({ margin: 50 });
    
            const chunks: Buffer[] = [];
            doc.on('data', chunks.push.bind(chunks));            
    
            // Header Section
            doc
                .fontSize(24)
                .fillColor('#1976D2')
                .text('MeetDoc', { align: 'center', underline: true });
    
            doc.moveDown();
            doc
                .fontSize(12)
                .fillColor('black')
                .text(`Prescription ID: ${prescription._id}`, { align: 'right' })
                .text(`Date: ${new Date().toDateString()}`, { align: 'right' });
    
            doc.moveDown(2);
    
            // Doctor and Patient Details
            doc
                .fontSize(16)
                .fillColor('#333')
                .text('Doctor Details:', { underline: true })
                .moveDown(0.5)
                .fontSize(12)
                .text(`Name: Dr. ${prescription.doctorId.name}`)
                .text(`Specialization: ${prescription.doctorId.specialisation}`)
                .moveDown();
    
            doc
                .fontSize(16)
                .fillColor('#333')
                .text('Patient Details:', { underline: true })
                .moveDown(0.5)
                .fontSize(12)
                .text(`Name: ${prescription.patientId.name}`)
                .text(`Age: ${prescription.patientId.age}`)
                .text(`Gender: ${prescription.patientId.gender}`)
                .moveDown();
    
            // Medications Table
            doc
                .fontSize(16)
                .fillColor('#1976D2')
                .text('Medications', { underline: true })
                .moveDown(0.5);
    
            prescription.medications.forEach((med, index) => {
                doc
                    .fontSize(12)
                    .fillColor('black')
                    .text(
                        `${index + 1}. ${med.medicationName} - ${med.dosage} (${med.frequency}), Qty: ${med.quantity}`
                    );
            });
    
            doc.moveDown(1);
    
            // Additional Notes
            if (prescription.additionalNotes) {
                doc
                    .fontSize(14)
                    .fillColor('#1976D2')
                    .text('Additional Notes:', { underline: true })
                    .moveDown(0.5)
                    .fontSize(12)
                    .fillColor('black')
                    .text(prescription.additionalNotes);
                doc.moveDown(1);
            }
    
            // Follow-Up Date
            doc
                .fontSize(12)
                .fillColor('#333')
                .text(
                    `Follow-up Date: ${prescription.followUpDate
                        ? prescription.followUpDate.toDateString()
                        : 'Not specified'
                    }`
                );
    
            doc.moveDown(2);
    
            // Footer with Doctor's Signature
            doc
                .fontSize(12)
                .fillColor('#1976D2')
                .text('Doctor’s Signature:', { underline: true })
                .moveDown(1);
    
            doc.moveDown(2);
    
            // Footer with Platform Info
            doc
                .fontSize(10)
                .fillColor('#666')
                .text(
                    'This prescription is digitally generated and is valid without a physical signature.',
                    { align: 'center' }
                )
                .moveDown(0.5)
                .text('MeetDoc | www.meetdoc.com | support@meetdoc.com', {
                    align: 'center',
                });
    
            doc.end();
    
            return new Promise<{ key: string; isPublic: boolean; }>((resolve, reject) => {
                doc.on('end', async () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    console.log(pdfBuffer, "THis is the pdf buffer");
                    const fileName = `prescription_${prescription._id}.pdf`;
                    const uploadResult = await this.s3Service.uploadPrescriptionFile({
                        file: { buffer: pdfBuffer, mimetype: 'application/pdf', originalname: fileName },
                        isPublic: false
                    });
                    resolve(uploadResult);
                });
                doc.on('error', (err) => {
                    reject(err);
                });
            });
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException("Could not generate pdf. Please try again later.");
        };
    };

}


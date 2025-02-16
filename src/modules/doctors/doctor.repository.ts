import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Doctor, DoctorDocument } from "./schemas/doctors.schema";
import { Model } from "mongoose";
import { status } from "../users/schemas/users.schema";


@Injectable()
export class DoctorRepository {
    constructor(@InjectModel(Doctor.name) private DoctorModel: Model<DoctorDocument>) { }

    async getSingleDoctor(_id: string): Promise<DoctorDocument> {
        const doctor = await this.DoctorModel.findById(_id).exec();
        if (!doctor) {
            throw new NotFoundException("Doctor not found.")
        }
        return doctor;
    }

    async getTop5VerifiedDoctors(): Promise<DoctorDocument[]> {
        const doctors = await this.DoctorModel.find({ isVerified: true }).sort({ rating: -1 }).limit(5);
        if (doctors.length == 0) {
            throw new NotFoundException("No doctors available.")
        }
        return doctors;
    }

    async updateDoctorStatus(_id: string, status: status): Promise<DoctorDocument> {
        return await this.DoctorModel.findByIdAndUpdate(_id, {
            $set: { status, lastSeen: new Date() },
        });
    }
    
    async getMonthlyData() {
        return await this.DoctorModel.aggregate(
            [
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" }, // Extract year
                            month: { $month: "$createdAt" } // Extract month
                        },
                        count: { $sum: 1 } // Count the documents
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
                }
            ]
        )
    }

    async getTotalDocuments() {
        return await this.DoctorModel.countDocuments();
    }

    async convertDate() {
        return await this.DoctorModel.updateMany(
          {},
          [{ $set: { createdAt: { $toDate: "$createdAt" } } }]
        )
    }
}

export enum BookingStatus {
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    Scheduled = 'Scheduled',
    InProgress = 'InProgress',
}

export interface IBookedAppointmentType {
    reason: string,
    bookingStatus: BookingStatus,
    duration: number,
    _id: string,
    patientName: string,
    doctorName: string,
    date: Date,
    time: Date
}


export interface IBookedAppointmentDBReturn {
    reason: string,
    bookingStatus: BookingStatus,
    slots: {
        _id: string,
        doctorId: string,
        StartTime: Date,
        EndTime: Date,
        status: string,
        pendingBookingExpiry: null
    },
    _id: string,
    patientName: string,
    doctorName: string,
    date: Date,
    time: Date
}
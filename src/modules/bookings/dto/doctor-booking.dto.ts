
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
    bookingTime: string,
    date: string,
    time: string
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
    bookingTime: Date,
    _id: string,
    patientName: string,
    doctorName: string,
    date: Date,
    time: Date
}
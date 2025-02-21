
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
    patientId: string,
    doctorName: string,
    bookingTime: string,
    date: Date,
    time: string,
    appointmentFor?: string,
    appointmentForName?: string
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
    patientId: string,
    patientName: string,
    doctorName: string,
    appointmentFor: string,
    appointmentForName: string,
    date: Date,
    time: Date
}
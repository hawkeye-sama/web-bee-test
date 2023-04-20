export interface AppointmentInput {
  startTime: Date;
  endTime: Date;
  clients: {
    email: string;
    firstName: string;
    lastName: string;
  }[];
}

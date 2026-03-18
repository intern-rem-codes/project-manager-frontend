export type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

export type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string | null;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

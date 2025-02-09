export interface UserCreate {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  userType: string;
  teamName?: string;
  role?: string;
}

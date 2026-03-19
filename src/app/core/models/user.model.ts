export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export interface StoredUser extends AppUser {
  password: string;
}


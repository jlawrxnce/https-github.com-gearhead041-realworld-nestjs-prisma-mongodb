export interface LoginDto {
  email: string;
  password: string;
}

export interface UserDto {
  email: string;
  token: string;
  username: string;
  bio: string;
  image?: string;
}

export interface UserForRegistration {
  email: string;
  password: string;
  username: string;
}

export interface UserForUpdate {
  email?: string;
  username?: string;
  bio?: string;
  image?: string;
}

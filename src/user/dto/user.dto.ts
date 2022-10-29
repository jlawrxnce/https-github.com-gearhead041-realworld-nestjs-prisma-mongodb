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
  username: string;
  email: string;
  passeword: string;
}

export interface UserForUpdate {
  email?: string;
  username?: string;
  bio?: string;
  image?: string;
}

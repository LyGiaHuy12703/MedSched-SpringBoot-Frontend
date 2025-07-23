export type LoginRequest = {
  email: string
  password: string
}
export type RegisterRequest = {
  email: string
  password: string
  name: string
}
export type VerifyCode = {
  email: string
  code: string
}
export type AuthResponse = {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  access_token: string
  refresh_token: string
}
export type Account = {
  user: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl: string
    phone: string
    address: string
    gender: string
    dob: string
    age: number
  }
}
export type RequestUpdateInfo = {
  name: string
  email: string
  phone: string
  address: string
  gender: string
  dob: string
  age: number
}
export type ChangePassword = {
  password: string
  newPassword: string
}
export type DecodedToken = {
  sub: string
  permission: string[]
  exp: number
  iat: number
  user: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl: string
    phone: string
    address: string
    gender: string
    dob: string
    age: number
  }
}

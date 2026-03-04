export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NetworkError extends AppError {
  constructor(message = '網路連線錯誤') {
    super(message, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

export class AuthError extends AppError {
  constructor(message = '帳號或密碼錯誤') {
    super(message, 'AUTH_ERROR')
    this.name = 'AuthError'
  }
}

export class ServerError extends AppError {
  constructor(
    message = '伺服器錯誤',
    public readonly status: number = 500,
  ) {
    super(message, 'SERVER_ERROR')
    this.name = 'ServerError'
  }
}

export class ValidationError extends AppError {
  constructor(
    message = '輸入資料有誤',
    public readonly fields?: Record<string, string>,
  ) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

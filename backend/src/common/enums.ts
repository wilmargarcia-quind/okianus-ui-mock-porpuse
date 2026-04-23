export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  CLIENT = 'CLIENT',
}

export enum MovementType {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATED = 'GENERATED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

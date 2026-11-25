

export const ROLES = ["user", "admin", "employee", "seller", "preview"] as const
export type Role = (typeof ROLES)[number]

export const ADMIN_ROLES: readonly Role[] = ["admin"]
export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value)
}



export const DEFAULT_ROLE: Role = 'user'


export const SELLER_STATUSES = ["pending", "active", "rejected", "terminated"] as const
export type SellerStatus = (typeof SELLER_STATUSES)[number]
export function isSellerStatus(value: unknown): value is SellerStatus {
  return typeof value === 'string' && (SELLER_STATUSES as readonly string[]).includes(value)
}


export const EMPLOYEE_ROLES = [
  "packer",
  "deliveryman",
  "accounts",
  "incharge",
  "call_center"
] as const
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number]
export function isEmployeeRole(value: unknown): value is EmployeeRole {
  return typeof value === "string" && (EMPLOYEE_ROLES as readonly string[]).includes(value)
}

export const STAFF_ROLES: readonly Role[] = ["admin", "employee", "preview"]
export function isStaffRole(role: string | undefined): boolean {
  return Boolean(role) && (STAFF_ROLES as readonly string[]).includes(role as string)
}
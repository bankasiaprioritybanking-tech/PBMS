# Security Specification

## 1. Data Invariants
- Users: Must have a unique uid, roleIds.
- Customers: Must have a unique customerId.
- ServiceRequests: Must have a unique requestId and a valid customerId.

## 2. The "Dirty Dozen" Payloads (examples)
1. {uid: "123", name: "Evil", email: "evil@bank.com", roleIds: ["admin"]} (Illegal role)
2. {requestId: "req-1", customerId: "cust-1", serviceType: "Loan", stage: "NEW", status: "PENDING", createdAt: "123456"} (Invalid timestamp)
3. {customerId: "cust-1", name: "John", segment: "Gold", branch: "Main", rmId: "rm1", status: "ACTIVE", createdAt: null} (Missing createdAt)
... (etc)

## 3. Test Runner
(See `firestore.rules.test.ts`)

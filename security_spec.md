# Security Specification: RH-RWA Conference Firestore Security Rules

## 1. Data Invariants
1. `sessions`: Document ID must be a valid safe identifier (e.g. `rwa_live`). Only whitelisted fields (`phase`, `command`, `commandValue`, `commandTimestamp`, `lastResetTimestamp`, `updatedAt`) are accepted.
2. `form1_submissions`: Document ID must be valid (`f1_...`). Must contain `id`, `name`, `amount`, `meetsMinimum`, `timestamp`. `amount` must be a non-negative number.
3. `form2_submissions`: Document ID must be valid (`f2_...`). Must contain `id`, `name`, `tokens`, `amount`, `m2`, `timestamp`. `tokens` must be positive.
4. `survey_submissions`: Document ID must be valid (`surv_...`). Must contain `id`, `name`, `email`, `ratingQuality` (1-5), `ratingClarity` (1-5), `npsScore` (1-10), `timestamp`.
5. Unbounded payloads, negative amounts, oversized strings, and undefined collections are strictly rejected.

## 2. Dirty Dozen Test Cases (Must be rejected)
1. Injecting a 2MB string into `name` or `comments`.
2. Setting negative `amount` in `form1_submissions` (e.g., `-50000`).
3. Setting negative `tokens` in `form2_submissions` (e.g., `-100`).
4. Supplying rating outside boundaries in `survey_submissions` (e.g., `ratingQuality: 99`).
5. Supplying an arbitrary unknown collection (e.g., `/admin_passwords/{id}`).
6. Updating a submitted response by modifying its identifier or amounts.
7. Deleting session subcollections without authorization.
8. Writing an invalid document ID with traversal characters (`../`).
9. Submitting a survey with non-string `email` or missing mandatory fields.
10. Submitting Form 1 without `amount` or with `amount` as boolean.
11. Injecting ghost fields into `form1_submissions` (e.g., `isAdmin: true`).
12. Attempting to tamper with session document using unrecognized command string.

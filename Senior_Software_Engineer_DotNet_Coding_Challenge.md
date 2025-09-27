# Senior Software Engineer .NET — Coding Challenge

**By Raihan Mahmud Arman**  
**Date:** Sept 21, 2025

---

## Challenge Overview

You are tasked with implementing a dataspace branding assets management feature for the portal-backend administration service. This feature allows dataspace operator admin to upload and manage branding assets (logo and footer text), while making these assets publicly accessible to all users of the portal. This challenge will test your ability to work with .NET Core Web APIs, Entity Framework, and frontend integration within this enterprise-grade dataspace platform.

---

## Key Requirements

- **Public Access:** Anyone can retrieve branding assets (no authentication required).
- **Operator Management:** Only dataspace operator admins can upload, update, or delete assets.
- **Dynamic Branding:** Frontend components should use these assets instead of static files from `portal-assets`.
- **Fallback Strategy:** Maintain fallback to existing `portal-assets` for backward compatibility.

---

## Challenge Description

### Backend Requirements (Portal-Backend)

#### 1) Understanding the Authorisation System

> **CRITICAL RESEARCH TASK:** Before implementing any APIs, you must understand how the existing authorisation system works.

**Questions to investigate:**

- How are **"Operator"** and **"CX Admin"** defined in this system?
- How do users get assigned roles and permissions?
- What is the relationship between **Company Roles**, **User Role Collections**, and **User Roles**?
- How does JWT token authentication work with **Keycloak**?
- What authorisation patterns do existing controllers use?

**Your mission:** Figure out how to properly map **“Operator”** and **“CX Admin”** to a new `manage_branding_assets` permission.

#### 2) Create Branding Assets Management APIs

You need to implement APIs in the administration service to manage dataspace branding assets.

> **Required Endpoints:** These are suggested, you are free to propose your's idea as well!

##### Public (No Authorisation Required)

- `GET /api/administration/branding/assets` — Retrieve all branding assets (public).
- `GET /api/administration/branding/assets/{assetType}` — Retrieve specific asset type (public).

##### Authorisation Required (Operator and CX-Admin with `manage_branding_assets`)

- `POST /api/administration/branding/assets` — Upload/set branding assets (operator admin only).
- `PUT /api/administration/branding/assets/{assetType}` — Update specific asset type (operator admin only).
- `DELETE /api/administration/branding/assets/{assetType}` — Remove specific asset type (operator admin only).

##### Asset Types

- **logo** — Company logo (SVG, PNG, JPG formats).
- **footer** — Footer text content (plain text).

#### 3) Technical Specifications

##### File Handling

- **Logo:** Max **1MB**, formats: **SVG, PNG, JPG**.
- **Footer:** Max **1000 characters**, plain text.
- Store file content as **binary data** in the database.
- Store **metadata** including original filename, content type, file size, and upload timestamp.
- Implement proper **Content-Type** headers when serving files from database.

##### Validation

- File type validation.
- File size validation.
- Required field validation.

##### Authorisation Implementation Challenge

- **Research Question:** How do you ensure only Operator users can access the management endpoints?
- **Discovery Task:** Find existing patterns where role-based authorisation is used.
- **Implementation Challenge:** You need to configure the system so that `[Authorize(Roles = "manage_branding_assets")]` works for Operators.
- **Testing Requirement:** Prove that non-Operators are properly rejected.

##### Error Handling

- Proper **HTTP status codes**.
- Detailed **error messages**.
- **Logging** for debugging.

---

### Frontend Requirements (Portal-Frontend)

#### 1) Create Branding Assets Service

> These are suggested, you are free to propose your's idea as well!

**Service Implementation:**

- Create `BrandingAssetsService` in `src/services/`.
- Implement methods to call the new backend APIs.
- **Note:** Only implement `GET` methods for public asset retrieval (no authentication required).
- Follow existing patterns from other services (see `CompanyService.ts` and `UserService.ts`).
- Include proper error handling.

#### 2) Update UI Components

**Logo Component:**

- Modify `src/components/shared/frame/Logo/index.tsx`.
- **Current Implementation:** Uses static assets from `portal-assets` (see `getAssetBase()` function).
- **New Implementation:** Fetch logo from the new API instead of static assets.

**Fallback Strategy (Logo):**

1. Try your new dynamic API: `/api/administration/branding/assets/logo`.
2. Fall back to `portal-assets`.
3. Add loading state and error handling.

**Asset Reference:** Current logo at `http://localhost:3003/assets/images/logos/cx-text.svg`.

**Footer Component:**

- Modify `src/components/shared/frame/Footer/index.tsx`.
- **Current Implementation:** Uses footer text from translation files.
- **New Implementation:** Fetch footer text from the new API.

**Fallback Strategy (Footer):**

1. Try your new dynamic API: `/api/administration/branding/assets/footer`.
2. Fall back to existing translation text.
3. Add loading state and error handling.

**Current Text Reference:** Check existing footer translations for default content.

#### 3) Admin Interface (Optional — Bonus Points)

Create an admin interface for dataspace operators to manage branding assets:

- Upload form for logo (**requires to be an Operator — CX Admin**).
- Text input for footer content (**requires operator authentication**).
- File validation feedback.

**authorisation Challenge:** How will you ensure this interface is only accessible to users with the proper role? Research existing admin interfaces in the codebase.

---

## Submission

Please provide:

- **GitHub Repository Links:** Links to your forked repositories with your implementation.
- **Commit History:** Clear, descriptive commit messages showing your development process.
- **Setup Instructions:** Updated setup instructions for your implementation.
- **API Documentation:** Swagger/OpenAPI documentation for your new endpoints.
- **authorisation Discovery Report:** Explain how you researched and understood the role system.
- **Implementation Summary:** Describe your approach to mapping Operator — CX Admin to the `manage_branding_assets` role.
- **Testing Results:** Demonstrate that your authorisation works correctly (Operators can access, non-Operators cannot).
- **Problem-Solving Process:** Document the challenges you encountered and how you solved them.
- **Assumptions/Limitations:** Any assumptions or limitations you encountered.

---

## Submission Format

- **Primary Repository:** Your forked **portal-backend** repository (contains the main implementation).
- **Secondary Repository:** Your forked **portal-frontend** repository (contains frontend integration).
- **Documentation:** Include a **README** in your fork explaining your changes and how to test them.

---

## Important Notes

This is a **Discovery Challenge**: Success is measured by your ability to understand and work with complex enterprise systems, not just by producing working code. We value:

- 🔍 **Research methodology** — How you approached understanding the authorisation system.
- 🧩 **Problem-solving process** — How you figured out the role mapping challenge.
- 📚 **Learning demonstration** — Evidence that you understand the broader system architecture.
- 🛠️ **Implementation quality** — Clean code that follows established patterns.

**Key Success Factors:**

- Take time to understand the existing patterns before implementing.
- Document your discovery process and decision-making.
- Test your authorisation thoroughly with different user types.
- Explain not just what you built, but **why** you built it that way.

Remember: We value problem-solving approach, learning ability, and clean implementation over perfection. **Show us how you think and learn!**

**Good luck! 🚀**

---

## Quick Reference

### Endpoint Summary

| Method | Endpoint                                          | Auth                                         | Purpose                      |
| -----: | ------------------------------------------------- | -------------------------------------------- | ---------------------------- |
|    GET | `/api/administration/branding/assets`             | Public                                       | Retrieve all branding assets |
|    GET | `/api/administration/branding/assets/{assetType}` | Public                                       | Retrieve specific asset type |
|   POST | `/api/administration/branding/assets`             | Operator/CX-Admin + `manage_branding_assets` | Upload/set branding assets   |
|    PUT | `/api/administration/branding/assets/{assetType}` | Operator/CX-Admin + `manage_branding_assets` | Update a specific asset type |
| DELETE | `/api/administration/branding/assets/{assetType}` | Operator/CX-Admin + `manage_branding_assets` | Remove a specific asset type |

### Asset Types & Limits

| Asset Type | Description              | Constraints                   |
| ---------- | ------------------------ | ----------------------------- |
| `logo`     | Company logo             | SVG/PNG/JPG; max size **1MB** |
| `footer`   | Footer text (plain text) | Max **1000 characters**       |

### Data & Storage

- Store **binary content** in DB.
- Persist **metadata**: filename, content type, size, upload timestamp.
- Serve with correct **Content-Type** headers.

### Validation & Errors

- Validate file **type**, **size**, and required fields.
- Use appropriate **HTTP status codes** and **detailed error** messages.
- Implement robust **logging**.

---

_End of document._

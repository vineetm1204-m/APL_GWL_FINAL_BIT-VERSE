/**
 * Firestore Security Rules
 * --------------------------
 * Production-ready security rules for GrievanceMap.
 * Deploy with: firebase deploy --only firestore:rules
 *
 * Note: This file is for documentation and local testing.
 * The actual rules are deployed via firestore.rules file.
 */

export const FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── Helper Functions ────────────────────────────────
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function hasRole(role) {
      return isAuthenticated() && getUserRole() == role;
    }

    function hasAnyRole(roles) {
      return isAuthenticated() && getUserRole() in roles;
    }

    function isAdmin() {
      return hasAnyRole(['city_admin', 'super_admin']);
    }

    function isOfficer() {
      return hasAnyRole(['ward_officer', 'department_head']);
    }

    // ─── Users Collection ────────────────────────────────
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();

      match /notifications/{notificationId} {
        allow read, update: if isOwner(userId);
        allow create: if isAuthenticated();
      }

      match /activity/{activityId} {
        allow read: if isOwner(userId) || isAdmin();
        allow create: if isAuthenticated();
      }
    }

    // ─── Grievances Collection ────────────────────────────
    match /grievances/{grievanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.reportedBy == request.auth.uid ||
        isOfficer() ||
        isAdmin()
      );
      allow delete: if isAdmin();

      match /comments/{commentId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if request.auth.uid == resource.data.authorId;
        allow delete: if isAdmin();
      }

      match /timeline/{timelineId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
      }

      match /attachments/{attachmentId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
      }
    }

    // ─── Wards Collection ─────────────────────────────────
    match /wards/{wardId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();

      match /analytics/{analyticsId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
    }

    // ─── Categories Collection ────────────────────────────
    match /categories/{categoryId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // ─── Analytics Collection ─────────────────────────────
    match /analytics/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // ─── AI Logs Collection ───────────────────────────────
    match /ai_logs/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Only writable by Cloud Functions
    }

    // ─── System Config ────────────────────────────────────
    match /system_config/{configId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('super_admin');
    }
  }
}
`;

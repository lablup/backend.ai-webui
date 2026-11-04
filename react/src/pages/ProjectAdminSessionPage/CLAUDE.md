# ProjectAdminSessionPage

- Route: `/project/:projectName/admin/session` (menu "Sessions" in the project admin group), project admins of that project, plus superadmin members by URL (`access: 'projectAdmin'`).
- A project admin's view of every member's sessions in the project, with the project-admin terminate flow (`components/TerminateSessionModalForProjectAdmin`).

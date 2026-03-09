# Project Management E2E Tests

## Application Overview

E2E tests for the Project Management page (/project) in Backend.AI WebUI. Superadmin CRUD operations for projects with BAIProjectTable and BAIProjectSettingModal.

## Test Scenarios

### 1. Project CRUD



#### 1.1. Admin can see project list with expected columns

**File:** `e2e/project/project-crud.spec.ts`

**Steps:**
  1. Navigate to /project page after admin login
    - expect: The Project tab should be selected
    - expect: A table with columns Name, Controls, Domain should be visible
    - expect: At least one project row (default) should exist
  2. Verify the default project row
    - expect: A row with name 'default' should be visible
    - expect: Active column should show 'true'
    - expect: Type column should show 'GENERAL'

#### 1.2. Admin can create a new project

**File:** `e2e/project/project-crud.spec.ts`

**Steps:**
  1. Click the 'Create Project' button
    - expect: A dialog titled 'Create Project' should appear with fields: Name, Description, Domain, Resource Policy, Is Active
  2. Fill Name with unique test name, Description with 'Test project for E2E', select Domain 'default'
    - expect: Fields should contain entered values
  3. Click OK button
    - expect: Dialog should close
    - expect: New project should appear in the table

#### 1.3. Admin can edit a project

**File:** `e2e/project/project-crud.spec.ts`

**Steps:**
  1. Click the setting button on the test project row
    - expect: A dialog titled 'Update Project' should appear
    - expect: Name field should contain the test project name
  2. Change Description to 'Updated E2E description' and click OK
    - expect: Dialog should close
    - expect: Updated description should be visible in the table

#### 1.4. Admin can filter projects by name

**File:** `e2e/project/project-crud.spec.ts`

**Steps:**
  1. Type test project name in filter value search and click search button
    - expect: Table should show only the matching project
  2. Clear the filter tag
    - expect: All projects should be visible again

#### 1.5. Admin can delete a project

**File:** `e2e/project/project-crud.spec.ts`

**Steps:**
  1. Click the delete button on the test project row
    - expect: A confirmation dialog should appear
  2. Confirm deletion
    - expect: The test project should be removed from the table

# user-profile-management Specification

## Purpose
Permitir que cada pessoa autenticada consulte e mantenha seus dados pessoais e sua foto de perfil em uma área própria e segura.
## Requirements
### Requirement: Personal profile page

The application SHALL provide the authenticated user a personal profile route at `/perfil` that presents their current profile photo, username, email, telephone number, and access level.

#### Scenario: Authenticated user opens the profile

- **WHEN** an authenticated user visits `/perfil`
- **THEN** the application presents the current account information and profile photo
- **AND** identifies the access level as account information

### Requirement: Editable personal profile information

The personal profile page SHALL allow the authenticated user to update their username, email address, telephone number, and profile photo through authenticated backend requests. It SHALL not provide a self-service action to change the account access level.

#### Scenario: User saves personal information

- **WHEN** the user changes one or more editable textual profile fields and saves valid information
- **THEN** the application submits the updated profile to the backend
- **AND** presents a success notification when the backend confirms the update
- **AND** reflects the saved information in the profile and shared account identification

#### Scenario: User uploads a profile photo

- **WHEN** the user selects a valid image and confirms the profile update
- **THEN** the application sends the image to the authenticated profile-image endpoint
- **AND** refreshes the displayed profile photo after the upload succeeds

#### Scenario: Profile update fails

- **WHEN** a profile or photo update request fails
- **THEN** the application preserves the user's entered values and presents a readable error
- **AND** does not replace the shared authenticated user data with an unconfirmed value


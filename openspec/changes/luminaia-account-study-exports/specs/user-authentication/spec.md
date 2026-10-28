## ADDED Requirements

### Requirement: Public password recovery navigation
The public authentication experience SHALL let an anonymous visitor navigate from login to password recovery, submit a recovery request, and return to login without entering the protected application shell.

#### Scenario: Visitor opens password recovery from login
- **WHEN** an anonymous visitor chooses the forgotten-password action
- **THEN** the application opens the public recovery request experience
- **AND** keeps the visitor outside protected platform content

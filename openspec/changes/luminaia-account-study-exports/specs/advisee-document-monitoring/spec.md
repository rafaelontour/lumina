## ADDED Requirements

### Requirement: Read-only study guide in advisee monitoring
The administrator's advisee monitoring workspace SHALL display each accessible project's study guide and project progress without allowing the advisor to mark the advisee's materials as studied. For a uniquely matched project with a document group, an authorized administrator MAY manage that group's materials. The guide SHALL be shared by the project's document group and SHALL NOT imply that the advisor can configure personalized materials for one advisee.

#### Scenario: Advisor opens an advisee project guide
- **WHEN** an administrator opens the guide for an advisee's project
- **THEN** the application displays the returned group stages, materials, and progress
- **AND** does not display controls to mark or unmark materials
- **AND** may offer group-material management while clearly warning that changes apply to all projects using the group

#### Scenario: Advisee project has no guide group
- **WHEN** an advisee project has no document group
- **THEN** the monitoring view presents a readable empty state

## MODIFIED Requirements

### Requirement: Conformity Dispatch Isolation

The upload flow SHALL NOT trigger template or ABNT conformity checks after backend document and release creation.

#### Scenario: Component PDF is uploaded

- **WHEN** a component PDF upload completes backend document and release creation
- **THEN** the application continues its main analysis readiness tracking
- **AND** does not send the PDF to either conformity endpoint automatically

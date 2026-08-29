## Purpose
Document the baseline application shell, navigation, home screen, and theming behavior currently present in Lumina.
## Requirements
### Requirement: Fixed Application Shell
The application SHALL render all pages inside a fixed-height shell with a header, a sidebar menu, and a scrollable main content area.

#### Scenario: User opens any application page
- **WHEN** a page is rendered inside the root layout
- **THEN** the user sees the shared header, sidebar navigation, and page content region

### Requirement: Collapsible Sidebar State
The application SHALL allow the sidebar to be collapsed or expanded and persist that preference in a browser cookie.

#### Scenario: User toggles the menu
- **WHEN** the user activates the menu toggle in the header
- **THEN** the sidebar width changes and the `lumina-menu-recolhido` cookie stores the selected state

### Requirement: Theme Switching
The application SHALL provide light and dark themes through CSS design tokens without persisting shell preferences in localStorage.

#### Scenario: User toggles the theme
- **WHEN** the user activates the theme control in the header
- **THEN** the resolved theme switches between light and dark visual tokens

### Requirement: Feature Navigation
The sidebar SHALL expose navigation entries for Inicio, Oiac IA, Documentos, Tipificacoes, Conformidade Template, and Conformidade ABNT.

#### Scenario: User selects a menu item
- **WHEN** the user clicks a sidebar item
- **THEN** the application navigates to that feature route and highlights the active route

### Requirement: Animated Home Entry
The home page SHALL present the Lumina brand with animated visual treatment and links into Oiac IA.

#### Scenario: User opens the home route
- **WHEN** the user visits `/`
- **THEN** the user sees the Lumina logo, an animated visual effect, feature summaries, and a call to access Oiac IA

### Requirement: Cookie-Scoped Browser Preferences
The application shell SHALL use browser cookies, not localStorage, for persistent lightweight browser preferences.

#### Scenario: Sidebar preference is saved
- **WHEN** the user changes the sidebar collapsed state
- **THEN** the selected state is persisted in a browser cookie

#### Scenario: Persistent browser preference is needed
- **WHEN** the application needs to persist a lightweight browser preference
- **THEN** the preference is stored through a cookie unless the preference is intentionally session-only

### Requirement: No localStorage Preference Persistence
The application shell SHALL NOT persist shell preferences in localStorage.

#### Scenario: Theme or shell preference changes
- **WHEN** a shell-level preference changes
- **THEN** the application does not write that preference to localStorage

### Requirement: Fixed Root Layout
The application shell SHALL prevent vertical scrolling on the root document layout.

#### Scenario: Page content is taller than the viewport
- **WHEN** a page needs vertical scrolling
- **THEN** scrolling occurs inside the main content area and not on the root `html` or `body` layout

### Requirement: Filled Active Navigation Item
The app shell SHALL present the active sidebar navigation item with a filled brand-colored background and high-contrast foreground.

#### Scenario: User views the current route in the sidebar
- **WHEN** a sidebar navigation item matches the current route
- **THEN** the item uses a filled brand-colored background
- **AND** the item icon and label use a high-contrast foreground color

#### Scenario: User hovers the active navigation item
- **WHEN** the user hovers the active sidebar navigation item
- **THEN** the active styling remains unchanged

#### Scenario: User hovers an inactive navigation item
- **WHEN** the user hovers an inactive sidebar navigation item
- **THEN** the item may use the standard inactive hover styling

### Requirement: Persistent Feature Page Headers
The application SHALL keep the page header visible while the user scrolls the content of every feature route that renders a page title or primary page action, including Oiac IA, Documentos, Tipificações, Conformidade Template, and Conformidade ABNT.

#### Scenario: User scrolls a feature route
- **WHEN** the content of a feature route extends beyond the visible main content area and the user scrolls it
- **THEN** that route's page header remains visible within the main content area
- **AND** the fixed application shell remains visible and functional

#### Scenario: Feature route has no page header
- **WHEN** a route does not render a page header
- **THEN** the application does not introduce an empty persistent header solely for this behavior

### Requirement: Authenticated user identification in sidebar

The expanded sidebar SHALL show the authenticated user's profile photo, username, and a “Ver perfil” action that navigates to `/perfil`. When the sidebar is collapsed, it SHALL retain an accessible compact profile action.

#### Scenario: User views expanded sidebar

- **WHEN** an authenticated user views the expanded application sidebar
- **THEN** the sidebar displays their profile photo and username
- **AND** displays a “Ver perfil” action that navigates to the personal profile route

#### Scenario: User views collapsed sidebar

- **WHEN** an authenticated user collapses the sidebar
- **THEN** the sidebar keeps an accessible compact action for the personal profile route
- **AND** does not expose the username outside the collapsed sidebar bounds

### Requirement: Blurred modal backdrops

The application SHALL apply a subtle backdrop blur behind every modal dialog that overlays an already visible platform page. The backdrop SHALL retain sufficient translucent contrast to distinguish the inactive page from the dialog, while preserving the dialog's existing behavior and stacking order. Toasts, non-modal floating notices, and full-page blocking states without an underlying platform page SHALL not receive this treatment.

#### Scenario: User opens a modal dialog

- **WHEN** a modal dialog opens over a platform page
- **THEN** the inactive page behind its translucent backdrop appears subtly blurred
- **AND** the dialog remains clear and interactive

#### Scenario: User receives a non-modal notice

- **WHEN** the application shows a toast or floating status notice
- **THEN** it does not blur the platform page

#### Scenario: User sees a full-page blocking state

- **WHEN** the application replaces protected content with a full-page blocking state
- **THEN** it does not add a modal backdrop blur without an underlying visible page


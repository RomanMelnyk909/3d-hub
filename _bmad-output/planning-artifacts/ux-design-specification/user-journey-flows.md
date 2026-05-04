# User Journey Flows

## Journey 1: Consumer Discovery & Download (Maya's Happy Path)

```mermaid
flowchart TD
    A([Arrive: Search engine or homepage]) --> B{Entry point?}
    B -->|Direct model page| E
    B -->|Homepage| C[Browse photo card grid]
    C --> C1[Filter by category pill or search bar]
    C1 --> D[Click model card]
    D --> E[Model page: view printed photos]
    E --> F[Read structured print metadata\nlayer height · infill · supports · filament]
    F --> G{Confident this will print?}
    G -->|No — missing info or bad photos| H[Browse back to grid]
    H --> C
    G -->|Yes| I[Click Download button]
    I --> J{Authenticated?}
    J -->|Yes| K[File downloads immediately]
    J -->|No| L[Registration modal appears\nmodel preview still visible]
    L --> M[Enter email + password]
    M --> N{Valid?}
    N -->|Email already exists| O[Show: Log in instead?]
    O --> P[Login form] --> K
    N -->|Validation error| Q[Inline field errors] --> M
    N -->|Success| R[Account created]
    R --> K
    K --> S([✅ Download complete — download count increments])
```

## Journey 2: Creator Upload & Publish (Tomas's Happy Path)

```mermaid
flowchart TD
    A([Click Upload button]) --> B{Authenticated?}
    B -->|No| C[Redirect to registration/login]
    C --> D[Register or log in] --> E
    B -->|Yes| E[Upload wizard opens — Step 1: Files]
    E --> F[Drag-and-drop or browse STL/3MF files]
    F --> G{File valid?}
    G -->|Wrong type or over 25MB| H[Inline error: specific reason]
    H --> F
    G -->|Valid| I[Step 2: Photos]
    I --> J[Upload 1+ printed photos — positive framing: Show off your result]
    J --> K{At least 1 photo uploaded?}
    K -->|No — try to skip| L[Step blocked: explain why photo required]
    L --> J
    K -->|Yes| M[Step 3: Details]
    M --> N[Fill title, description, print metadata — all required]
    N --> O{All required fields complete?}
    O -->|No| P[Highlight missing fields inline] --> N
    O -->|Yes| Q[Step 4: Tags]
    Q --> R[Select predefined chips + add custom tags optional]
    R --> S[Step 5: Preview & Publish]
    S --> T[See live preview of card + model page]
    T --> U[Check license consent checkbox]
    U --> V{Publish or Save Draft?}
    V -->|Save Draft| W([Draft saved — resume later])
    V -->|Publish| X{Publish succeeds?}
    X -->|Error| Y[Toast: specific error message] --> T
    X -->|Success| Z[Redirect to live model page]
    Z --> AA([✅ Your model is live! toast — URL ready to share])
```

## Journey 3: Registration Gate (Conversion Moment)

```mermaid
flowchart TD
    A([Unauthenticated visitor clicks Download]) --> B[Registration modal opens\nModel preview remains visible behind modal]
    B --> C{Already have account?}
    C -->|Yes| D[Switch to Log In view]
    D --> E[Enter email + password]
    E --> F{Login valid?}
    F -->|Invalid credentials| G[Error: incorrect email or password] --> E
    F -->|Valid| K
    C -->|No| H[Register: email + password only]
    H --> I{Form valid?}
    I -->|Email already registered| J[Error: Email already in use — log in instead]
    J --> D
    I -->|Password too short| L[Inline password hint] --> H
    I -->|Valid| M[Account created]
    M --> N[Brief welcome message in modal]
    N --> K[Download starts automatically]
    K --> O([✅ File delivered — user is now registered])
```

## Journey Patterns

**Navigation patterns:**
- Every journey has a single clear entry point and a single success state — no ambiguous endings
- Back navigation always returns to the browse context, never to a blank or dead-end state
- Wizard steps are linear but resumable via Save Draft — abandonment does not mean lost work

**Decision gate patterns:**
- **Soft gates** (missing metadata, incomplete fields): show inline errors and let the user fix in place — never block the whole step with a full-page error
- **Hard gates** (auth required to download, photo required to publish): always explain the reason at the point of blocking, never just refuse silently

**Feedback patterns:**
- **Inline / immediate:** field-level validation errors appear at the point of incorrect input
- **Step-level:** wizard progress indicator always visible; user knows where they are in 5 steps
- **Action confirmation:** toast notification + redirect on publish; auto-download trigger on register+download

**Error recovery patterns:**
- Every error state is specific and actionable — no "something went wrong" dead ends
- "Email already registered" errors offer a direct path to login rather than a dead end
- Storage/upload errors on publish return the user to the preview step, not the beginning

## Flow Optimization Principles

1. **Success path is always the shortest path** — happy path has no unnecessary stops; branches add steps only when unavoidable
2. **Block late, not early** — validation errors surface at the moment of attempted progress, not on field blur or premature form submission
3. **Show the model behind every gate** — registration modal and auth prompts keep the model visible; the user always knows what they are about to get
4. **Wizard steps are resumable** — Save Draft means abandonment is not failure; creators can continue across sessions
5. **Automatic actions after conversion** — after registration, download starts automatically; no "now click download again" friction step

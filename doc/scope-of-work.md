# ScholArk Platform Scope of Work

**Prepared by:** Miroslav Braun
**Project:** ScholArk Educational Gaming Platform
**Document Type:** Scope of Work, Architecture & Delivery Plan
**Status:** Draft
**Date:** August 2026

**Engagement context:** Part-time engagement delivered by Miroslav Braun as the implementation contributor, with an initial expected duration of approximately 2-3 months. Weekly hours may be increased by mutual agreement with the client, subject to availability. The first milestone is this Scope of Work, architecture, and delivery plan.

**Related artifacts:**

- [Target MVP Architecture](architecture.md)
- [Portal and Admin App Interdependencies](admin-app-interdependencies.md)
- [Use Cases and Target MVP Classification](requirements/use-cases.md)
- [Source User Story](requirements/user-story.md)

---

# 1. Executive Summary

ScholArk is a centralized platform for distributing educational computer games to colleges and universities. The planned product includes web-based Student and Instructor portals and a new ScholArk Administration application. The existing Visual Basic application is not a target runtime dependency; selected data may be exported from it for migration, subject to discovery.

The existing Visual Basic administration application and MSSQL database are potential sources of legacy data only; they will not remain the operational administration system. The status and suitability of existing portal and service implementations remain to be assessed. This Scope of Work, architecture, and delivery plan is the first engagement milestone. It defines the proposed product scope, architecture direction, delivery phases, dependencies, and decisions required next. Discovery will identify reusable components, determine what requires refactoring or rebuilding, and establish an evidence-based technical and functional baseline before dependent implementation proceeds.

# 2. Project Objectives

The engagement objectives are to:

- Deliver a new ScholArk Administration application and secure Student and Instructor portal workflows.
- Support game discovery, fresh license acquisition, time-bounded access, launch, resume, progress, grading, and LMS-oriented grade export for the agreed MVP games.
- Establish maintainable boundaries for legacy data, portal-owned data, game integrations, payments, support routing, and LMS exports.
- Validate the architecture through a representative end-to-end game workflow and controlled pilot.
- Leave a documented, testable foundation that can support later portal roles, games, integrations, and production rollout.

# 3. Current State and Assessment

The existing implementation will be assessed across frontend, backend, database/data model, authentication and authorization, roles, academic structure, catalog, game and LMS integrations, configuration, desktop application, infrastructure, tests, documentation, security, and maintainability.

Each major area will receive a recommendation: **reuse**, **refactor**, **partially rebuild**, or **rebuild**. Detailed estimates for existing functionality will follow this assessment.

The initial engagement is expected to establish this architecture baseline and deliver a minimum usable MVP pilot. Development will begin with a functional frontend/backend vertical slice selected during discovery, then expand into the highest-priority Student and Instructor workflows required for the pilot. The exact acceptance baseline will be fixed during Milestone 2 so lower-priority roadmap items can be sequenced into later phases when they do not fit the initial 2-3 month window.

# 4. Scope and Delivery Boundaries

## Target MVP Scope

The planned product includes a new **ScholArk Administration application**, **Student Portal**, and **Instructor Portal**. The new Admin app replaces the legacy Visual Basic application as the operational administration surface. Milestone 2 will baseline the features and delivery sequence for each application; inclusion in this product scope does not imply that every documented use case ships in the initial pilot.

The target MVP includes:

- Student self-registration, login, profile, and preferred language. The new portal is expected to own Student and Instructor authentication and profiles, subject to validation during discovery and linkage to legacy Instructor records. The MVP ships an English UI with internationalization-ready structure; additional translations are future work.
- Invitation-based Instructor onboarding, login, and active User Type switching when applicable.
- Administration workflows for maintaining institutions, academic structures, instructors, games, offers, assignments, acquisition codes, and applicable game configuration. Milestone 2 will baseline detailed Admin workflows, roles, and pilot acceptance criteria.
- A returning Student's licensed-game list, with games under an active license shown first and expired licenses retained in history.
- Two acquisition paths: for-credit acquisition through an institution, course, classroom, and assigned Game Version; and not-for-credit acquisition of a base Game Version through the game catalog without a classroom association.
- Two purchase types within the for-credit path: Student purchase through Stripe, or institution purchase redeemed by acquisition code. Not-for-credit acquisition is always Student-purchased through Stripe.
- Student-paid license acquisition through Stripe, including payment confirmation, license activation, and a fixed access period.
- Institution-paid acquisition-code redemption that activates a fixed-term license. Institution invoicing is outside the MVP; the new ScholArk platform must define code issuance, revocation, audit, and institution-funded license authority.
- Fresh license acquisition after expiry while preserving prior acquisitions, license terms, game-play records, and game-state records. Licenses are not renewed.
- Student submission of unlisted institution, course, game, and general support requests to an existing support channel. Support administration and resolution workflows are excluded.
- Launching licensed **web games** from their stored URLs only while the Student has an active license, using agreed authentication and configuration handoff.
- Student progress, game-state resume behavior, and available grading information for supported Triseum games. Game-state ownership and storage remain blocking discovery decisions.
- Instructor access to assigned classrooms, students who acquired games, student progress, student grades, and game-play grading rules.
- Instructor-initiated, classroom-scoped LMS grade-file export. Discovery will baseline the required target-MVP format list, fields, and mapping between ScholArk classes/students and LMS data; formats added later require explicit scope and forecast revision.
- Import of any legacy administration data selected for migration, with the import scope, mapping, and acceptance criteria determined during discovery.

## Initial Engagement Outcome

The 2-3 month engagement targets a minimum usable MVP pilot rather than automatic completion of every target-MVP use case. Milestone 2 will baseline the pilot acceptance set using business value, architectural risk, dependency readiness, and available capacity. At minimum, the pilot must include:

- A working frontend and backend deployed to an agreed pilot environment.
- Student and Instructor role-based access for the selected pilot workflows.
- A validated new Admin-to-Portal data path and, if required, a tested legacy data export/import path.
- One representative Triseum game integration or an agreed substitute that validates the game data contract.
- Automated coverage of the critical pilot workflows and phase-appropriate deployment, test, support, and handover documentation for controlled pilot operation.

Features not included in the Milestone 2 pilot baseline remain in the target MVP roadmap unless explicitly reclassified as future work.

## Legacy Data Transition

The new ScholArk platform is the planned operational system. The existing Visual Basic application and MSSQL database will not remain authoritative after cutover and are not a runtime integration dependency. The legacy system may provide a one-time export for selected data; whether an export is needed, which records it contains, and how they are mapped remain open.

Milestone 2 will define the new platform's source of truth, persistence architecture, and Admin-to-Portal data boundary. It will also decide whether legacy data should be imported or recreated, identify stable identifiers and historical records that must be preserved, and establish validation, reconciliation, cutover, and rollback criteria. No ongoing synchronization with the legacy application is assumed.

## Out of Scope for MVP

The following are explicitly excluded from the MVP:

- ScholArk Support portal and internal case-management workflows.
- Institution portal and Game Publisher portal functionality.
- Game Publisher administration, catalog management, and publisher-facing progress or metric views.
- A generalized self-service or publisher-facing game-onboarding portal. The mapping of MVP game data to ScholArk's generic record model is included; Milestone 2 will determine whether dedicated onboarding or authoring tools are required to deliver and maintain that mapping.
- Bookstore Management System integration for scholarship/grant funds.
- Native desktop game launching; MVP supports web games only.
- Advanced grading, multiple LMS integrations, custom-content authoring, advanced configuration, and games sold without full ScholArk services.
- Direct LMS synchronization and support for non-Triseum games.

## Future Work

Out-of-scope capabilities may be considered in later phases after the MVP has been validated. Future planning may include dedicated Support, Institution, and Game Publisher portals, additional LMS integrations, BMS integration, advanced grading and configuration, custom-content authoring, publisher-facing metrics, and support for additional game delivery models.

# 5. User Types and Account Rules

Expected User Types are Student / Individual, Instructor, Institutional Administrator, Game Company Support, Game Company Administrator, ScholArk Support, and ScholArk Administrator.

Student and Instructor are the target portal User Types. Authorized ScholArk administration roles are required for the new Admin app; their permission model and pilot roles will be baselined in Milestone 2. Institutional self-service, Game Company, and ScholArk Support portal access remain future work.

- Uninvited registrations create Student accounts.
- Other User Types require authorization, initially through invitation.
- A person may hold more than one User Type but not duplicate accounts for the same User Type.
- Users with multiple User Types need a User Type switching mechanism.
- Preferred language is part of the User Profile.

# 6. Functional Overview

## Student

Students can register, sign in, maintain a profile, select a language, view and acquire publicly catalog-visible base Game Versions or classroom-assigned Game Versions, select institutions/courses/classrooms, purchase games through the ScholArk store, launch and resume games, review progress and grading information, and access support.

## Instructor

Instructors establish accounts by invitation, access assigned classrooms across institutions, view students who acquired assigned games, view progress and grades, and define grading based on a game's available structure.

## ScholArk Administration

The new Admin app will provide the approved workflows for publisher offers, institutions, classrooms, instructors, course data, immutable Game Version assignments, assignment periods, game usage, language, catalog entries, integrations, and configuration. Publishers define standalone and institution-use offers; authorized ScholArk users maintain their records, and institutions select institution-use offers through classroom assignments. Exact workflows, permissions, and pilot sequence will be baselined in Milestone 2. Game Company Support and Administrator portals remain future work.

# 7. Initial Domain Model

The following represents the initial domain model derived from the current requirements. It is intended as an architectural starting point and will be validated against the new platform design, detailed requirements, and any approved legacy migration data during discovery.

Initial domain concepts include User, User Type, User Profile, Institution, Course, Classroom, Instructor, Student, Game, Game Version, PublicGameOffer, InstitutionGameOffer, GameCustomization, Student Game, Game Assignment, Game Acquisition, Game License, Classroom Game Association, Classroom Game Enrollment, Game Configuration, Game-Play Record, Game-State Record, Progress, Grade, Support Request, and LMS Integration. In this initial model, **Student Game** represents a Student's persistent relationship and history for a particular Game, **Classroom Game Enrollment** links a User to an acquired ClassroomGame for classroom progress and grading, and **Game License** represents a time-bounded right to access one exact Game Version with an optional published GameCustomization. Pricing, SKUs, and purchase-product modeling are outside this domain-model decision.

```text
Publisher -> InstitutionGameOffer -> ClassroomGame assignment
Institution -> Course -> Classroom (section) -> Instructor, Student, Game Version Assignment
Game -> one or more publisher-owned immutable Game Versions
Game Version -> GameCustomization, Configuration, Record Structure
GameCustomization -> one Game Version
Student -> Game Acquisition
Game Acquisition -> Game License
Student -> Student Game -> Game
Student Game -> one or more Game Licenses
Student Game -> Game-Play Records, Game-State Records -> source Game Version
Student Game -> optional Classroom Game Association
Classroom Game Enrollment -> Classroom Game, Game License -> User
InstitutionGameOffer -> publisher-defined classroom-use offer, designated payor, price, license duration
Game Version Assignment -> selected InstitutionGameOffer, optional GameCustomization, active period
```

The proposed minimal fields are:

```text
GameVersion
  gameId
  publisherVersion       // publisher-defined label; no versioning format imposed by ScholArk
  publishedAt

GameCustomization
  gameVersionId
  content
  publishedAt            // null means draft; non-null means immutable

InstitutionGameOffer
  gameVariantId
  designatedPayor        // student or institution
  price
  licenseDurationDays

ClassroomGame
  classroomId
  institutionGameOfferId // selected publisher offer; not institution-owned
  customizationId       // optional; must reference the same GameVersion
  startAt
  endAt
  licenseDuration

License
  userId
  gameVersionId
  customizationId       // optional; must reference the same GameVersion
  startAt
  endAt

ClassroomGameEnrollment
  classroomGameId
  gameLicenseId
  createdAt
```

`publisherVersion` is an opaque publisher-provided label. It may be `1.4.1`, `v1.4.1-demo`, `2026.09`, or another format. `GameCustomization` is data-driven only; it does not contain a separate executable. A customization is a draft while `publishedAt` is null and becomes immutable when published. `startAt` and `endAt` belong to `ClassroomGame` and `License`, not to `GameCustomization`. `ClassroomGameEnrollment` is the classroom-specific link between an assignment and the acquired license; the user is derived through `GameLicense.user`. Multiple enrollment rows may reference different license terms for the same user and assignment. Capability and integration metadata remain open and are not required in this initial model.

Game-play and game-state records are therefore related to the Student's Game rather than only to the catalog Game or classroom. A classroom association supplies an educational context for that Student Game but may be created after personal game activity has already been recorded.

An expired license prevents further game access but does not delete acquisition history, prior license terms, game-play records, or game-state records. Licenses are not renewed; a later purchase or valid institution code creates a separate license through the ordinary acquisition path. The Student Game and classroom-association concepts are discovery hypotheses, not a prescribed schema. Milestone 2 will produce the concrete domain model after validating these concepts and relationships against the existing MSSQL schema, workflows, integrations, terminology, data ownership, and selected persistence architecture. The concrete model will define approved entities, relationships, identifiers, invariants, lifecycle rules, ownership boundaries, and persistence mappings.

# 8. Student Game Acquisition

Game acquisition has two independent dimensions: **acquisition path** and **purchase type**. Publishers define standalone `PublicGameOffer` records and institution-use `InstitutionGameOffer` records. An institution selects an offer by assigning it to a `ClassroomGame`; the offer is not owned by an institution. The selected offer determines the designated payor, price, and license duration, while the classroom assignment determines the exact immutable Game Version and optional published GameCustomization.

In the **for-credit acquisition path**, a Student selects an institution, optionally defaulting to the last active institution, then selects a course, classroom, and assigned Game Version not yet associated with that Student in the classroom. Unlisted institutions, courses, or games generate support requests. The classroom assignment's selected offer determines the purchase type and license duration:

- **Institution-purchased:** The Student enters an acquisition code to activate a fixed-term license.
- **Student-purchased:** The Student purchases a fixed-term license through Stripe.

In the **not-for-credit acquisition path**, a Student browses the ScholArk game catalog and purchases a fixed-term license for a publicly available base Game Version through Stripe without an institution, course, or classroom association. Classroom-associated Game Versions, including customized versions, are shown only through the relevant ClassroomGame assignment. This path is always Student-purchased.

Access is permitted only during an active license term and to the exact Game Version referenced by the license. When a license expires, launch and resume access are disabled, while acquisition, license, game-play, and game-state history remains available according to the approved visibility rules. A later acquisition creates a new license and does not extend or renew the expired term. A license is generalized and is not required to reference a classroom; classroom context is recorded separately where educational reporting requires it.

Institution billing and invoicing are outside the MVP. Acquisition codes remain the institution-funded access mechanism; discovery must determine code generation and ownership, license start-date rules, and the exact catalog/discovery experience. Licenses are not renewed and no grace-period flow is planned. Discovery must also determine what happens when a Student with a not-for-credit Student Game later needs the same game for credit in a classroom, including whether ScholArk associates the existing Student Game with the classroom context or requires a separate license for the assigned Game Version. If the Student Game already has game-play or game-state history, discovery must determine whether those earlier records are visible in the classroom and eligible for progress or grading. Bookstore Management System support for scholarship/grant funds is a future requirement.

# 9. Classroom and Game Catalog

A classroom is a specific course section and can hold institution, course number/name, instructor, Game Version assignments, optional published customizations, language, usage mode, assignment periods, license duration, and future custom content. Students can acquire an assigned Game Version and optional customization under the publisher offer selected for that classroom assignment. A published assignment cannot be changed; a replacement assignment is required.

Catalog onboarding may require game metadata, website, configuration, and game-play/game-state mapping. Mapping the MVP game data to ScholArk's generic record structure is required. Milestone 2 will determine whether this is implemented through configuration, scripts, administrative tooling, or another maintainable mechanism. ScholArk may eventually sell games without providing all other platform services.

# 10. Game Launch, Records, and Integration

Licensed web games launch from their stored website only while the Student has an active license. The game authentication, license validation, and credential-handoff mechanism is TBD.

Games create game-play records for milestones such as levels and sub-levels, supporting progress, learning objectives, metrics, and grading. Game-state records let a player resume after exiting. Both record types belong to the relevant Student Game and persist independently of whether it currently has a classroom association. The architecture must decide whether state is normalized, opaque, API/SDK-managed, or handled by another mechanism.

Game Version licensing is version-specific: a license references one exact immutable Game Version and may reference one published GameCustomization for that version. A GameVersion stores the publisher-defined version label in `publisherVersion`; ScholArk does not require a versioning scheme. A new publisher Game Version may change game-state compatibility, game-play events, hierarchy, milestones, learning objectives, generic-record mappings, and the structure used for grading. Discovery must define replacement behavior and whether existing state can be migrated, remains available only in its original version, or must be reset with explicit approval. Game-play and game-state records must retain their source Game Version so historical progress and grades remain explainable. Future Game Forge customization is data-only: a GameCustomization references its GameVersion and stores `content`. A customization is a draft while `publishedAt` is null and is immutable after publication; changes require a new customization. It has no `startAt`, `endAt`, status, locale list, or classroom ownership.

The MVP requires a generic ScholArk record model and an implemented mapping path from MVP game data into that model so game-specific terminology, hierarchy, events, and learning objectives can support progress, metrics, and grading. Milestone 2 must determine whether an existing model can be reused or a new model must be designed; select a maintainable mapping mechanism; and define game authentication, identifiers, event submission, state handling, record mapping, progress calculation, retry behavior, and integration versioning. It will also document versioned JSON schemas and validation/error-handling contracts for game-play and game-state data. Reusable self-service onboarding and authoring tools remain subject to discovery rather than being presumed excluded or required.

A representative Triseum-produced game will be used to implement and validate the integration and record-mapping model. Discovery must determine ownership of any required game-side changes and whether the MVP mapping mechanism must support additional Triseum games. Support for other publishers remains future work.

# 11. Configuration, Grading, and LMS

Game configuration can contain language, game type, GBC versus game-only mode, and future custom content. Games must be able to identify and use the current classroom/game-version configuration; configuration distribution and versioning are TBD.

Game events flow through version-aware generic records into progress/metrics and grading. Instructors define grading rules; the grading model, storage, calculation, and adjustment rules are TBD. Discovery must define whether grading rules are bound to a Game Version or compatible record-model version, how rules are reviewed or migrated when game structure changes, and how mixed-version classroom history is calculated and presented. Discovery must also define the grading-history policy when a Student Game is associated with a classroom after play has begun, including whether grading uses all prior records, only records created after association, a selected attempt or date range, or another approved rule.

ScholArk should eventually support Canvas, Blackboard, and Moodle. The MVP will allow an authorized Instructor to initiate and download an LMS-oriented grade file for a selected classroom. Discovery must determine the number and type of export formats and define how ScholArk classrooms and students map to the selected LMS data model. Direct LMS synchronization is future work.

# 12. New Administration Application and Architecture Principles

The new ScholArk Administration application will provide the operational administration workflows required by the product. The legacy Visual Basic application will not remain in operation as the source of truth. Discovery will define the new Admin app's feature boundary, data ownership, integration with the portals, and whether selected legacy records should be exported and imported.

Architecture should prioritize scalability, separation of concerns, extensibility, maintainability, and role-based security.

Milestone 2 will gather expected user, institution, game, event-volume, retention, and concurrency assumptions and use them to define measurable API, database, and performance targets. This initial plan may identify a preferred technology direction, but formal adoption and storage decisions follow new-platform requirements and infrastructure assessment.

## Proposed Technology Direction

The proposed implementation direction is:

- **Frontend:** Next.js and React with shared TypeScript UI packages.
- **Backend:** NestJS on Node.js with a documented API boundary between the Admin app, portals, games, and external services.
- **Platform data:** Stored in the new platform's selected data store. Admin and Portal domains have explicit ownership and write boundaries; legacy MSSQL is only a possible one-time export source.
- **Code organization:** A Turborepo monorepo managed with pnpm is the suggested option for organizing portal applications, backend services, and reusable packages by responsibility. Milestone 2 will validate this option against the implementation and deployment needs.
- **Version control:** Git, using the client's agreed repository hosting, branching, review, and release conventions.

These are recommended implementation choices, not immutable constraints. Milestone 2 will validate them against the new product requirements, hosting environment, ongoing maintenance and support model, security requirements, deployment constraints, and persistence decision. It will also select supporting technologies such as database access, schema migration, authentication, API documentation, testing, observability, and deployment tooling.

```text
New ScholArk Administration App
          |
      ScholArk Platform API
          |
  +-------+-------------------+
  |                           |
Student Portal         Instructor Portal
          |
  Game Integrations | Selected LMS / Grade Export
```

# 13. MVP Delivery Model

The **target MVP** is the new Admin app and complete Student and Instructor portal scope defined in Section 4 and classified in the related use-case document. The **initial pilot** is the minimum usable subset baselined during Milestone 2 for delivery within the initial engagement window. Deferring a target-MVP use case from the pilot changes its sequence, not its target-MVP classification.

The implementation must establish this end-to-end product path:

```text
New Admin app configures institution/classroom and publishes an assignment
  -> Student registers and acquires game
  -> Student launches game
  -> Game reports progress
  -> Instructor views progress
```

The pilot may validate this path with selected users, one representative Triseum game, and the acquisition and grading behavior agreed during discovery. The target MVP extends the validated path to all retained target-MVP requirements, including the new Admin workflows and required LMS grade-export formats. Future phases include Support, Institution, and Game Publisher portals; additional User Types; advanced grading; direct LMS synchronization, BMS integration, advanced configuration, custom content, and non-Triseum games.

# 14. MVP Implementation Plan and Milestones

The implementation milestones below are a suggested starting plan based on the current requirements and assumptions. Their ordering, grouping, scope, estimates, and acceptance gates may be revised based on discovery findings, business priorities, dependency readiness, implementation evidence, and discussion and mutual agreement with the client. Approved revisions will be recorded in the delivery plan and decision log.

The current sequence is ordered by known dependencies. Each milestone includes implementation, tests, documentation, and review for its own scope; quality is not deferred entirely to the final hardening milestone. Estimates and the exact pilot cut line will be baselined after Milestone 2.

## Milestone 1 - Scope, Architecture & Delivery Plan (Current)

**Implementation steps**

1. Consolidate the source story into delivery boundaries and structured use cases.
2. Document the proposed architecture, technology direction, dependencies, risks, and open decisions.
3. Define the discovery and implementation sequence.

**Acceptance gate:** Stakeholders confirm this document set as the baseline for system discovery.

## Milestone 2 - Existing-System Discovery, Assessment & Architecture Baseline (Duration TBD)

**Implementation steps**

1. Assess existing portal/service code and the legacy Admin data available for export; inventory the new Admin app's requirements, architecture, authentication, integrations, tests, and operational processes.
2. Baseline the initial pilot use cases, acceptance scenarios, target browsers, representative users/data, non-functional targets, and target-MVP continuation scope.
3. Define the new platform's persistence architecture and Admin-to-Portal API/data boundary; determine whether a one-time legacy export/import is required, and validate the selected path with representative data and migration evidence.
4. Confirm identity ownership, Instructor linkage, authorization boundaries, audit requirements, and multi-User-Type behavior.
5. Define catalog ownership, both acquisition paths, both for-credit purchase types, license terms and fresh-acquisition-after-expiry behavior, game-version licensing and upgrade rights, Stripe lifecycle, acquisition-code behavior, support routing, treatment of prior not-for-credit Student Games and licenses, and eligibility of their existing game records for classroom progress and grading.
6. Validate game launch, version selection, authentication, configuration, game-state ownership and compatibility, versioned JSON contracts, generic record mapping, and responsibility for game-side changes using representative Triseum data.
7. Baseline version-aware progress and grading, grading-rule migration, LMS export formats/mapping, deployment environments, observability, security, and performance expectations.
8. Produce the concrete domain model from the validated schema, workflows, integration boundaries, and business rules.
9. Validate the proposed technology direction and produce revised estimates, dependencies, risks, and milestone sequencing.

**Outputs:** New Admin requirements and architecture assessment, approved pilot baseline, platform persistence and API/data-boundary decisions, concrete domain model, source-of-truth matrix, optional legacy migration assessment, integration and game-data contracts, decision log, acceptance scenarios, and revised delivery forecast.

**Acceptance gate:** The pilot acceptance set and concrete domain model are approved. Each decision required by a later milestone is either approved before that milestone starts or explicitly deferred with a documented assumption, owner, resolution date, affected acceptance scenarios, and contingency. At minimum, Milestone 3 requires approved data-architecture, identity, environment, and integration-boundary decisions; Milestone 5 requires approved payment, acquisition-code, license-authority, fresh-acquisition-after-expiry, catalog, and support-routing decisions; Milestones 6 and 7 require approved representative-game, Game Version, state-compatibility, mapping, and grading policies; and Milestone 8 requires an approved finite list of export formats and mappings.

## Milestone 3 - Platform Foundation and Walking Skeleton

**Dependencies:** Milestone 2 architecture, environment, identity, and data-integration decisions.

**Implementation steps**

1. Establish the agreed Next.js and NestJS application structure, code-organization model, shared packages where applicable, environment configuration, CI checks, and deployment pipeline. If selected during Milestone 2, implement this as a Turborepo monorepo managed with pnpm.
2. Implement the selected database and Admin-to-Portal foundations, schema management where applicable, health checks, structured logging, error handling, and secrets/configuration handling.
3. Create Student and Instructor portal shells and one thin end-to-end request path through the API to approved data.
4. Add baseline automated tests and deploy the walking skeleton to a non-production environment.

**Acceptance gate:** A deployed Student/Instructor shell can authenticate or use the approved temporary identity mechanism, call the Portal API, retrieve approved test data through the selected integration path, and expose actionable diagnostics on failure.

## Milestone 4 - Identity, Roles, and Academic Context

**Dependencies:** Milestone 3 foundation and the approved legacy export/import dataset, if migration is required.

**Implementation steps**

1. Implement Student self-registration and invitation-based Instructor onboarding.
2. Implement login, profile, preferred language storage, role authorization, and User Type switching where applicable.
3. Link Instructor identities to imported or newly created Admin records and expose authorized institutions, courses, classrooms, students, game listings, and assignments.
4. Verify role and data isolation with automated authorization tests.

**Acceptance gate:** Representative Students and Instructors can access only their permitted profiles and academic context, including an Instructor assigned across more than one institution where the supplied data supports it. A person with both Student and Instructor User Types can switch active context without gaining access to data unauthorized for that context.

## Milestone 5 - Catalog, Acquisition, and Licensing

**Dependencies:** Identity and academic context; approved Stripe, acquisition-code, license-authority, license-term, Game Version entitlement, fresh-acquisition-after-expiry, catalog, and support-routing decisions.

**Implementation steps**

1. Deliver the licensed-game library, active-license ordering, license status, expiration information, and retained expired-license history.
2. Implement the for-credit institution, course, classroom, and assigned-game path with unlisted-item support routing.
3. Implement Student-funded Stripe checkout, webhook verification, idempotent fixed-term license activation, and defined failure handling for both acquisition paths.
4. Implement institution-funded acquisition-code validation and fixed-term license activation for the for-credit path.
5. Enforce license expiry and retain history. A later purchase or valid institution code creates a separate license through the ordinary acquisition flow; no renewal or extension is permitted.
6. Implement not-for-credit catalog browsing and license purchase, plus the approved rule for associating a prior personal Student Game and license with a classroom.

**Acceptance gate:** In the agreed test environment, a Student can complete both acquisition paths and both for-credit purchase types and receives the correct fixed-term license and Game Version entitlement exactly once per completed acquisition. Access is allowed before and denied at or after the approved expiry instant; acquiring after expiry creates a separate license while preserving the prior record. Repeated or invalid payment events and acquisition codes cannot activate duplicate or unauthorized access. Unlisted-item and general support submissions reach the approved support destination with the required context. Institution invoicing, refunds, tax, disputes, and full reconciliation operations remain excluded unless added to the pilot baseline.

## Milestone 6 - Game Launch, State, and Data Mapping

**Dependencies:** Active Game License, representative game access, approved game contract, and assigned ownership of game-side changes.

**Implementation steps**

1. Implement secure launch context and active-license validation for the representative Triseum web game.
2. Resolve the permitted Game Version for the license and classroom, and deliver the corresponding configuration through the approved contract.
3. Ingest game-play and game-state records, associate each record with the correct Student Game and source Game Version, and apply validation, idempotency, retry behavior, and actionable error handling.
4. Implement the selected version-aware mapping mechanism from game-specific JSON records to ScholArk's generic record model.
5. Implement and test the approved version-compatible resume, migration, fallback, or reset behavior.

**Acceptance gate:** A Student with an active license can launch the permitted Game Version and use the approved resume, migration, fallback, or reset behavior, while a Student with an expired or version-incompatible license cannot. Repeating the same event or state submission does not create a duplicate logical record. Invalid payloads are rejected safely; prior-version state is handled according to the approved compatibility policy; and historical records remain queryable and traceable from the source game event, schema, and Game Version through the Student Game to the ScholArk representation.

## Milestone 7 - Progress, Instructor Workflows, and Grading

**Dependencies:** Mapped, version-attributed Student Game records and the grading-history, Game Version, and grading-rule compatibility behavior baselined during Milestone 2.

**Implementation steps**

1. Present Student progress, metrics, and available grading information.
2. Deliver Instructor institution/classroom navigation and authorized student views.
3. Present per-student progress and grades derived from mapped Student Game records, applying the approved classroom-association, historical-record, Game Version, and mapping-version policies.
4. Implement the agreed grading configuration, calculation, persistence, and adjustment behavior.

**Acceptance gate:** Representative current-version and, where applicable, prior-version game records produce traceable progress and grade results visible to the correct Student and Instructor. The approved grading-history and mixed-version policies are applied, and agreed grading-rule changes produce the expected recalculation without changing preserved source records or exposing data across classroom boundaries.

## Milestone 8 - LMS-Oriented Grade Export

**Dependencies:** Stable classroom/student identifiers, grading output, and approved export specifications.

**Implementation steps**

1. Implement each grade-export format in the finite target-MVP list approved during discovery.
2. Allow an authorized Instructor to initiate an export from a selected classroom and download the generated file.
3. Enforce classroom authorization and include only applicable students and grades from the selected classroom.
4. Validate required fields, identifiers, classroom/student mapping, encoding, and error reporting against supplied LMS examples or import tooling.
5. Document export generation, validation, and known LMS-specific constraints.

**Acceptance gate:** An authorized Instructor can initiate and download an export for a selected classroom; the file contains only the applicable students and grades from that classroom and does not expose another classroom's data. Every format in the discovery-approved target-MVP list passes the agreed structural validation and imports successfully into the available test workflow or, when no sandbox exists, matches the client-approved reference file. Formats added after that baseline require explicit scope and forecast revision. Direct LMS synchronization remains future work.

## Milestone 9 - Pilot Validation, Hardening, and Handover

**Dependencies:** Completion of every milestone included in the Milestone 2 pilot baseline.

**Implementation steps**

1. Execute end-to-end regression, authorization, security, performance, browser, failure-recovery, and reconciliation checks against the pilot scope.
2. Resolve acceptance-blocking defects and document accepted limitations and deferred target-MVP work.
3. Complete deployment, rollback, monitoring, support, test, and operational handover materials appropriate to the pilot.
4. Support client-led UAT and deploy the accepted build to the agreed pilot environment.

**Acceptance gate:** The client accepts the baselined workflows in UAT, no unresolved release-blocking defect remains, operational owners can deploy and observe the pilot, and the remaining target-MVP roadmap is reprioritized using pilot evidence.

## Target MVP Use-Case Coverage

This map identifies the primary implementation milestone for traceability. A use case may depend on foundations or supporting behavior delivered in an earlier milestone.

| Milestone | Primary Use Cases |
| --- | --- |
| Milestone 4 - Identity, Roles, and Academic Context | UC-01 through UC-04 and UC-18 through UC-20 |
| Milestone 5 - Catalog, Acquisition, and Licensing | UC-05 through UC-12, UC-17, UC-39, and UC-40 |
| Milestone 6 - Game Launch, State, and Data Mapping | UC-13, UC-14, the MVP portion of UC-28, UC-29, UC-31 through UC-33, and UC-35 through UC-36 |
| Milestone 7 - Progress, Instructor Workflows, and Grading | UC-15, UC-16, UC-21 through UC-23, and the Student/Instructor portion of UC-34 |
| Milestone 8 - LMS-Oriented Grade Export | UC-38 |

UC-24 through UC-27, UC-30, UC-37, and the future portions of Mixed use cases remain outside the target MVP. Milestone 2 will identify which target-MVP use cases enter the initial pilot baseline.

# 15. Initial Engagement Window and Forecasting

The engagement is initially expected to run approximately **2-3 months on a part-time basis**, with Miroslav Braun as the implementation contributor at a baseline of approximately **20 hours per week**. This represents approximately **160-240 baseline hours** before availability, holidays, or client dependency delays are considered.

Weekly hours may be increased temporarily or for the remainder of the engagement by mutual agreement with the client, subject to Miroslav Braun's availability. Any increase will be documented together with its effective period and reflected in the delivery forecast, milestone capacity, and pilot scope; it does not by itself change the agreed requirements or acceptance criteria.

Within that initial engagement window, priority should be given to:

1. Confirming scope and architecture through this document set.
2. Assessing the existing implementation and producing evidence-based reuse/refactor/rebuild recommendations.
3. Establishing the integration and data-ownership boundaries.
4. Delivering the walking skeleton and the implementation milestones selected for the minimum usable pilot.
5. Running pilot validation and recording the remaining target-MVP roadmap.

The milestone sequence in Section 14 is a suggested target-MVP implementation roadmap, not a commitment that all nine milestones fit within the initial window or must retain their initial structure. Milestone 2 will establish the pilot cut line and forecast each remaining milestone after inspecting the existing system and validating external dependencies. Subsequent changes based on discovery, priority, implementation evidence, or dependency readiness require discussion and mutual agreement with the client. If client decisions, credentials, representative data, or game-side changes delay a blocking gate, the forecast and pilot content must be revised explicitly rather than compressing testing or silently expanding the schedule.

Progress will be reported against completed acceptance gates, forecast effort, dependency status, and remaining pilot scope. Any material scope change will record its effect on sequence, forecast, and acceptance criteria.

# 16. Dependencies and Risks

The delivery forecast depends on timely access to the new Admin app and platform environments, representative data, stakeholder decisions, third-party credentials, and participation from the Admin and representative-game owners.

| Risk | Potential Effect | Planned Control |
| --- | --- | --- |
| Existing code, schema, or infrastructure differs materially from current assumptions | Rework or delayed implementation | Complete Milestone 2 assessment before dependent implementation and revise the forecast from evidence. |
| Physical storage or logical ownership is unclear, or a legacy import is poorly bounded | Conflicting data, migration loss, or tightly coupled services | Select the new platform's persistence architecture, approve the source-of-truth matrix, and require validation/cutover controls for any one-time legacy import. |
| Representative game access, versions, payloads, or game-side changes are delayed | Game launch, resume, mapping, progress, and grading are blocked | Validate the game and version contracts early, assign owners and dates, and use an agreed simulator only when it preserves the same contracts. |
| A new Game Version changes state or play structure without compatibility rules | Students may lose resume access or grades may become inconsistent | Version licenses, configuration, state, play records, mappings, and grading rules; approve migration, fallback, or reset behavior before rollout. |
| Stripe, acquisition-code, or license-term rules remain unresolved | Incorrect access duration, duplicate charges, or unauthorized access | Baseline term calculation, expiry, idempotency, validation, and failure scenarios before acquisition implementation. |
| Grading rules or LMS formats expand after implementation begins | Rework and schedule extension | Approve representative grading examples and export specifications before their milestones; reforecast additions explicitly. |
| Support routing or external service access is unavailable | Incomplete pilot workflows | Confirm destinations and credentials during discovery and use contract-compatible test adapters where appropriate. |
| Security, privacy, or role-isolation defects are found late | Pilot delay or inappropriate data exposure | Define authorization and audit rules early and test them within each implementation milestone. |
| Part-time single-developer capacity is interrupted or dependencies wait on client action | Reduced pilot scope within the initial window | Track decisions and blockers, protect milestone gates, and adjust the pilot cut line rather than reducing validation quality. |

# 17. Delivery Inputs and Responsibilities

The client is expected to provide the following in time to support discovery and implementation:

- Access to new Admin app requirements and environments, plus an approved legacy data export if migration is required.
- A representative game, its available integration documentation, and sample game-play and game-state records.
- Representative institutions, classrooms, instructors, students, assignments, and other test data.
- Access to existing hosting and infrastructure information, accounts, domains, certificates, and deployment processes.
- LMS documentation, sample import files, test course data, and any sandbox access needed to validate the selected grade-export format(s).
- A designated product decision maker who can clarify requirements, prioritize unresolved items, and coordinate acceptance.

Timely availability of these inputs is a dependency for the associated milestone schedule.

Miroslav Braun, as the implementation contributor, is responsible for assessing the supplied systems, documenting recommended architecture and integration boundaries, implementing the agreed MVP, maintaining automated coverage of critical workflows, supporting UAT, and preparing deployment and handover materials.

# 18. Delivery Artifacts

Artifacts will be produced when their corresponding phase is reached. Milestone 1 provides the initial architecture and classified requirements. Milestone 2 refines the architecture and adds evidence-based assessment and integration artifacts. Prototype, pilot, and release artifacts will be produced at an appropriate level for the delivered implementation.

The phased artifact set includes:

- An architecture document covering components, boundaries, data flows, and material design decisions.
- A Portal/Admin interdependency companion covering shared ownership, interfaces, sequencing, repository coordination, and joint acceptance.
- A requirements traceability and pilot-baseline record mapping accepted workflows to implementation milestones and acceptance scenarios.
- An integration contract covering identifiers, data mappings, interfaces, synchronization, ownership, validation, and error handling.
- A persistence and Admin-to-Portal boundary decision record, including data ownership, rejected alternatives, operational consequences, and any legacy export/import and cutover plan.
- A source-of-truth matrix for users, institutions, courses, classrooms, games, assignments, acquisitions, licenses, configurations, progress, and grades.
- Versioned API and game-data contracts, including representative payloads and validation/error behavior.
- A test and UAT report recording agreed scenarios, executed results, known limitations, and unresolved defects.
- A deployment runbook covering environment configuration, release steps, rollback, and recovery.
- Operational handover documentation covering monitoring, support responsibilities, routine maintenance, and relevant training.

# 19. Quality, Validation, and Governance

The MVP quality baseline includes:

- Role and data isolation so users can access only authorized institutions, classrooms, students, and records.
- Privacy controls and auditability for student, grade, account, and other sensitive operations.
- Browser support for the agreed target browsers and environments, to be defined during discovery.
- Automated tests for critical authentication, authorization, acquisition, game-access, progress, and grading workflows.
- Client-led UAT using agreed scenarios and representative data.
- Measurable performance and load expectations to be defined during discovery after the existing infrastructure and expected usage are understood.

Project governance is expected to include a regular status review covering completed work, planned work, decisions, dependencies, and risks. Its frequency and format will be agreed during Milestone 2. The milestone acceptance process, review period, approving stakeholder, and treatment of acceptance-blocking defects will also be defined and documented during Milestone 2.

# 20. Transition and Release Approach

The intended release sequence begins with a controlled pilot. Broader production rollout follows when the validated MVP scope and operational readiness support it:

1. Select representative institutions, classrooms, instructors, students, and games for the pilot.
2. Validate portal access, acquisition, launch, progress, grading, and existing-system reconciliation.
3. Record and resolve acceptance-blocking pilot findings.
4. Complete client-led UAT and the agreed acceptance process.
5. Decide whether to proceed directly to broader production rollout or continue target-MVP implementation and hardening.

Milestone 2 will validate the new platform's persistence, security, performance, availability, deployment, and operational needs, and define the Admin-to-Portal boundary. If legacy data is needed, the transition plan will define export, mapping, import, validation, cutover, and rollback; no ongoing legacy synchronization is assumed. Milestone 2 will also recommend who provisions and operates development, test, staging, and production environments.

# 21. Open Questions

Discovery must resolve:

- Existing system technologies, production readiness, documentation, tests, infrastructure, and integrations.
- Expected Year-1 users, institutions, games, event volumes, retention, and concurrency needed to define scalability and performance targets.
- The new platform's source of truth and data ownership across the Admin app and portals, including the persistence technology and API/data boundary.
- Whether any legacy data should be exported and imported, which records and historical relationships are required, and how import validation, cutover, and rollback will work. Ongoing synchronization with the legacy app is not assumed.
- User Type permissions, invitation workflow, and multi-User-Type switching.
- Institution/course/classroom ownership and multi-institution enrollment rules.
- Whether an Instructor can browse the game catalog, and which games, metadata, pricing, availability, and filters are visible in that context.
- Whether an Instructor can submit a request to assign a catalog game to one of their classrooms; if so, define the request data, eligibility rules, approval and notification workflow, support or administration owner, and system that records the approved assignment.
- Game API/SDK approach, authentication, identifiers, event/state processing, canonical records, mapping ownership, and grading data.
- Game Version identity and release lifecycle; classroom Game Version selection; replacement rights and fresh-acquisition rules; state compatibility and migration; record provenance; and the effect of changed play structure on progress and grading rules. The target requirement is that licenses reference exact immutable Game Versions.
- Versioned JSON schemas, transport, validation, retry, and error-handling contracts for game data pipelines.
- Configuration authoring, versioning, classroom applicability, and distribution.
- Grading models, calculation, storage, and manual adjustment.
- Grade-export format count, required fields, classroom/student mapping, and Instructor initiation/download behavior for the selected LMS workflow.
- Stripe payment details, Store catalog/discovery boundaries, license activation, and payment reconciliation.
- License duration, activation date, expiration calculation, status visibility, and behavior for in-progress game sessions when a license expires. Licenses are not renewed; later access requires a separate acquisition.
- Acquisition-code generation and ownership, plus the authoritative source for institution-funded licenses.
- Treatment of a not-for-credit Student Game and license when the Student later needs the same game for credit in a classroom, including whether the existing version-specific license can be associated with the classroom context or a new license for the assigned Game Version is required, and whether game-play and game-state records created before classroom association are visible to the Instructor or eligible for classroom progress and grading.
- Support ticketing, assignment, notifications, desktop application ownership, and localization requirements.

# 22. Proposed Next Steps

1. Confirm requirements and access for the new Admin app and platform environments, representative game/LMS integrations, and an approved legacy export if migration is required.
2. Confirm the product decision maker, technical contacts, representative pilot users/data, and owners of external dependencies.
3. Execute Milestone 2, prioritizing Admin workflow scope, the pilot baseline, platform data architecture, identity ownership, acquisition rules, and representative-game contract because they gate implementation.
4. Review and approve the Milestone 2 outputs, acceptance scenarios, revised estimates, pilot cut line, and dependency owners.
5. Begin Milestone 3 only after its acceptance-gate dependencies are satisfied or explicitly deferred with documented assumptions.

# 23. Definition of Success

The engagement is successful when decisions and delivery status are evidenced by the milestone acceptance gates rather than by feature completion claims alone.

The **initial minimum usable MVP pilot** succeeds when the baselined Admin, Student, and Instructor workflows pass the agreed acceptance scenarios and client-led UAT, use the new platform data correctly, complete any approved legacy import, satisfy the agreed security and operational baseline, and can be deployed, observed, supported, and recovered in the pilot environment using the delivered documentation.

The **complete target MVP** succeeds when all retained target-MVP use cases, including every required grade-export format, meet their acceptance criteria and are ready for the agreed broader deployment and operational handover. Completion of the target MVP may extend beyond the initial 2-3 month engagement.
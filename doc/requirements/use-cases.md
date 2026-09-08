# ScholArk — Use Cases

## Target MVP Classification Appendix

This matrix classifies the documented use cases against the target MVP roadmap. It does not guarantee that every target-MVP use case will fit into the initial 2-3 month pilot. Milestone 2 will baseline that minimum usable pilot set using business value, architectural risk, dependency readiness, and available capacity.

**MVP** means included in the target Student or Instructor portal delivery. **Future** means excluded from the target MVP. **Mixed** means only the stated portal-facing portion is included. **TBD** means discovery must select one of the documented alternatives.

| Use Case | Classification | MVP Boundary or Rationale |
| --- | --- | --- |
| UC-01 | MVP | Student self-registration. |
| UC-02 | MVP | Invitation-based Instructor onboarding; other invited User Types are future work. |
| UC-03 | MVP | User Type switching when a portal user has both Student and Instructor access. |
| UC-04 | MVP | Preferred language storage and internationalization-ready behavior; MVP UI ships in English. |
| UC-05 | MVP | Student licensed-game list with active licenses first and expired licenses retained in history. |
| UC-06 | MVP | For-credit path through institution, course, classroom, and assigned Game Version selection. |
| UC-07 | MVP | Last active institution defaulting. |
| UC-08 | Mixed | Student submission and routing are MVP; Milestone 2 selects the routing mechanism, while ScholArk Support resolution UI/workflow is future work. |
| UC-09 | Mixed | Student submission and routing are MVP; Milestone 2 selects the routing mechanism, while ScholArk Support resolution UI/workflow is future work. |
| UC-10 | Mixed | Student submission and routing are MVP; Milestone 2 selects the routing mechanism, while ScholArk Support resolution UI/workflow is future work. |
| UC-11 | MVP | Not-for-credit catalog acquisition of a fixed-term license for a publicly available base Game Version through Stripe checkout and webhook confirmation, without a classroom association; classroom-associated versions are excluded from catalog discovery. |
| UC-12 | MVP | For-credit acquisition of a fixed-term license for the immutable Game Version selected by the classroom assignment, with either Student-purchased or institution-purchased purchase type; institution invoicing is excluded. |
| UC-13 | MVP | Launch of the exact permitted web-game version while the license is active; native desktop launching is excluded. |
| UC-14 | MVP | Resume behavior for the representative MVP game under the approved cross-version state policy. |
| UC-15 | MVP | Student progress presentation using the mapping applicable to each source Game Version. |
| UC-16 | MVP | Available student grading information under the approved historical-record and Game Version policies. |
| UC-17 | Mixed | Student support entry and request routing are MVP; Milestone 2 selects the routing mechanism, while support administration is future work. |
| UC-18 | MVP | Invitation-based Instructor onboarding. |
| UC-19 | MVP | Assigned classroom view. |
| UC-20 | MVP | Classroom student view. |
| UC-21 | MVP | Student progress view. |
| UC-22 | MVP | Student grade view. |
| UC-23 | MVP | Target-MVP grading rules are retained; Milestone 2 determines the minimum grading behavior required in the initial pilot. |
| UC-24 | Future | Existing ScholArk Administration responsibility. |
| UC-25 | Future | Existing ScholArk Administration responsibility. |
| UC-26 | Mixed | Existing Administration may maintain assignments, while the target Instructor workflow can select from eligible contracted games and publish the approved Game Version assignment. |
| UC-27 | Future | Existing ScholArk Administration responsibility. |
| UC-28 | Mixed | Game catalog administration is an existing-system responsibility; mapping MVP game records to ScholArk's generic structure is included, with the supporting mechanism selected in Milestone 2. |
| UC-29 | MVP | Mapping MVP game-play and game-state records to ScholArk's generic structure is required; Milestone 2 determines whether configuration, scripts, or authoring tools support it. |
| UC-30 | Future | Selling games without full ScholArk services is excluded from MVP. |
| UC-31 | MVP | Event ingestion for the representative Triseum game, with each game-play record associated with the relevant Student Game and source Game Version. |
| UC-32 | MVP | State ingestion/resume support for the representative Triseum game, with each game-state record associated with the relevant Student Game and source Game Version; storage and cross-version compatibility remain discovery decisions. |
| UC-33 | MVP | Mapping MVP game data to ScholArk's generic structure is required for progress, metrics, and grading; Milestone 2 selects the maintainable mapping and authoring mechanism. |
| UC-34 | Mixed | Student and Instructor metrics are MVP; Game Company metrics are future work. |
| UC-35 | Mixed | Portals consume current configuration; configuration administration/authoring is existing-system or future work. |
| UC-36 | MVP | Current configuration retrieval for the representative MVP game. |
| UC-37 | Future | Direct LMS synchronization is excluded from MVP. |
| UC-38 | MVP | An Instructor initiates an LMS-oriented grade-file export for an authorized classroom. Discovery baselines the finite target-MVP format list and classroom/student mapping; later formats require explicit scope and forecast revision. |
| UC-39 | MVP | Within the for-credit path, the Student redeems an institution-purchased assigned game using an acquisition code that activates a fixed-term license; code generation and license authority are discovery decisions. |
| UC-40 | MVP | A fixed-term game license can be renewed without deleting historical acquisitions, license terms, game-play records, or game-state records. |
| UC-41 | Future | Institutional contracts define which games an institution may assign; contract administration remains outside the target Student and Instructor portals. |
| UC-42 | MVP | An authorized employee or Instructor publishes an immutable classroom Game Version assignment with an active period and configured acquisition-license duration; changing it requires a replacement assignment. |
| UC-43 | Future | Game Forge can create an immutable customized Game Version from a selected base version with custom content and enabled languages/locales. |

The classifications identify target-roadmap scope, not requirement deletion or initial-engagement sequencing. Future and unselected TBD cases remain part of the longer-term product requirements.

## 1. User & Account Management

### UC-01 — Student creates an account
**Actor:** Student

1. User establishes a login and password.
2. User is established as a Student User Type.
3. User can subsequently acquire games.

### UC-02 — Invited user establishes an account
**Actor:** Invited User

1. User receives an invitation from an authorized ScholArk user.
2. User follows the invitation link.
3. User establishes an account with the invited User Type.

### UC-03 — User switches User Type
**Actor:** User

1. A person has more than one User Type associated with their account.
2. User selects the option to switch User Type.
3. User accesses only the data and actions authorized for the selected User Type.

### UC-04 — User selects preferred language
**Actor:** User

1. User has a preferred language as part of their User Profile.
2. ScholArk uses the preferred language for the user experience.

---

## 2. Student — Game Acquisition

### UC-05 — Student views licensed games
**Actor:** Student

1. Student logs in.
2. Student sees games for which they have current or historical licenses.
3. Games with active licenses are shown first, with license status and expiration information.
4. Games with expired licenses remain visible in history but cannot be launched.
5. Student can acquire additional licenses or renew an eligible license.

### UC-06 — Student acquires a game for educational credit
**Actor:** Student

1. Student chooses to acquire a game.
2. ScholArk asks whether the game is for educational credit.
3. Student confirms that it is.
4. ScholArk presents institutions that have at least one active contract with an eligible game.
5. Student selects an institution.
6. ScholArk presents courses currently using at least one game.
7. Student selects a course.
8. ScholArk presents applicable classrooms for that course.
9. Student selects a classroom.
10. ScholArk presents Game Versions currently assigned to that classroom.
11. Student selects an assigned Game Version not already associated with that Student in the selected classroom.
12. If the Student already has a not-for-credit Student Game and license history, ScholArk follows the license reuse or classroom-association rule established during discovery.
13. Otherwise, ScholArk identifies whether the classroom purchase type is Student-purchased or institution-purchased.
14. Student continues through the corresponding Stripe purchase or acquisition-code redemption flow.

### UC-07 — Student selects a default institution
**Actor:** Student

1. Student chooses to acquire a game for educational credit.
2. ScholArk identifies the last institution with which the student had an active game, if applicable.
3. That institution is presented as the default option.

### UC-08 — Student reports an unlisted institution
**Actor:** Student / ScholArk Support

1. Student does not find their institution in the institution list.
2. Student enters the institution name, course name, and instructor name.
3. ScholArk generates a message for ScholArk Support.
4. The message includes the provided information and user information.
5. ScholArk routes the message to the support destination selected during discovery and confirms submission to the Student.
6. ScholArk Support resolution and follow-up occur outside the MVP portal.

### UC-09 — Student reports an unlisted course
**Actor:** Student / ScholArk Support

1. Student selects an institution.
2. Student does not find their course.
3. Student provides the required course information.
4. ScholArk generates a message for ScholArk Support.
5. ScholArk routes the message to the support destination selected during discovery and confirms submission to the Student.
6. ScholArk Support resolution and follow-up occur outside the MVP portal.

### UC-10 — Student reports an unlisted game
**Actor:** Student / ScholArk Support

1. Student selects an institution and course.
2. Student does not find the desired game.
3. Student indicates that the game is not shown.
4. ScholArk generates a message for ScholArk Support.
5. ScholArk routes the message to the support destination selected during discovery and confirms submission to the Student.
6. ScholArk Support resolution and follow-up occur outside the MVP portal.

### UC-11 — Student acquires a game not for educational credit
**Actor:** Student

1. Student indicates that the game is not for educational credit.
2. Student browses the ScholArk game catalog without selecting an institution, course, or classroom.
3. Student selects a publicly available base Game Version.
4. Student purchases the game through Stripe.
5. ScholArk activates a Student-paid fixed-term license without a classroom association.

### UC-12 — Student acquires an assigned game version
**Actor:** Student

1. Student opens the selected classroom and sees the Game Versions assigned to it through ClassroomGame.
2. Student selects an assigned Game Version not already associated with that Student in the selected classroom.
3. If the Student already has a not-for-credit Student Game and license history, ScholArk applies the license reuse or classroom-association rule established during discovery.
4. Otherwise, the classroom identifies the purchase type as Student-purchased or institution-purchased.
5. For a Student-purchased game, the Student pays through Stripe and ScholArk activates a fixed-term license.
6. For an institution-purchased game, the Student continues to acquisition-code redemption.
7. ScholArk activates a license for the exact Game Version selected by the classroom assignment, using the assignment's configured license duration.
8. ScholArk records the classroom context separately for educational progress and grading; the license itself remains valid independently of the classroom.

### UC-39 — Student redeems an institution-purchased game
**Actor:** Student

1. Within the for-credit path, the Student opens a classroom and selects an assigned Game Version marked as institution-purchased by its ClassroomGame assignment.
2. ScholArk asks the student for an acquisition code.
3. Student enters the acquisition code.
4. ScholArk validates the code using the mechanism established during discovery.
5. ScholArk activates or records the Student's fixed-term license for the exact assigned Game Version.
6. Institution invoicing remains outside the MVP.

### UC-40 — Student renews a game license
**Actor:** Student

1. Student views a game with an expiring or expired license.
2. Student initiates renewal through the approved Student-funded or institution-funded process.
3. ScholArk validates the payment or acquisition code and creates or extends the active license term exactly once.
4. The renewed license permits the Game Version or versions defined by the approved renewal policy for the new fixed period.
5. Historical acquisitions, prior license terms, game-play records, game-state records, progress, and grading history remain preserved and attributable to their applicable versions.

---

## 3. Student — Playing & Progress

### UC-13 — Student launches a licensed game
**Actor:** Student

1. Student views a licensed game.
2. Student selects **Play**.
3. ScholArk confirms that the Student has an active license.
4. ScholArk resolves the Game Version permitted by the license and classroom rules established during discovery.
5. ScholArk launches that version using the stored game website.
6. If the license is expired or does not permit the required version, ScholArk denies launch and offers the applicable renewal or upgrade path.
7. The student's login and/or password may be entered into the game.

### UC-14 — Student resumes a game
**Actor:** Student / Game

1. Student exits a game.
2. The game creates a game-state record associated with the Student's Game and source Game Version.
3. Student later returns to the game.
4. ScholArk and the game apply the version compatibility, migration, fallback, or reset rule established during discovery.
5. The game resumes from compatible or successfully migrated state; otherwise, the approved fallback or confirmed reset behavior applies without deleting historical records.

### UC-15 — Student views game progress
**Actor:** Student

1. Student selects a licensed game.
2. Student views game-play progress with the applicable Game Version context where versions affect interpretation.
3. ScholArk presents progress based on the Student Game's game-play records and the mapping version applicable to each source Game Version.

### UC-16 — Student views grading information
**Actor:** Student

1. Grading information is available for a Student Game with records eligible under the approved classroom-association and Game Version policies.
2. Student views the grading information with sufficient version context to explain how it was calculated.

---

## 4. Student — Support

### UC-17 — Student requests support
**Actor:** Student / ScholArk Support

1. Student accesses Support.
2. Student submits a support request.
3. ScholArk validates and routes the request to the support destination selected during discovery.
4. Student receives confirmation that the request was submitted.
5. Support-agent administration and resolution workflows remain outside the MVP portal.

---

## 5. Instructor

### UC-18 — Instructor establishes an account
**Actor:** Instructor / ScholArk Employee

1. ScholArk employee sends an invitation email.
2. Instructor follows the invitation link.
3. Instructor establishes an account.

### UC-19 — Instructor views assigned classrooms
**Actor:** Instructor

1. Instructor logs in.
2. Instructor views the courses/classrooms assigned to them.
3. The instructor may be assigned to classes at one or more institutions.

### UC-20 — Instructor views students
**Actor:** Instructor

1. Instructor selects a classroom.
2. Instructor views students in the class who have acquired the game.

### UC-21 — Instructor views student progress
**Actor:** Instructor

1. Instructor selects a classroom/game.
2. Instructor views progress derived from each Student Game's records according to the classroom-association, Game Version, mapping-version, and historical-record policies established during discovery.

### UC-22 — Instructor views student grades
**Actor:** Instructor

1. Instructor selects a classroom/game.
2. Instructor views grades derived from eligible Student Game records according to the historical-record and Game Version grading policies established during discovery.

### UC-23 — Instructor defines game grading
**Actor:** Instructor

1. Instructor defines how game play is graded.
2. The grading is based on the structure of game play established by ScholArk employees.
3. ScholArk applies the grading-history policy established during discovery when Student Game records predate the classroom association.
4. ScholArk applies the Game Version compatibility and grading-rule migration policy when game-play structure changes.

---

## 6. ScholArk Administration

### UC-24 — ScholArk employee creates a classroom
**Actor:** ScholArk Employee

1. Employee creates a classroom within an institution.
2. Employee specifies the instructor.
3. Employee specifies course number/name.
4. Employee specifies how the game will be used.
5. Employee specifies the language.
6. Employee selects contracted games that the institution is permitted to assign.
7. Employee creates classroom game assignments with a selected immutable Game Version.
8. Employee specifies the assignment active period.
9. Employee specifies the duration of licenses acquired through the assignment.
10. Employee designates the payment mode.

### UC-25 — ScholArk employee assigns an instructor
**Actor:** ScholArk Employee

1. Employee configures a classroom.
2. Employee assigns an instructor to the classroom.

### UC-26 — ScholArk employee assigns game versions
**Actor:** ScholArk Employee

1. Employee configures a classroom.
2. Employee selects one or more games permitted by the institution's active contract.
3. Employee selects the immutable Game Version for each classroom assignment.
4. Employee configures the assignment active period and license duration.
5. Once published, the assignment cannot be edited; a replacement assignment is required for a change.
6. Assigned Game Versions become available for student acquisition while their assignments are active.

### UC-27 — ScholArk employee configures game usage
**Actor:** ScholArk Employee

1. Employee configures how a Game Version will be used in a classroom.
2. Employee specifies the game usage mode.
3. Employee specifies the language.
4. Custom content is a future Game Forge capability and is published as a new immutable Game Version rather than changing the assigned version.

### UC-41 — ScholArk employee manages an institution game contract
**Actor:** ScholArk Employee

1. Employee creates or updates an institutional contract.
2. Employee specifies the contract status, institution, contract type, channel, sales region, start date, and end date.
3. Employee specifies whether the student or institution is the designated payer.
4. Employee links games that the institution may assign under the contract.
5. Only games linked to an active contract may be selected for a classroom assignment.

### UC-42 — Authorized user publishes a classroom Game Version assignment
**Actor:** ScholArk Employee / Authorized Instructor

1. Authorized user selects a contracted Game and an immutable Game Version.
2. Authorized user selects the classroom and configures the assignment start and end dates.
3. Authorized user configures the fixed duration of licenses acquired through the assignment.
4. ScholArk validates that the institution contract and selected Game Version permit the assignment.
5. ScholArk publishes the assignment.
6. After publication, the assignment and its selected Game Version cannot be changed.
7. A change requires a replacement assignment, and a change to game content requires a new Game Version.

### UC-43 — Instructor creates a customized Game Version
**Actor:** Instructor / Game Forge

1. Instructor selects a ScholArk-available base Game Version.
2. Instructor adds supported custom content, such as text or media.
3. Instructor selects the enabled languages or locales.
4. Game Forge creates a standalone immutable Game Version with a globally unique identifier.
5. The customized version records which base version it was created from when lineage is supported.
6. The customized version must be selected by a new classroom assignment before students can acquire licenses for it.

---

## 7. Game Catalog & Game Companies

### UC-28 — ScholArk employee adds a game to the catalog
**Actor:** ScholArk Employee

1. Employee adds a new game and its publicly available base Game Versions to the ScholArk catalog.
2. Basic game information and catalog visibility are established.
3. Classroom-associated Game Versions are excluded from general catalog discovery and are exposed only through their ClassroomGame assignments.
3. If ScholArk portals are to be used, the game's game-play records and game-state records are mapped to ScholArk's generic record structure.

### UC-29 — ScholArk maps a game's records
**Actors:** ScholArk / Game Company

1. A game's game-play and game-state records are identified.
2. Each supported Game Version's records are mapped to a versioned ScholArk generic record structure or an explicitly compatible mapping version.
3. ScholArk uses the mapped records to present metrics and support grading.

### UC-30 — ScholArk sells a game without full ScholArk services
**Actor:** ScholArk

1. A game is added to the ScholArk catalog.
2. The game is sold through ScholArk.
3. ScholArk does not provide all other ScholArk services for that game.

---

## 8. Game Records & Progress

### UC-31 — Game generates game-play records
**Actor:** Game

1. Game play generates records when events or milestones occur.
2. Records can be generated when levels, sub-levels, or other game elements are completed.
3. Each record is associated with the relevant Student Game and source Game Version.
4. Records can be used for grading when eligible under the applicable classroom-association and historical-record policy.

### UC-32 — Game generates game-state records
**Actor:** Game

1. Player exits the game.
2. Game creates a game-state record associated with the relevant Student Game and source Game Version.
3. The record allows the player to re-enter where they left off during a later compatible game session, subject to the approved cross-version state policy.

### UC-33 — ScholArk maps game records
**Actors:** ScholArk / Game Company

1. A game's internal structure and terminology are identified.
2. Its game-play records and game-state records are mapped using the mapping version applicable to their source Game Version.
3. ScholArk uses the mapping to present game progress and metrics.
4. Instructors can use the resulting information for grading.

### UC-34 — ScholArk presents game metrics
**Actors:** Student / Instructor / Game Company

1. Game-play records are mapped to ScholArk's generic structure.
2. ScholArk uses the records to present metrics about game progress.
3. Metrics can be presented to students, instructors, and game companies.

---

## 9. Game Configuration

### UC-35 — ScholArk maintains game configuration
**Actor:** ScholArk

1. ScholArk maintains configuration files for games.
2. Configuration can contain language.
3. Configuration can contain game type.
4. Configuration can eventually contain custom content.
5. Each configuration revision identifies its applicable Game Version or compatibility range.

### UC-36 — Game retrieves current configuration
**Actor:** Game

1. Student logs into a game.
2. Game checks whether the classroom configuration is current for the launched Game Version.
3. If it is not current, the game uses the latest approved configuration compatible with that Game Version and classroom.

---

## 10. LMS Integration

### UC-37 — ScholArk sends grades to an LMS
**Actors:** ScholArk / LMS

1. ScholArk has student grades.
2. ScholArk integrates with an LMS such as Canvas, Blackboard, or Moodle.
3. ScholArk sends grades directly to the LMS.

### UC-38 — Instructor exports an LMS grade file for a classroom
**Actor:** Instructor

1. Instructor opens a classroom they are authorized to access.
2. Instructor initiates a grade-file export and selects an available LMS format when more than one format is supported.
3. ScholArk generates the file using the selected format and includes only the applicable students and grades for that classroom.
4. Instructor downloads the generated file.
5. The Instructor or institution uploads the file to the LMS or uses it for manual grade entry.
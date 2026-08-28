# ScholArk Platform User Story

This will be a website to facilitate administration and distribution of educational computer games used, primarily, by colleges and universities – worldwide. The initial site would be in English, but it should be designed to operate in other languages. Therefore, the website should have a typical language selection functionality. (Within ScholArk, the preferred language would be part of the User Profile.)
The best analogy is that ScholArk would be – for educational games – what Steam is for entertainment games. However, ScholArk needs to have far more functionality.
New Users create a login and password. There would be different User Types: e.g., Student/Individual (hereafter, Student), Instructor, Institutional Administrator, Game Company Support, Game Company Administrator, ScholArk Support, ScholArk Administrator, etc. All User Types other than Student would be subject to a designated authorization process (initially, the process would be an invitation from an authorized ScholArk user. So, the only User Type that could be established by someone logging for the first time without a ScholArk invitation would be Student.

## New User Login
Step 1: User logs in or establishes an account (initially, by default, is Student User Type unless signing on as a result of a ScholArk invitation. Ultimately, there could also be an option for the new user to indicate they’re an instructor and select for which institution).
Step 2: Returning users see a list of licensed games, with games under an active license on top. Expired licenses remain visible in history, but the games cannot be accessed until the license is renewed. Users can acquire or renew licenses here.

## Acquiring games
### Step A
The Student is asked, “Is the game for educational credit?” If so, a list is presented of institutions that have at least one active game (among all game companies). The default option would be the last institution the Student had an active game with, if applicable. If the school isn’t listed, the Student inputs the name of the institution, course name, and instructor name. A message is then generated for ScholArk Support with the information (i.e., institution name, course name, instructor name, user information, etc.) for ScholArk Support to resolve and email the Student when resolved. If not for a particular institution/course, the user can simply go to the ScholArk store and buy any game. The find functionality, in this case, would have to be defined.

### Step B
If the Institution is listed and selected, a list is presented of courses currently using at least one game. Again, the Student can select one or indicate the course isn’t listed and ScholArk generates a message, similar to Step A.

### Step C
Once the Institution and Course have been selected, a list is presented of games currently being used in that course. The Student can select one that the Student hasn’t already acquired or indicate that the game they want isn’t shown. Again, a suitable message would be generated for ScholArk support. If an assigned game is selected that wasn’t previously acquired, the Student would have the opportunity to acquire it.

### Step D
Game acquisition means acquiring a license to access a game for a fixed period; it does not transfer ownership of the game. It has two independent dimensions: the acquisition path and the purchase type.

There are two acquisition paths:

1. **For educational credit:** The Student selects an institution, course, classroom, and assigned game. The classroom determines one of two purchase types:
	- **Institution-purchased:** The Student enters an acquisition code that activates a fixed-term license.
	- **Student-purchased:** The Student purchases a fixed-term license through Stripe.
2. **Not for educational credit:** The Student browses the ScholArk game catalog and purchases a fixed-term license through Stripe for personal use, without an institution, course, or classroom association. This path is always student-purchased.

Institution purchases are invoiced to the institution and invoicing is outside the MVP. How acquisition codes are generated, who generates them, and where institution-funded licenses are stored and validated remain to be determined during discovery. A future integration with the applicable Bookstore Management System (BMS) may be needed to access scholarship/grant funds.

Access is allowed only while the license is active. After expiry, access is denied, but historical acquisition, license, game-play, and game-state records remain. A license can be renewed without deleting that history. Discovery must determine license duration, activation and expiration rules, renewal behavior, and what happens when a Student first acquires a license outside a classroom and later needs the same game for educational credit in a classroom.

## Playing Games
ScholArk would store the website for acquired games, so clicking on Play would launch the game – and, possibly, enter the Student’s login and/or password. In addition, see the section on config files.

## Other Student Functionality
For each acquired game, the Student can look at game-play progress and, potentially, grading info.
The Student needs to be able to access Support, as well. All support should be funneled through ScholArk. ScholArk will provide support related to ScholArk functionality and, in all likelihood, first level technical game support for many or most games.

## Instructor Functionality
An Instructor would establish an account based on an invitation with a link that was emailed by a ScholArk employee. Important Note: individuals may have more than one User Type, but not multiple accounts for the same User Type. If a person had more than one User Type, a switch User Type option would need to be activated.
The Instructor would see the courses that the Instructor is assigned to for one or more classes and look at all students in the class who have acquired the game. The Instructor would be able to look at student progress and grades. (A note about courses and classrooms: it’s common to have a course number with several sections. In such a case, each section would be a different classroom.)
The instructor could designate how game play is graded, based on the structure of game play as set up by ScholArk employees.
ScholArk will support Learning Management Systems (LMS’s) – e.g., Canvas, Blackboard, Moodle to either send grades directly or create a file in a specified format to facilitate someone uploading or manual entry.

## ScholArk Administration
An employee at ScholArk sets up classrooms within institutions. The classroom set-up includes the instructor, course number/name, information about how the game will be used (e.g. game only or game-based course; language; and, eventually, instructor designated custom content). There’s a ScholArk Admin desktop app that’s used for setting up classrooms. Once the classroom is set up within the institution, the instructor is assigned, games are assigned, mode of payment is designated, etc., students would be able to acquire games.
New games can be added to the ScholArk catalog. Initially, only games using full ScholArk services would be included. However, I expect that we may sell some games that we aren’t providing the other services for.
To add a game to ScholArk, there would be basic things that need to be done. If ScholArk Student, Instructor, or other portals are to be used, game-play records and game-state records for the game would need to be mapped to ScholArk’s generic record structure.

## ScholArk Game Records
Typically, games spin off game-play records during game play when certain events take place or milestones are achieved. Games also create game-state records when a player exits the game so the player can re-enter where they left off during the next game session.
Game-play records and game-state records relate to the Student's Game and may exist before that Student Game is associated with a classroom. Discovery must determine whether records created before a later classroom association can be used for classroom progress and grading.
Discovery must also define Game Version and version-licensing behavior. A new Game Version may change the game-state format and game-play structure used for progress and grading. The design must determine whether licenses cover the Game or specific versions, which version a classroom and Student launch, whether existing state can be migrated or resumed, and how historical records and grading rules remain attributable to the version that produced them.
To achieve learning objectives, educational games should be linear and hierarchical. The levels can be given different names – e.g. missions, quests, puzzles, etc. Usually, completing levels signifies achieving a particular learning objective. Consequently, successfully progressing through the game demonstrates mastery of the learning objectives. Game-play records should be created – at a minimum – at completion of various levels, sub-levels, etc. These records can then be used for grading purposes. By mapping a particular game's design structure, terminology, etc. onto ScholArk’s generic structure, ScholArk can present metrics on game progress to students, instructors, game companies, etc. In addition, instructors can designate how game play is to be graded.

## Game Config Files
ScholArk will be able to maintain the config files for games. Initially, ScholArk would support only web games. (Launching desktop games from a website is problematic.) When a player logs in to play a game, the game could check to see if the config file for that classroom and Game Version is the most recent compatible revision. If not, the latest approved compatible config file would be used. The config file would be used to data-drive the game with respect to language; game type (e.g., game-based course – i.e., GBC – vs. just the game); and, eventually, custom content.

## MVP Scope

MVP will include only
 - Student portal
 - Instructor portal

The initial MVP supports Triseum-produced web games. The representative game and responsibility for required game-side changes will be determined during discovery. Student purchases use Stripe. Institution invoicing is outside the MVP, but students must be able to redeem institution-purchased games using acquisition codes. The MVP allows an authorized Instructor to initiate and download an LMS grade file for a selected classroom; supported format(s) and classroom/student mapping will be determined during discovery.

ScholArk Administration, ScholArk Support, Institution portal, and Game Publisher portal are out of scope of MVP.

## Existing apps

ScholArk Administration already exists as a standalone Visual Basic application connected to an MSSQL database.

ScholArk Administration includes setting up Institution, Game Publisher, and Instructor accounts, setting up the class and course hierarchy, and creating Game listings.









# Current Model ER Diagram

Account and identity entities are excluded. `GameLicense.user` and `GameAcquisition.user` reference the excluded `User` entity.

```mermaid
erDiagram
    %% Game and publisher slice
    GAME {
        uuid id PK
        string title
        string slug UK
        text summary
        text description
        json cover
        uuid publisher_id FK
        int estimatedLengthMinutesMin
        int estimatedLengthMinutesMax
        boolean isFeatured
        json mediaList
        date publishedAt
    }

    PUBLISHER {
        uuid id PK
        string name
        string slug UK
        string websiteUrl
    }

    PUBLISHER_MEMBER {
        uuid id PK
        uuid publisher_id FK
        uuid user_id FK
    }

    GAME_VERSION {
        uuid id PK
        uuid game_id FK
        text description
        string publisherVersion
        string runUrl
        date createdAt
        date publishedAt
    }

    GAME_VARIANT {
        uuid id PK
        uuid gameVersion_id FK
        string language
        string mode
        json runtimeConfiguration
        date createdAt
    }

    PUBLIC_GAME_OFFER {
        uuid id PK
        uuid gameVariant_id FK
        int price_minorUnitAmount
        string price_currency
        boolean isAvailable
        date createdAt
        date publishedAt
    }

    INSTITUTION_GAME_OFFER {
        uuid id PK
        uuid gameVariant_id FK
        string designatedPayor
        int price_minorUnitAmount
        string price_currency
        int allocatedLicenseQuantity
        int licenseDurationDays
    }

    GAME_CUSTOMIZATION {
        uuid id PK
        uuid gameVersion_id FK
        json content
        date createdAt
        date publishedAt
    }

    GAME_LICENSE {
        uuid id PK
        uuid user_id FK
        uuid classroomGame_id FK
        uuid gameVariant_id FK
        uuid customization_id FK
        date startAt
        date endAt
        date createdAt
    }

    GAME_ACQUISITION {
        uuid id PK
        uuid user_id FK
        uuid publicOffer_id FK
        uuid institutionGameOffer_id FK
        uuid license_id FK
        string mechanism
        int price_minorUnitAmount
        string price_currency
        date createdAt
    }

    ACQUISITION_CODE {
        uuid id PK
        string code UK
        uuid institutionGameOffer_id FK
        date expiresAt
        date revokedAt
        date createdAt
    }

    ACQUISITION_CODE_REDEMPTION {
        uuid id PK
        uuid acquisitionCode_id FK
        uuid redeemedBy_id FK
        date redeemedAt
        UK acquisitionCode_id_redeemedBy_id
    }

    GAME_PAYMENT_ATTEMPT {
        uuid id PK
        uuid user_id FK
        uuid publicOffer_id FK
        uuid institutionGameOffer_id FK
        uuid classroomGame_id FK
        uuid customization_id FK
        string stripeCheckoutSessionId UK
        string stripePaymentIntentId
        string status
        int price_minorUnitAmount
        string price_currency
        int licenseDurationDays
        date createdAt
        date fulfilledAt
    }

    GAME_TAXONOMY_TERM {
        uuid id PK
        uuid game_id FK
        uuid taxonomyTerm_id FK
        boolean isPrimary
        int sortOrder
    }

    TAXONOMY_TERM {
        uuid id PK
        string type
        string label
        string slug
    }

    GAME }o--|| PUBLISHER : published_by
    PUBLISHER ||--o{ PUBLISHER_MEMBER : members
    GAME ||--o{ GAME_VERSION : versions
    GAME ||--o{ GAME_TAXONOMY_TERM : tagged_by
    TAXONOMY_TERM ||--o{ GAME_TAXONOMY_TERM : tags
    GAME_VERSION ||--o{ GAME_VARIANT : variants
    GAME_VARIANT ||--o{ PUBLIC_GAME_OFFER : public_offers
    GAME_VARIANT ||--o{ INSTITUTION_GAME_OFFER : institution_offers
    GAME_VERSION ||--o{ GAME_CUSTOMIZATION : customizations
    GAME_VARIANT ||--o{ GAME_LICENSE : licenses
    GAME_CUSTOMIZATION o|--o{ GAME_LICENSE : optional_customization
    PUBLIC_GAME_OFFER ||--o{ GAME_ACQUISITION : acquired_as
    INSTITUTION_GAME_OFFER ||--o{ GAME_ACQUISITION : acquired_as
    GAME_LICENSE ||--o{ GAME_ACQUISITION : created_by
    INSTITUTION_GAME_OFFER ||--o{ ACQUISITION_CODE : authorizes
    USER o|--o{ ACQUISITION_CODE : redeemed_by
    USER ||--o{ GAME_PAYMENT_ATTEMPT : creates
    PUBLIC_GAME_OFFER o|--o{ GAME_PAYMENT_ATTEMPT : pays_for
    INSTITUTION_GAME_OFFER o|--o{ GAME_PAYMENT_ATTEMPT : pays_for
    CLASSROOM_GAME o|--o{ GAME_PAYMENT_ATTEMPT : pays_for
    GAME_CUSTOMIZATION o|--o{ GAME_PAYMENT_ATTEMPT : configures

    %% Institution and classroom slice
    INSTITUTION {
        uuid id PK
        string name
        string slug UK
        json cover
        text summary
        text description
        string websiteUrl
        string status
        date createdAt
        date updatedAt
    }

    COURSE {
        uuid id PK
        uuid institution_id FK
        string name
        string code
        string slug UK
        json cover
        text summary
        text description
        string status
        date createdAt
        date updatedAt
    }

    CLASSROOM {
        uuid id PK
        uuid institution_id FK
        string name
        string code
        string slug UK
        json cover
        text summary
        text description
        string status
        date createdAt
        date updatedAt
    }

    INSTRUCTOR {
        uuid id PK
        string name
        string slug UK
    }

    CLASSROOM_GAME {
        uuid id PK
        uuid classroom_id FK
        uuid institutionGameOffer_id FK
        uuid customization_id FK
        date startAt
        date endAt
        date publishedAt
        date createdAt
        date updatedAt
    }

    INSTITUTION ||--o{ COURSE : offers
    INSTITUTION ||--o{ CLASSROOM : contains
    INSTITUTION }o--o{ INSTRUCTOR : associates
    CLASSROOM }o--o{ COURSE : includes
    CLASSROOM }o--o{ INSTRUCTOR : assigns
    CLASSROOM }o--o{ TAXONOMY_TERM : tagged_by
    CLASSROOM ||--o{ CLASSROOM_GAME : schedules
    INSTITUTION_GAME_OFFER ||--o{ CLASSROOM_GAME : selected_for
    GAME_CUSTOMIZATION o|--o{ CLASSROOM_GAME : optional_customization
    CLASSROOM_GAME ||--o{ GAME_LICENSE : contextualizes
```

## Constraints

- `Game.slug` unique.
- `GameVersion(game, publisherVersion)` unique.
- `GameVariant(gameVersion, language, mode)` unique.
- `Institution.slug` unique.
- `Course.slug` unique.
- `Course(institution, code)` unique.
- `Classroom.slug` unique.
- `Classroom(institution, code)` unique.
- `Instructor.slug` unique.
- `TaxonomyTerm(type, slug)` unique.
- `GameTaxonomyTerm(gameId, taxonomyTerm)` unique.
- `InstitutionGameOffer(gameVariant, designatedPayor)` unique.
- `AcquisitionCode.code` unique.
- `GamePaymentAttempt.stripeCheckoutSessionId` unique when present.
- An expired license is retained as history. A later purchase or redemption creates a separate license through the ordinary acquisition path; licenses are not renewed.
- Duplicate active classroom acquisition is enforced by application transactions, not a blanket `(user, classroomGame)` unique constraint.
- `GameLicense.startAt <= now < endAt` is the active interval. Expired licenses remain historical records.

## Value Types

```text
Media = { type: image | video, src: string, alt: string }
Money = { minorUnitAmount: integer, currency: Currency }
```

`Media` is stored as JSON. `Money` is embedded with `price_` prefixes in `PublicGameOffer`, `InstitutionGameOffer`, `GameAcquisition`, and payment attempts. Publishers define standalone public offers and classroom-use institution offers independently of institutions. A classroom assignment selects an institution offer; institution billing is out of scope.

## Implemented acquisition and launch behavior

- Public and student-paid classroom acquisitions create `GamePaymentAttempt` records and are fulfilled only after a verified Stripe webhook.
- Institution-funded classroom acquisition uses a single-use `AcquisitionCode` scoped to the selected `InstitutionGameOffer`; redemption creates the license and `GameAcquisition` transactionally. This is access fulfillment, not institution billing.
- Expired licenses are not renewed. A new license must be acquired through a new standalone purchase or the selected classroom assignment's payer flow.
- A classroom assignment determines the exact `GameVariant`, optional customization, payer, and license duration. The assigned variant supplies language, mode, and runtime configuration.
- The protected launch endpoint authorizes the current user and active exact-version license, then returns the stored game URL with a short-lived signed `launch_token`. Token validation by the game is part of the game integration contract and is not represented as a persisted ER entity.

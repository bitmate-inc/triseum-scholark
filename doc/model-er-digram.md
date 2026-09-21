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
        uuid institutionContractGameOffer_id FK
        uuid license_id FK
        string mechanism
        int price_minorUnitAmount
        string price_currency
        date createdAt
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
    GAME_VERSION ||--o{ GAME_CUSTOMIZATION : customizations
    GAME_VARIANT ||--o{ GAME_LICENSE : licenses
    GAME_CUSTOMIZATION o|--o{ GAME_LICENSE : optional_customization
    PUBLIC_GAME_OFFER ||--o{ GAME_ACQUISITION : acquired_as
    INSTITUTION_CONTRACT_GAME_OFFER ||--o{ GAME_ACQUISITION : acquired_as
    GAME_LICENSE ||--o{ GAME_ACQUISITION : created_by

    %% Institution, classroom, and contract slice
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

    INSTITUTION_CONTRACT {
        uuid id PK
        uuid institution_id FK
        string type
        string designatedPayor
        string status
        date startAt
        date endAt
        date createdAt
        date updatedAt
    }

    INSTITUTION_CONTRACT_GAME_OFFER {
        uuid id PK
        uuid contract_id FK
        uuid gameVariant_id FK
        int price_minorUnitAmount
        string price_currency
        int allocatedLicenseQuantity
        int licenseDurationDays
    }

    CLASSROOM_GAME {
        uuid id PK
        uuid classroom_id FK
        uuid contractGameOffer_id FK
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
    INSTITUTION ||--o{ INSTITUTION_CONTRACT : contracts
    CLASSROOM }o--o{ COURSE : includes
    CLASSROOM }o--o{ INSTRUCTOR : assigns
    CLASSROOM }o--o{ TAXONOMY_TERM : tagged_by
    INSTITUTION_CONTRACT ||--o{ INSTITUTION_CONTRACT_GAME_OFFER : includes
    GAME_VARIANT ||--o{ INSTITUTION_CONTRACT_GAME_OFFER : contracted
    CLASSROOM ||--o{ CLASSROOM_GAME : schedules
    INSTITUTION_CONTRACT_GAME_OFFER ||--o{ CLASSROOM_GAME : schedules
    GAME_CUSTOMIZATION o|--o{ CLASSROOM_GAME : optional_customization
    CLASSROOM_GAME ||--o{ GAME_LICENSE : grants
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
- `InstitutionContractGameOffer(contract, gameVariant)` unique.
- `GameLicense(user, classroomGame)` unique for classroom licenses; public licenses leave `classroomGame` null.

## Value Types

```text
Media = { type: image | video, src: string, alt: string }
Money = { minorUnitAmount: integer, currency: Currency }
```

`Media` is stored as JSON. `Money` is embedded with `price_` prefixes in `PublicGameOffer`, `InstitutionContractGameOffer`, `GameAcquisition`, and payment attempts. Public offers are optional; a listed game version can have institutional offers without a public offer.

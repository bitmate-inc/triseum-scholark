# ARTé: Mecenas Portal API Requests

## Capture

- Game URL: `http://arte-web.triseum.com/2.0.5/`
- Portal origin: `https://portal.triseum.com`
- Snapshot date: 2026-10-19
- The five-minute monitoring window produced no new network events beyond the startup resources already captured.
- Second monitoring window: 2026-10-19 00:29:30.805-00:34:30.825 UTC; no new network events were observed, including API or `OPTIONS` requests.
- Request and response bodies and headers were not collected. Query values and UUID-like path segments are redacted.

## Portal API Calls

All recorded portal API entries returned HTTP `200`.

| Path | Method | Count | Query parameter names |
| --- | --- | ---: | --- |
| `/api/UserProfile/v2/login` | Unavailable | 1 | None |
| `/api/Classroom/v2` | Unavailable | 1 | `db`, `list`, `productID` |
| `/api/UserProfile/v2` | Unavailable | 1 | None |
| `/api/legal/v1/[redacted]/[redacted]` | Unavailable | 2 | None |
| `/api/codex` | Unavailable | 1 | `db`, `lvl`, `revision` |
| `/api/UserSave/[redacted]/[redacted]` | Unavailable | 1 | `db` |

The startup entries were read from browser Resource Timing, which did not expose HTTP methods in this capture. No `OPTIONS` entries were recorded, but method-based exclusion cannot be independently verified for these entries.

## Other Notable Traffic

These Unity runtime bundles were fetched from `arte-web.triseum.com`; they are game assets, not portal API calls:

| Asset | Status | Duration |
| --- | ---: | ---: |
| `ArteMecenas_1463.datagz` | 200 | 40.25 s |
| `ArteMecenas_1463.jsgz` | 200 | 8.44 s |
| `ArteMecenas_1463.memgz` | 200 | 0.86 s |

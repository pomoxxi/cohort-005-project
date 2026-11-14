# Charge full price when the buyer's country is unknown

Purchasing-power prices depend on the buyer's country, which `resolveCountry` reads from the `CF-IPCountry` header (or a dev session override). When neither is there, the buyer pays full price. Some Students who should get a discount pay full price, but no page waits on a network call to learn a country.

## Considered Options

- **Look up the first `X-Forwarded-For` address on ip-api.com.** We did this, and dropped it: the course list, the purchase page and every lesson page for a discounted Purchase waited on a network call, and the free endpoint is plain HTTP and limited to 45 requests a minute.
- **Bundle a MaxMind GeoLite2 database.** Rejected: it needs a licence key, a download of tens of megabytes, and an update every month.

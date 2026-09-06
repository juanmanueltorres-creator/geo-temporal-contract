# Package consumption

The TypeScript reference implementation is exposed from the package root as `@juanmanueltorres/geo-temporal-contract`.

For repository consumers that do not use a registry release yet, pin the GitHub dependency to an immutable commit SHA instead of `main`.

Example:

```json
{
  "dependencies": {
    "@juanmanueltorres/geo-temporal-contract": "github:juanmanueltorres-creator/geo-temporal-contract#<commit-sha>"
  }
}
```

This keeps the consumer reproducible while the package remains pre-registry.

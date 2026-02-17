# Data Model Quick Reference

## Top-Level Types (`lib/blob/types.ts`)
```
Dataset = { id, status: "live"|"draft", data: DatasetData, test_cases: TestCase[] }
DatasetBlob = { data: DatasetData, test_cases: TestCase[] }
DatasetData = { facts, questions, rules, constants, action_conditions }
```

## Facts — `Record<string, BlobFact>`
```ts
BlobFact = {
  type: "boolean_state" | "enum" | "array"
  core: boolean          // true = set by questions, false = derived by rules
  category?: string      // auto-assigned by assignCategory()
  values_ref?: string    // ref to constants group (for enum/array)
  enabled: boolean       // soft-delete flag
}
```
Key: fact ID string (e.g. "has_company_vehicles")

## Questions — `BlobQuestion[]` (array, index matters!)
```ts
BlobQuestion = {
  type: "boolean_state" | "single-select" | "multi-select" | "checkbox-radio-hybrid"
  label: string
  description?: string
  fact?: string                    // single fact this sets
  facts?: { defaults: {...}, [option]: {...} }  // multi-fact mapping
  options?: BlobOption[]
  options_ref?: string             // ref to constants group
  show_when?: BlobCondition
  hide_when?: BlobCondition
  unknowable?: boolean
  enabled: boolean
}
```

## Rules — `BlobRule[]` (array, index matters!)
```ts
BlobRule = {
  sets: string           // fact ID being set
  value: boolean|string  // value to set ("not_applicable" = constraint)
  source: "general"|"hotspot"
  when: BlobCondition
  enabled: boolean
}
```
- `value === true` + `!core` = derivation rule
- `value === false` or `"not_applicable"` = constraint rule

## Constants — `Record<string, BlobConstantValue[]>`
```ts
BlobConstantValue = { id: number, name: string, label?: string, description: string|null, enabled: boolean }
```
Groups: industries, building_types, sizes, etc. Referenced by `values_ref`/`options_ref`.

## Action Conditions — `Record<string, BlobActionCondition>`
```ts
BlobActionCondition = {
  enabled: boolean
  include_when: BlobCondition
  exclude_when: BlobCondition
  dismiss_options?: BlobDismissOption[]
}
```

## Conditions
```ts
SimpleCondition = Record<string, string|boolean|number|number[]|string[]>  // implicit AND
AnyCondition = { any: SimpleCondition[] }                                   // OR
BlobCondition = SimpleCondition | AnyCondition
```

## Enriched Types (computed, not stored)
```ts
EnrichedFact = BlobFact + { id, category, relationships: {
  setByQuestion?, derivedFrom?, constrainedBy[], actionCount
}}

ThreadNode = { question (with index), children: ThreadNode[], parentFact?, conditionallyHidden }
```

## Fact Categories (8 categories, auto-assigned by ID pattern)
company-profile, buildings-energy, transport-travel, supply-chain,
products, investments, engagement-priorities, ghg-relevance

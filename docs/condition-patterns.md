# Condition Patterns in Data Files

Analysis of all condition usage across `../facts/data/` JSON files. Total: **769 conditions**.

## Pattern Types

### 1. Simple Boolean — `{ key: true }` or `{ key: false }`

- **50 instances** (49 true, 1 false)
- Used in: questions, general_rules, hotspot_rules
- Example: `{ "owns_buildings": true }`

### 2. String Value — `{ key: "not_applicable" }`

- **13 instances**, only in questions.json `hide_when`
- The only string value used across all conditions is `"not_applicable"`
- Example: `{ "scope_1_mobile_relevant": "not_applicable" }`

### 3. Array / Contains — `{ key: ["val1", "val2"] }`

- **38 instances**
- Used in: hotspot_rules, actions
- Array sizes range from 1 to 95 items; `industries` arrays can be very large
- Example: `{ "size": ["Small", "Medium", "Enterprise"] }`

### 4. Explicit OR — `{ any: [{...}, {...}] }`

- **7 instances**
- Used in: questions, general_rules
- Sub-conditions inside `any` are always flat single-key conditions
- Example:
  ```json
  { "any": [{ "owns_buildings": true }, { "leases_buildings": true }] }
  ```

### 5. Multi-Key AND — `{ key1: val, key2: val, key3: val }`

- **661 instances** (86% of all conditions)
- Used in: **actions.json only** (`include_when`)
- Typically 2–3 keys: `size` (array) + `industries` (array) + a boolean fact
- Example:
  ```json
  {
    "industries": ["Food Retail", "Brewers"],
    "size": ["Small", "Medium"],
    "uses_buildings": true
  }
  ```

### 6. `any_of` Operator — `{ ..., any_of: ["fact1", "fact2"] }`

- **97 instances**, actions.json only
- Contains **fact names as strings** (not condition objects)
- Semantics: (other conditions) AND (any of these facts are true)
- Example:
  ```json
  {
    "industries": ["Leisure Products"],
    "size": ["Small", "Medium", "Enterprise", "Large Enterprise"],
    "any_of": ["cat_11_relevant", "cat_12_relevant"]
  }
  ```

## Usage by File

| File | Fields | Non-empty | Patterns |
|------|--------|-----------|----------|
| questions.json | show_when (5), hide_when (13) | 18 | Simple bool, string `"not_applicable"`, explicit OR |
| general_rules.json | when | 23 | Simple bool, explicit OR |
| hotspot_rules.json | when | 12 | Array contains |
| actions.json | include_when | 108 | Multi-key AND, any_of, array, bool |

Notes:
- 608 actions have empty `include_when: {}` (apply to everyone)
- All 716 actions have empty `exclude_when: {}` (feature exists but is unused)

## Most Used Condition Keys

| Key | Count | Value Type |
|-----|-------|-----------|
| `size` | 586 | Array of 6 business sizes |
| `industries` | 446 | Array from 190 unique industry names |
| `cat_*_relevant` | ~300 combined | Boolean relevance flags |
| `uses_buildings` | 80 | Boolean |
| `interested_in_*` | ~50 combined | Boolean preference flags |

## Current Editor Coverage

The `ConditionEditor` component (`components/facts/condition-editor.tsx`) supports:
- ✅ Simple boolean (true/false)
- ✅ String value ("not_applicable")
- ✅ Array contains (tag input)
- ✅ Explicit OR (`any` wrapper)
- ❌ Multi-key AND (needed for Actions CRUD)
- ❌ `any_of` operator (needed for Actions CRUD)

# Giki Admin — Required API Endpoints

## Facts

**`GET /api/facts`** — Returns all facts with their relationships (question, rules, action count), grouped by category.

```json
[
  {
    "key": "transport-travel",
    "label": "Transport & Travel",
    "facts": [
      {
        "id": "has_company_vehicles",
        "type": "boolean_state",
        "core": true,
        "values_ref": null,
        "category": "transport-travel",
        "relationships": {
          "set_by_question": { "index": 9, "label": "Does your company own or lease any vehicles?" },
          "derived_from": null,
          "constrained_by": [
            { "sets": "has_company_vehicles", "value": false, "when": { "remote_only": true } }
          ],
          "action_count": 23
        }
      }
    ]
  }
]
```

**`GET /api/facts/:id`** — Returns a single enriched fact by ID (same shape as above, without the category wrapper).

```json
{
  "id": "has_company_vehicles",
  "type": "boolean_state",
  "core": true,
  "values_ref": null,
  "category": "transport-travel",
  "relationships": {
    "set_by_question": { "index": 9, "label": "Does your company own or lease any vehicles?" },
    "derived_from": null,
    "constrained_by": [
      { "sets": "has_company_vehicles", "value": false, "when": { "remote_only": true } }
    ],
    "action_count": 23
  }
}
```

**`POST /api/facts`** — Creates a new fact.

```json
{
  "id": "my_new_fact",
  "type": "boolean_state",
  "core": true,
  "values_ref": null
}
```

**`PATCH /api/facts/:id`** — Updates a fact's properties (type, core, values_ref).

```json
{
  "type": "enum",
  "core": false,
  "values_ref": "BUSINESS_SIZE_OPTIONS"
}
```

**`DELETE /api/facts/:id`** — Deletes a fact and its associated rules.

## Rules (scoped to a fact)

**`GET /api/facts/:id/rules`** — Returns all rules that set this fact.

```json
[
  {
    "sets": "has_company_vehicles",
    "value": false,
    "when": { "remote_only": true }
  },
  {
    "sets": "has_company_vehicles",
    "value": "not_applicable",
    "when": { "industries": ["Advertising", "Interactive Media & Services"] }
  }
]
```

`when` has 3 possible shapes:
- Simple boolean: `{ "remote_only": true }`
- Array match: `{ "industries": ["Advertising", "Interactive Media & Services"] }`
- Any-of (OR): `{ "any": [{ "owns_buildings": true }, { "leases_buildings": true }] }`

**`POST /api/facts/:id/rules`** — Adds a rule. Body is a single rule object (same shape as above).

**`PATCH /api/facts/:id/rules/:index`** — Updates a rule by its index within this fact's rules.

**`DELETE /api/facts/:id/rules/:index`** — Deletes a rule by index.

## Questions

**`GET /api/questions`** — Returns the ordered list of questions.

```json
[
  {
    "index": 0,
    "type": "multi-select",
    "label": "What is your primary sector?",
    "description": "Your industry sector helps us tailor...",
    "fact": "industries",
    "options_ref": "INDUSTRY_OPTIONS",
    "show_when": null,
    "hide_when": null
  },
  {
    "index": 5,
    "type": "checkbox-radio-hybrid",
    "label": "Which of these apply to your company? Select all that apply.",
    "description": "This helps us provide more relevant actions.",
    "options": [
      { "label": "We own our buildings", "value": "own_buildings" },
      { "label": "We rent or lease our buildings", "value": "lease_buildings" },
      { "label": "Not sure", "value": "not_sure", "exclusive": true },
      { "label": "Only work from home / co-working space", "value": "remote_only", "exclusive": true }
    ],
    "facts": {
      "defaults": { "owns_buildings": false, "leases_buildings": false, "remote_only": false },
      "own_buildings": { "owns_buildings": true },
      "lease_buildings": { "leases_buildings": true },
      "remote_only": { "remote_only": true }
    },
    "show_when": null,
    "hide_when": null
  }
]
```

There are 4 question types:
- `boolean_state` — yes/no, sets a single `fact`
- `single-select` — one choice from `options_ref` (a constants group), sets a single `fact`
- `multi-select` — multiple choices from `options_ref`, sets a single `fact` (array type)
- `checkbox-radio-hybrid` — inline `options` with `exclusive` flags, sets multiple facts via the `facts` map

A question links to facts in one of two ways:
- `fact`: string — sets a single fact directly (used by boolean_state, single-select, multi-select)
- `facts`: object — maps option values to fact assignments (used by checkbox-radio-hybrid). Contains a `defaults` key for reset values.

`show_when` / `hide_when` use the same `Condition` shape as rules (see Rules section).

**`GET /api/questions/:index`** — Returns a single question by its index.

**`POST /api/questions`** — Creates a new question (appended to end of list).

```json
{
  "type": "boolean_state",
  "label": "Does your company have a sustainability policy?",
  "description": "Optional description text.",
  "fact": "has_sustainability_policy",
  "show_when": null,
  "hide_when": null
}
```

**`PATCH /api/questions/:index`** — Updates a question at the given index.

```json
{
  "label": "Updated question text?",
  "description": "Updated description.",
  "hide_when": { "cat_1_relevant": "not_applicable" }
}
```

**`DELETE /api/questions/:index`** — Deletes a question by index.

**`PATCH /api/questions/reorder`** — Reorders questions. Body is the new ordered list of indices.

```json
{ "order": [0, 2, 1, 3, 4] }
```

## Constants (enum value lists)

**`GET /api/constants`** — Returns all constant groups.

```json
[
  { "name": "BUSINESS_SIZE_OPTIONS", "values": ["Self Employed", "Micro", "Small", "Medium", "Enterprise", "Large Enterprise"] },
  { "name": "INDUSTRY_OPTIONS", "values": [{ "label": "Advertising", "value": "Advertising" }] }
]
```

**`POST /api/constants`** — Creates a new constant group.

```json
{ "name": "MY_OPTIONS", "value_type": "string" }
```

**`DELETE /api/constants/:name`** — Deletes a constant group.

**`POST /api/constants/:name/values`** — Adds a value to a group.

```json
{ "value": "New Option" }
```
or for label-value:
```json
{ "value": { "label": "Display Name", "value": "internal_key" } }
```

**`PATCH /api/constants/:name/values/:index`** — Updates a value at index.

**`DELETE /api/constants/:name/values/:index`** — Deletes a value at index.

## Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/facts` | All facts with relationships, grouped by category |
| GET | `/api/facts/:id` | Single fact with relationships |
| POST | `/api/facts` | Create a fact |
| PATCH | `/api/facts/:id` | Update a fact |
| DELETE | `/api/facts/:id` | Delete fact + its rules |
| GET | `/api/facts/:id/rules` | Rules that set this fact |
| POST | `/api/facts/:id/rules` | Add a rule |
| PATCH | `/api/facts/:id/rules/:index` | Update a rule |
| DELETE | `/api/facts/:id/rules/:index` | Delete a rule |
| GET | `/api/questions` | All questions, ordered |
| GET | `/api/questions/:index` | Single question by index |
| POST | `/api/questions` | Create a question |
| PATCH | `/api/questions/:index` | Update a question |
| DELETE | `/api/questions/:index` | Delete a question |
| PATCH | `/api/questions/reorder` | Reorder questions |
| GET | `/api/constants` | All constant groups |
| POST | `/api/constants` | Create a constant group |
| DELETE | `/api/constants/:name` | Delete a constant group |
| POST | `/api/constants/:name/values` | Add value to group |
| PATCH | `/api/constants/:name/values/:index` | Update a value |
| DELETE | `/api/constants/:name/values/:index` | Delete a value |

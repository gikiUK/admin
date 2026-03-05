# Facts

Facts are the building blocks of the engine - named pieces of knowledge about a business. Everything else (questions, rules, actions) either sets facts, reads facts, or depends on facts.

## The Facts List

Facts are grouped by category. You can search by ID, or filter by type and whether a fact is core or derived.

Click any fact to open its detail page.

## Core vs Derived

Every fact is one of two kinds:

- **Core** - set directly by the user answering a question. The user's answer determines the value.
- **Derived** - calculated automatically by rules, based on other facts. The user never sets these directly.

## Fact Types

- **boolean_state** - true or false. The most common type. Example: does the company own buildings?
- **enum** - one value from a fixed list. Example: business size (Small, Medium, Enterprise).
- **array** - multiple values from a fixed list. Example: industries (a company can be in several).

For `enum` and `array` facts, you select a **constants group** (via the Values ref field) that defines what the allowed values are. This keeps the fact and its related question options in sync - both pull from the same list.

## Editing a Fact

On the fact detail page you can change the type and kind, and set or clear the values ref. The fact ID cannot be changed after creation, since other parts of the dataset reference it by that ID.

The detail page also shows:
- **Questions** that set this fact
- **Rules** that set or read this fact
- **How many actions** depend on this fact

This gives you an at-a-glance view of how connected a fact is before you make changes.

## Disabling a Fact

Disabling a fact marks it as inactive - it stays in the dataset but is treated as if it doesn't exist. Use this instead of deleting, so that the history of changes is preserved. Disabled facts appear faded in the list.

## Creating a Fact

Click **New Fact** in the top-right. You'll need to provide:
- **ID** - a unique identifier in snake_case (e.g. `owns_buildings`). This cannot be changed later.
- **Type** - boolean_state, enum, or array.
- **Kind** - core or derived.
- **Values ref** - required for enum and array types; pick the constants group for allowed values.

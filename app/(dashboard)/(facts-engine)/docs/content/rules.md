# Rules

Rules derive new fact values automatically from existing ones. They run after a user answers questions, filling in facts that don't need to be asked directly.

## What Rules Do

A rule says: "when these conditions are true, set this fact to this value."

For example: "when a company owns buildings OR leases buildings, set `uses_buildings` to true." The user never gets asked whether they "use" buildings - the engine works it out from their other answers.

Rules only apply to **derived** facts. Core facts are always set by questions, never by rules.

## Rule Values

Each rule sets a fact to one of three values:

- **true** - the fact applies to this business
- **false** - the fact does not apply
- **not applicable** - the fact is irrelevant to this business entirely. This also hides related questions from the user.

## General vs Hotspot

Rules come in two types:

- **General** - apply broadly, based on simple yes/no facts. Example: "uses buildings if owns or leases buildings."
- **Hotspot** - target specific industries or business sizes. Example: "Scope 3 category 11 is relevant if the business is in Leisure Products."

## Order Matters

Rules are applied in the order they appear in the list. When multiple rules set the same fact, the last matching rule wins. More specific rules (hotspot rules) should come after general ones so they can override the default.

## The Rules List

You can search by the fact a rule sets, and filter by type (general / hotspot) or status (enabled / disabled).

## Editing Rules

Rules are typically edited from the **fact detail page** - scroll down to the rules section for a specific fact. You can change the value, source type, and condition, or disable individual rules.

You can also add a new rule for a fact directly from that same page.

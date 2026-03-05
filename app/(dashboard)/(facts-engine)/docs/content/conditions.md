# Conditions

Conditions control when things apply - when a question is shown, when a rule fires, when an action is included. They're expressions that test the current state of a business's facts.

## How Conditions Work

A condition checks one or more facts against expected values. If all the checks pass, the condition is met.

Examples:
- "owns_buildings is true" - only matches businesses that own buildings
- "size is Small or Medium" - matches any business of those sizes
- "scope_1_relevant is not applicable" - matches when that fact has been ruled out

## AND Logic

When a condition checks multiple facts, **all of them must match**. For example:

> owns_buildings is true AND size is Small

Only matches a small business that owns buildings.

## OR Logic

You can also say "any of these must match" using OR logic. For example:

> owns_buildings is true OR leases_buildings is true

Matches a business that owns buildings, leases buildings, or both.

## Where Conditions Are Used

- **Questions** - `show_when` and `hide_when` use conditions to control visibility
- **Rules** - each rule has a `when` condition that determines when it fires
- **Actions** - `include_when` and `exclude_when` use conditions to target the right businesses

## The Condition Builder

The condition builder in question and rule editors lets you add fact checks one at a time. For each check you pick the fact, then the value to match. You can switch between AND and OR logic using the selector at the top.

Keep conditions as simple as possible - the [Analysis](/data/analysis) page will flag conditions that can never be met or that conflict with other rules.

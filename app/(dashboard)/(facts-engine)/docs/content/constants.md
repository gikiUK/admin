# Constants

Constants are reusable lists of values - things like industry names, business sizes, or building types. Facts and questions both reference these lists instead of each defining their own, so everything stays in sync.

## The Constants List

Each constants group is shown as a collapsible card. You can search within a group, and filter to show all values, only enabled, or only disabled.

## Values

Each value in a group has:

- **Name** - the internal identifier used in conditions and data matching (e.g. `"Food Retail"`). This is what gets stored when a user selects this option.
- **Label** - optional display text shown to users. If not set, the name is shown instead.
- **Description** - optional explanatory text.

Click any value to edit it. You can also enable or disable individual values using the eye icon on each pill.

## Disabling a Value

Disabling a value removes it from question options and marks it inactive - existing data that references it is unaffected, but users won't be able to select it going forward.

## Adding a Value

Click **Add value** within any group to add a new entry. At minimum you need a name.

## How Constants Are Used

- **Facts** reference a constants group via `values_ref` - this defines what values that fact is allowed to hold
- **Questions** reference a constants group via `options_ref` - this defines what options appear in the dropdown or selector

When a fact and its question both point to the same constants group, their options and allowed values stay automatically in sync. If you add or remove a value from the constants group, both the fact and the question update at once.

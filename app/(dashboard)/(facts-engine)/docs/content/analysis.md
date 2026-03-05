# Analysis

The [Analysis page](/data/analysis) automatically checks the dataset for problems and reports them in real time. It updates as you edit, so you always have an up-to-date picture of the dataset's health.

## Severities

- **Error** - something is broken. Fix these before publishing.
- **Warning** - something looks suspicious, but may be intentional. Review and decide whether action is needed.

## The 6 Checks

### Dead Facts

Finds facts that are defined but never referenced anywhere - no question sets them, no rule reads them, no action depends on them. These are harmless but add noise. If a fact is genuinely unused, consider disabling it.

### Undefined References

Finds places in the dataset that reference a fact ID or value that doesn't exist. For example, a rule that checks `typo_fact` when no fact with that ID exists, or a condition that uses a value not in the fact's constants group. These are always errors - they mean something is pointing at nothing.

### Contradictory Rules

Finds pairs of rules that set the same fact to different values and could both fire for the same business. For example, one rule sets a fact to `true` when a company owns buildings, and another sets it to `false` when the company is small - a small company that owns buildings would trigger both. These are errors that need resolving before the data makes sense.

### Unreachable Questions

Finds questions that will never be shown to any user. This happens when a `show_when` condition can never be satisfied given the rest of the dataset, or when a `hide_when` condition is always true. Usually a warning - may indicate a condition was set up incorrectly.

### Unreachable Actions

Same idea as unreachable questions, but for actions. Finds actions whose `include_when` condition can never be satisfied, meaning the action would never be shown to anyone.

### Include/Exclude Overlap

Finds actions where the `include_when` and `exclude_when` conditions can both be true at the same time for the same business. When this happens, the action would simultaneously be included and excluded - ambiguous behaviour that needs resolving.

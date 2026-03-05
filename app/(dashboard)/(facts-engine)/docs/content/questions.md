# Questions

Questions are what users answer in the Giki questionnaire. Each question sets one or more facts based on the user's response.

## The Questions List

Questions are shown in order - the order matters, as later questions can depend on facts set by earlier ones. You can search by label or filter by type.

Click any question to edit it.

## Question Types

- **boolean_state** - a Yes/No question. Sets a single true/false fact.
- **single-select** - pick one option from a list. Sets a fact to the chosen value.
- **multi-select** - pick multiple options from a list. Sets an array fact.
- **checkbox-radio-hybrid** - a mixed list where some options are mutually exclusive (like radio buttons) and others can be combined (like checkboxes). Used when one question needs to set multiple different facts at once.

## Options

For single-select and multi-select questions, options come from a **constants group** (set via the Options ref field). This keeps the available options in sync with the fact's allowed values - they both reference the same list.

For checkbox-radio-hybrid questions, you define the options directly in the question and map each option to the fact values it should set.

## Conditional Visibility

You can control when a question is shown using:

- **Show when** - the question only appears when a condition is met. Use this to show a follow-up question only when it's relevant.
- **Hide when** - the question is hidden when a condition is met. Typically used to hide questions when a related fact is marked as not applicable.

When a question is hidden, the user doesn't see it and its fact values stay unknown.

See [Conditions](/docs/conditions) for how to build condition expressions.

## Unknowable

If a question is marked **Unknowable**, the user gets an extra "I don't know" option. Use this for questions where the user may genuinely not have the information - for example, detailed energy or emissions data.

## Editing a Question

Changes save automatically. You can change the label, description, type, fact mapping, options, and visibility conditions at any time.

Disabling a question removes it from the questionnaire without deleting it. The question stays in the dataset and can be re-enabled.

## Creating a Question

Click **New Question**. At minimum you need a label. Once you've set the type, you'll be able to configure the fact it sets, options, and any conditions.

# How It Works

## The Big Picture

The Facts Engine is where you manage the logic that turns a company's questionnaire answers into personalised climate actions. Everything flows in one direction:

```
Questions  →  Facts  →  Rules  →  Actions
```

1. A user answers **questions** about their business
2. Their answers are stored as **facts** - pieces of knowledge about the business
3. **Rules** derive additional facts automatically (e.g. "if a company owns or leases buildings, they use buildings")
4. **Actions** are shown to the user based on which facts apply to them

Every section of the data menu manages one layer of this pipeline.

## Draft and Live

The dataset has two versions at all times:

- **Live** - what users of the Giki product currently see
- **Draft** - your in-progress changes, only visible to you in this admin

As soon as you make your first edit, a draft is created automatically. You can keep editing - changes save automatically as you go. When you're ready, publish the draft to make it live.

You can also discard the draft at any time to revert to the current live version.

## The Status Bar

At the top of every page you'll see the current dataset status:

- **Live** (green pill) - you're viewing the published dataset, not editing
- **Draft** (amber pill) - you have unpublished changes in progress

When in draft mode, the status bar also shows:
- A save indicator (syncing / synced / failed)
- A **Review changes** button - shows a full diff of everything you've changed, with the option to revert individual fields or publish
- A **Discard draft** button - reverts everything back to live
- A **History** button - opens a timeline of every edit you've made this session, with undo/redo

## Analysis

The [Analysis](/data/analysis) page runs automated checks on the dataset and highlights problems. It updates in real time as you edit. Check it before publishing - it will catch things like broken references, unreachable questions, and conflicting rules.

Issues come in two severities:
- **Error** - something is broken and should be fixed before publishing
- **Warning** - something looks suspicious but may be intentional

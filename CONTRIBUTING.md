# How we work

Everything goes through this repo. The history of commits, pull requests, and issues is our proof of collaboration and our dated record of the project, so please do your work here rather than sending files over chat.

## You don't need to install anything

Bryce and Adrian can do everything on the GitHub website:

1. Open the file you want to change (e.g. `game/data/room-1.json`) and click the pencil icon.
2. Make your changes.
3. Click **Commit changes…**, choose **Create a new branch and start a pull request**, and give it a short name like `room-1-puzzles`.
4. On the next page, click **Create pull request**.

To add images or audio, open the folder (e.g. `game/assets/images/`), click **Add file → Upload files**, and again choose **Create a new branch and start a pull request**.

## Reviews

- **Puzzles** (`game/data/*.json`): a pull request needs approval from a member who did not write it. That member re-solves every Puzzle and reads every `whyWrong`, Hint, and Explanation against the course materials. This is the two-member mathematical check from our proposal.
- **Game code**: Joshua may merge his own pull requests, but should ask for a quick look when a change affects how Puzzles appear.
- **Art and audio**: Adrian merges their own; any file not 100% ours needs a line in `game/assets/CREDITS.md` first.

A green check on a pull request means the Puzzle files are well-formed. It does not mean the mathematics is right; that's what the human review is for.

## Issues and milestones

- Every task is a GitHub issue under the **Progress report** or **Final submission** milestone. The owner is named in the issue.
- Comment on your issue when you start, get stuck, or finish.
- **Meetings**: open an issue titled `Meeting YYYY-MM-DD` with who attended, what was decided, and who does what next. Attach a photo or screenshot if there is one. These become our meeting records.

## Words

Use the terms in [GLOSSARY.md](GLOSSARY.md): Room (not "level"), Puzzle, Option, Distractor, Hint, Explanation.

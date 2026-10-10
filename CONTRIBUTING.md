# Adding cards

Anyone can add support for a mod: open a pull request with the cards of its NPCs.

## Where
- Vanilla Skyrim NPCs: `vanilla/<name>.json`
- NPCs of a mod: `mods/<Plugin.esp>/<npc>.json`; the folder name is the plugin file name, e.g. `mods/3DNPC.esp/`.

## Format
Copy [`templates/mod-card.json`](templates/mod-card.json). Required: `name`, `personality`, `facts`.
For mod cards also set `plugin` and `editorId` (the NPC record's EditorID, so the card finds the right character even if several share a name).

Limits (checked automatically, and again by the app before it uses a card):
- `name` up to 80 characters; `personality` up to 1500; at most 30 `facts` of up to 300 characters; no control characters.
- No text that tries to instruct the model ("ignore previous instructions", "you are now ..."). Cards are data about a character.
- English.

## Rules
- Write the text yourself, from the mod's description, its dialogue or what you see in the game. **Do not paste text from other sites** (wikis, Nexus pages, guides) unless its license allows it and you name it in `source`; wiki text is CC BY-SA and must keep its attribution.
- Only what the character could know. No spoilers about the player's choices, no rules for the model.
- Nothing about real people, no hate, no sexual content involving minors. Adult mods are fine when the card stays factual.
- By opening a pull request you agree that your cards are published under [CC BY-SA 3.0](LICENSE) with attribution to the contributors (git history).

## Check before you open the PR
`node scripts/validate.mjs` (Node 20+) runs the same checks as the pull request check.

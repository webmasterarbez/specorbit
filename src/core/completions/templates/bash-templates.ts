/**
 * Static template strings for Bash completion scripts.
 * These are Bash-specific helper functions that never change.
 */

export const BASH_DYNAMIC_HELPERS = `# Dynamic completion helpers

_specorbit_complete_changes() {
  local changes
  changes=$(specorbit __complete changes 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$changes" -- "$cur"))
}

_specorbit_complete_specs() {
  local specs
  specs=$(specorbit __complete specs 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$specs" -- "$cur"))
}

_specorbit_complete_items() {
  local items
  items=$(specorbit __complete changes 2>/dev/null | cut -f1; specorbit __complete specs 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$items" -- "$cur"))
}

_specorbit_complete_schemas() {
  local schemas
  schemas=$(specorbit __complete schemas 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$schemas" -- "$cur"))
}`;

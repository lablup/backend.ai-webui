#!/bin/bash

# Simple JSON merge driver using jq
# Usage: i18n-json-merge.sh %O %A %B %A
# %O = ancestor's version
# %A = current version (ours)
# %B = other branch's version (theirs)
# %A = output file (same as current version)

BASE_FILE="$1"
LOCAL_FILE="$2"
REMOTE_FILE="$3"
MERGED_FILE="$4"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq to use this merge driver." >&2
    echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)" >&2
    exit 1
fi

# Perform 3-way merge using jq
# Strategy: Properly merge changes from both sides
# jq will handle JSON structure and commas automatically
jq -s '
  # cSpell:ignore deepmerge
  def deepmerge(base; local; remote):
    # Start with remote as base
    remote as $result |
    
    # Process each key from all three versions
    (base | keys) + (local | keys) + (remote | keys) | unique | reduce .[] as $key ($result;
      # Get values from each version
      base[$key] as $base_val |
      local[$key] as $local_val |
      remote[$key] as $remote_val |
      
      # If all three are objects, recursively merge
      if ($base_val | type) == "object" and ($local_val | type) == "object" and ($remote_val | type) == "object" then
        .[$key] = deepmerge($base_val; $local_val; $remote_val)
      
      # If local and remote are both objects but base is not (new object added)
      elif ($base_val == null) and ($local_val | type) == "object" and ($remote_val | type) == "object" then
        # Merge the two new objects
        .[$key] = ($local_val * $remote_val)
      
      # If values are the same in local and remote, use that value
      elif $local_val == $remote_val then
        if $local_val != null then
          .[$key] = $local_val
        else
          . = . | del(.[$key])
        end
      
      # If only local changed from base
      elif $base_val == $remote_val then
        if $local_val != null then
          .[$key] = $local_val
        else
          . = . | del(.[$key])
        end
      
      # If only remote changed from base
      elif $base_val == $local_val then
        if $remote_val != null then
          .[$key] = $remote_val
        else
          . = . | del(.[$key])
        end
      
      # Both changed differently - this is a real conflict
      # For now, prefer local (you could also mark this as conflict)
      else
        .[$key] = $local_val
      end
    );
  
  # Get the three versions
  . as [$base, $local, $remote] |
  
  # Perform the 3-way merge
  deepmerge($base; $local; $remote)
' "$BASE_FILE" "$LOCAL_FILE" "$REMOTE_FILE" > "$MERGED_FILE.tmp" 2>/dev/null

# Check if merge was successful
if [ $? -eq 0 ] && [ -s "$MERGED_FILE.tmp" ]; then
    # Format the output nicely
    jq '.' "$MERGED_FILE.tmp" > "$MERGED_FILE"
    rm "$MERGED_FILE.tmp"
    
    # Check for actual value conflicts (not just additions)
    # This checks if the same leaf value was modified differently
    BASE_JSON=$(jq -r '.' "$BASE_FILE" 2>/dev/null)
    LOCAL_JSON=$(jq -r '.' "$LOCAL_FILE" 2>/dev/null)
    REMOTE_JSON=$(jq -r '.' "$REMOTE_FILE" 2>/dev/null)
    
    # Use jq to detect real conflicts (same key with different non-null values)
    CONFLICTS=$(jq -r --argjson base "$BASE_JSON" --argjson local "$LOCAL_JSON" --argjson remote "$REMOTE_JSON" '
      def find_conflicts(b; l; r; path):
        if (b | type) == "object" and (l | type) == "object" and (r | type) == "object" then
          [
            (b | keys) + (l | keys) + (r | keys) | unique[] as $key |
            find_conflicts(b[$key]; l[$key]; r[$key]; path + [$key])
          ]
        elif b != l and b != r and l != r and l != null and r != null then
          [path | join(".")]
        else
          []
        end;
      find_conflicts($base; $local; $remote; []) | flatten | unique | .[]
    ' <<< '{}' 2>/dev/null)
    
    if [ -n "$CONFLICTS" ]; then
        echo "Warning: Value conflicts detected in the following paths:" >&2
        echo "$CONFLICTS" >&2
        echo "These conflicts were auto-resolved (local version preferred)." >&2
        echo "Please review the merged result." >&2
        # Don't exit with error - the merge was successful
    fi
    
    exit 0
else
    # If jq merge failed, fall back to standard git merge
    echo "JSON merge failed, falling back to standard git merge" >&2
    rm -f "$MERGED_FILE.tmp"
    git merge-file -p "$LOCAL_FILE" "$BASE_FILE" "$REMOTE_FILE" > "$MERGED_FILE"
    exit $?
fi
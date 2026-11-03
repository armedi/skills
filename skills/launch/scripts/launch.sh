#!/bin/sh
# Creates its own worktree from the caller's HEAD; callers supply the task and launch options.
# A parentless session on the shared service survives the caller and can run subagents.
# Success confirms prompt submission, not task completion.
set -eu

usage() {
  cat >&2 <<'EOF'
usage: launch.sh --model <provider/model#variant> --title <title> [--fusion] [--repo <dir>] <prompt>
       launch.sh --sessions [--repo <dir>]
EOF
}

mode=launch
fusion=
model=
title=
repo=.
prompt=
have_prompt=
while [ $# -gt 0 ]; do
  case $1 in
    --sessions) mode=sessions ;;
    --fusion) fusion=1 ;;
    --model=*) model=${1#*=} ;;
    --title=*) title=${1#*=} ;;
    --repo=*) repo=${1#*=} ;;
    --model|--title|--repo)
      [ $# -ge 2 ] || { usage; exit 2; }
      case $1 in
        --model) model=$2 ;;
        --title) title=$2 ;;
        --repo) repo=$2 ;;
      esac
      shift ;;
    --)
      shift
      if [ $# -gt 0 ]; then
        [ $# -eq 1 ] && [ -z "$have_prompt" ] || { usage; exit 2; }
        prompt=$1
        have_prompt=1
      fi
      break ;;
    -*) usage; exit 2 ;;
    *)
      [ -z "$have_prompt" ] || { usage; exit 2; }
      prompt=$1
      have_prompt=1 ;;
  esac
  shift
done

if [ "$mode" = sessions ]; then
  [ -z "$have_prompt$fusion$model$title" ] || { usage; exit 2; }
else
  [ -n "$have_prompt" ] && [ -n "$model" ] && [ -n "$title" ] || { usage; exit 2; }
fi

command -v jq >/dev/null 2>&1 || { echo "launch.sh: jq is required" >&2; exit 1; }

repo=$(cd "$repo" && pwd -P)
repo=$(git -C "$repo" rev-parse --show-toplevel)

json() {
  jq -cn --arg value "$1" '$value'
}

worktrees=$(git -C "$repo" worktree list --porcelain -z | jq -Rsc '
  [split("\u0000")[] | select(startswith("worktree ")) | ltrimstr("worktree ")]
  | sort_by(length) | reverse
')

project=$(opencode api project.list | jq -r --arg repo "$repo" --argjson worktrees "$worktrees" '
  first(.[] | select(.canonical == $repo or (.canonical as $dir | $worktrees | index($dir))) | .id) // empty
')
[ -n "$project" ] || { echo "launch.sh: $repo is not an OpenCode project" >&2; exit 1; }

if [ "$mode" = sessions ]; then
  changed_files() {
    other=$1
    [ "$other" != "$repo" ] || { printf '[]\n'; return; }
    head=$(git -C "$other" rev-parse HEAD) || return
    base=$(git -C "$repo" merge-base HEAD "$head") || return

    # Use the shared ancestor to include committed work, then compare actual files
    # so changes already present in the caller's worktree disappear from the report.
    committed=$(git -C "$other" diff --name-only --no-renames -z "$base" HEAD | jq -Rsc 'split("\u0000")[:-1]')
    dirty=$(git -C "$other" diff --name-only --no-renames -z HEAD | jq -Rsc 'split("\u0000")[:-1]')
    untracked=$(git -C "$other" ls-files --others --exclude-standard -z | jq -Rsc 'split("\u0000")[:-1]')
    candidates=$(jq -cn --argjson committed "$committed" --argjson dirty "$dirty" --argjson untracked "$untracked" '
      ($committed + $dirty + $untracked) | unique[]
    ')
    different=$(
      printf '%s\n' "$candidates" | while IFS= read -r file_json; do
        [ -n "$file_json" ] || continue
        file=$(printf '%s' "$file_json" | jq -r '.')
        current_file=$repo/$file
        other_file=$other/$file
        if [ -e "$current_file" ] || [ -L "$current_file" ]; then
          if [ -e "$other_file" ] || [ -L "$other_file" ]; then
            if git diff --no-index --quiet --no-ext-diff --no-textconv -- "$current_file" "$other_file"; then
              continue
            else
              status=$?
              [ "$status" -eq 1 ] || exit "$status"
            fi
            change=modified
          else
            change=deleted
          fi
        elif [ ! -e "$other_file" ] && [ ! -L "$other_file" ]; then
          continue
        else
          change=added
        fi
        jq -cn --argjson path "$file_json" --arg status "$change" '{path: $path, status: $status}'
      done
    ) || return
    printf '%s\n' "$different" | jq -sc '.'
  }

  sessions='[]'
  cursor=
  while :; do
    set -- --param "project=$project"
    [ -z "$cursor" ] || set -- "$@" --param "cursor=$cursor"
    page=$(opencode api session.list "$@")
    sessions=$(printf '%s' "$page" | jq -c --argjson sessions "$sessions" '$sessions + .data')
    cursor=$(printf '%s' "$page" | jq -r '.cursor.next // empty')
    [ -n "$cursor" ] || break
  done

  active=$(opencode api session.active)
  records=$(jq -cn --argjson sessions "$sessions" --argjson active "$active" \
    --arg project "$project" --argjson worktrees "$worktrees" '
    [$sessions[] | select(.projectID == $project) | .id as $id
      | select(($active.data // {}) | has($id)) | .location.directory as $dir
      | (first($worktrees[] as $tree | select($dir == $tree or ($dir | startswith($tree + "/"))) | $tree) // null) as $tree
      | select($tree != null) | {directory: $tree, id, title: (.title // "")}] as $running
    | $worktrees[] as $directory
    | {directory: $directory, activeSessions: [$running[] | select(.directory == $directory) | {id, title}]}
  ')
  while IFS= read -r record; do
    directory=$(printf '%s' "$record" | jq -r '.directory')
    [ -d "$directory" ] || continue
    files=$(changed_files "$directory")
    printf '%s' "$record" | jq -c --argjson files "$files" '
      . + {files: $files} | select((.files | length) > 0 or (.activeSessions | length) > 0)
    '
  done <<EOF
$records
EOF
  exit 0
fi

[ -n "$fusion" ] && prompt="/fusion $prompt"

name=$(printf '%s\n' "$title" | LC_ALL=C awk '
  { text = text " " tolower($0) }
  END {
    gsub(/[^a-z0-9]+/, " ", text)
    count = split(text, words, " ")
    for (i = 1; i <= count; i++) {
      if (name != "" && length(name) + 1 + length(words[i]) > 40) break
      name = name == "" ? words[i] : name "-" words[i]
    }
    print substr(name, 1, 40)
  }
')
[ -n "$name" ] || { echo "launch.sh: title has no letters or digits" >&2; exit 2; }

provider=${model%%/*}
ref=${model#*/}
model_id=${ref%%#*}
[ "$provider" != "$model" ] && [ -n "$model_id" ] || { usage; exit 2; }
if [ "$model_id" = "$ref" ]; then
  variant=
else
  variant=",\"variant\":$(json "${ref#*#}")"
fi

# Validate before allocating: model errors otherwise surface asynchronously after success.
opencode api model.list | jq -r --arg provider "$provider" --arg model "$model_id" \
  --arg variant "$([ "$model_id" = "$ref" ] || printf '%s' "${ref#*#}")" '
  (first(.data[]? | select(.providerID == $provider and .id == $model)) // null) as $match
  | if $match == null then
      "launch.sh: model \($provider)/\($model) is not in the catalog; see `opencode models`\n"
      | halt_error(1)
    else
      [($match.variants // [])[] | .id] as $variants
      | if $variant != "" and ($variants | index($variant)) == null then
          "launch.sh: \($provider)/\($model) has no variant \($variant); it has: \(if $variants | length > 0 then $variants | join(" ") else "none" end)\n"
          | halt_error(1)
        else empty end
    end
  ' || exit 1

! git -C "$repo" show-ref --verify --quiet "refs/heads/$name" ||
  { echo "launch.sh: branch $name already exists; choose another title" >&2; exit 2; }

# Without "from", the worktree starts at the canonical checkout's HEAD, not the caller's.
# OpenCode always detaches it, so the branch is created afterwards.
worktree_json=$(opencode api worktree.create -d "{\"projectID\":$(json "$project"),\"name\":$(json "$name"),\"from\":$(json "$repo")}" || true)
worktree=$(printf '%s' "$worktree_json" | jq -r '(.data // .).directory // empty' 2>/dev/null || true)
[ -n "$worktree" ] || { echo "launch.sh: worktree.create failed${worktree_json:+: $worktree_json}" >&2; exit 1; }
if ! git -C "$worktree" switch --quiet -c "$name"; then
  opencode api worktree.remove -d "{\"projectID\":$(json "$project"),\"directory\":$(json "$worktree"),\"force\":true}" >/dev/null 2>&1 || true
  echo "launch.sh: could not create branch $name; removed worktree $worktree" >&2
  exit 1
fi
echo "worktree $worktree branch $name" >&2

session_json=$(opencode api session.create -d "{\"title\":$(json "$title"),\"model\":{\"providerID\":$(json "$provider"),\"id\":$(json "$model_id")$variant},\"location\":{\"directory\":$(json "$worktree")}}" || true)
session=$(printf '%s' "$session_json" | jq -r '(.data // .).id // empty' 2>/dev/null || true)
[ -n "$session" ] || { echo "launch.sh: session.create failed${session_json:+: $session_json}" >&2; exit 1; }

skills=
case $prompt in
  /*)
    command=${prompt%%[[:space:]]*}
    skill=${command#/}
    skills=",\"skills\":[{\"id\":$(json "$skill"),\"mention\":{\"start\":0,\"end\":${#command},\"text\":$(json "$command")}}]"
    ;;
esac

if ! opencode api session.prompt --param "sessionID=$session" -d "{\"text\":$(json "$prompt")$skills}" >/dev/null; then
  opencode api session.remove --param "sessionID=$session" >/dev/null 2>&1 || true
  opencode api worktree.remove -d "{\"projectID\":$(json "$project"),\"directory\":$(json "$worktree"),\"force\":true}" >/dev/null 2>&1 || true
  echo "launch.sh: prompt failed; removed session $session and worktree $worktree" >&2
  exit 1
fi

echo "$session"

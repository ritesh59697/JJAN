#!/usr/bin/env bash
# Pilot metrics for the GASOK Phase 3 report, read straight from GIWA Sepolia.
#
# Counts circles, members, contributions and closed rounds, and separates
# independent usage from our own demo wallets. A circle counts as "independent"
# only if neither its organizer nor any member is on the exclude list.
#
# Config (nothing hardcoded):
#   GIWA_RPC_URL         from .env (contract reads)
#   GIWA_EXPLORER_API_URL from .env (Blockscout event logs; the RPC caps log
#                        queries at 10k blocks, Blockscout does not)
#   NEXT_PUBLIC_FACTORY  from web/.env.local
#   M1, M2, M3           demo wallets from .env.demo (excluded automatically)
#   EXCLUDE              optional extra comma-separated addresses to exclude
#   FROM_BLOCK           optional; only count circles created at/after this block
#
# Usage:  scripts/pilot-metrics.sh            # human-readable table + summary
#         scripts/pilot-metrics.sh --json     # machine-readable
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Read only the named variables (never source whole env files: they hold keys).
get() { # file VAR -> value, unless already set in the environment
  local v="${!2:-}"; [ -n "$v" ] && { echo "$v"; return; }
  [ -f "$1" ] && sed -n "s/^$2=//p" "$1" | tail -1 | sed 's/[[:space:]]#.*//; s/[[:space:]]*$//' | tr -d '"'"'"'\r' || true
}
GIWA_RPC_URL="$(get "$ROOT/.env" GIWA_RPC_URL)"
GIWA_EXPLORER_API_URL="$(get "$ROOT/.env" GIWA_EXPLORER_API_URL)"
NEXT_PUBLIC_FACTORY="$(get "$ROOT/web/.env.local" NEXT_PUBLIC_FACTORY)"
M1="$(get "$ROOT/.env.demo" M1)"; M2="$(get "$ROOT/.env.demo" M2)"; M3="$(get "$ROOT/.env.demo" M3)"

RPC="${GIWA_RPC_URL:?GIWA_RPC_URL not set (.env)}"
API="${GIWA_EXPLORER_API_URL:?GIWA_EXPLORER_API_URL not set (.env)}"; API="${API%/}"
FACTORY="${NEXT_PUBLIC_FACTORY:?NEXT_PUBLIC_FACTORY not set (web/.env.local)}"
FROM_BLOCK="${FROM_BLOCK:-0}"
JSON=false; [ "${1:-}" = "--json" ] && JSON=true

lc() { tr '[:upper:]' '[:lower:]'; }
EXCL="$(printf '%s\n' "${M1:-}" "${M2:-}" "${M3:-}" ${EXCLUDE:+${EXCLUDE//,/ }} | grep -E '^0x[0-9a-fA-F]{40}$' | lc | sort -u)"
is_excl() { grep -qx "$(echo "$1" | lc)" <<<"$EXCL"; }
topic_addr() { echo "0x${1: -40}" | lc; }

# Blockscout getLogs: all logs for one address + event signature, as a JSON array.
logs() { # address from_block "Event(types)"
  local t0; t0="$(cast keccak "$3")"
  curl -fsS "$API?module=logs&action=getLogs&fromBlock=$2&toBlock=latest&address=$1&topic0=$t0" |
    jq -e 'if .status == "1" then .result elif (.message|test("No logs";"i")) then [] else error(.message) end'
}

# Organizer and creation block per circle, from the factory's CircleCreated events.
CREATED="$(logs "$FACTORY" "$FROM_BLOCK" "CircleCreated(address,address,uint256)")"

rows=()
all_members=""
indep_circles=0; indep_contrib=0; indep_closed=0; indep_finished=0
total_contrib=0; total_closed=0

while IFS=$'\t' read -r t1 t2 blk; do
  [ -z "$t1" ] && continue
  circle="$(topic_addr "$t1")"; org="$(topic_addr "$t2")"; blk=$((blk))
  members="$(cast call "$circle" "members()(address[])" --rpc-url "$RPC" | tr -d '[] ' | tr ',' '\n' | lc)"
  started="$(cast call "$circle" "started()(bool)" --rpc-url "$RPC")"
  finished="$(cast call "$circle" "finished()(bool)" --rpc-url "$RPC")"
  contrib="$(logs "$circle" "$blk" "Contributed(address,uint256)" | jq length)"
  closed="$(logs "$circle" "$blk" "RoundClosed(uint256,address,uint256)" | jq length)"

  indep=true
  is_excl "$org" && indep=false
  for m in $members; do is_excl "$m" && indep=false; done
  [ "$started" = true ] || indep=false
  # Real participants: addresses that actually joined or contributed.
  actors="$( { logs "$circle" "$blk" "Joined(address)"; logs "$circle" "$blk" "Contributed(address,uint256)"; } |
    jq -rs 'add | .[].topics[1] | "0x" + .[26:]' | lc | sort -u)"
  for m in $actors; do is_excl "$m" || all_members+="$m"$'\n'; done

  n=$(grep -c . <<<"$members"); joined=$(grep -c . <<<"$actors" || true)
  total_contrib=$((total_contrib + contrib)); total_closed=$((total_closed + closed))
  if $indep; then
    indep_circles=$((indep_circles + 1)); indep_contrib=$((indep_contrib + contrib))
    indep_closed=$((indep_closed + closed)); [ "$finished" = true ] && indep_finished=$((indep_finished + 1))
  fi
  rows+=("$(jq -nc --arg c "$circle" --arg o "$org" --argjson b "$blk" --argjson n "$n" --argjson j "$joined" \
    --argjson s "$started" --argjson f "$finished" --argjson ct "$contrib" --argjson cl "$closed" \
    --argjson i "$indep" '{circle:$c,organizer:$o,block:$b,invited:$n,participants:$j,started:$s,finished:$f,contributions:$ct,roundsClosed:$cl,independent:$i}')")
done < <(jq -r '.[] | [.topics[1], .topics[2], .blockNumber] | @tsv' <<<"$CREATED")

uniq_ext=$(printf '%s' "$all_members" | sort -u | grep -c . || true)
summary="$(jq -nc --argjson total "${#rows[@]}" --argjson ic "$indep_circles" --argjson if "$indep_finished" \
  --argjson ict "$indep_contrib" --argjson icl "$indep_closed" --argjson tct "$total_contrib" \
  --argjson tcl "$total_closed" --argjson um "$uniq_ext" --argjson fb "$FROM_BLOCK" \
  --arg block "$(cast block-number --rpc-url "$RPC")" \
  '{asOfBlock:($block|tonumber),fromBlock:$fb,circlesTotal:$total,circlesIndependent:$ic,independentFinished:$if,independentContributions:$ict,independentRoundsClosed:$icl,contributionsTotal:$tct,roundsClosedTotal:$tcl,uniqueNonDemoParticipants:$um}')"

if $JSON; then
  printf '%s\n' "${rows[@]:-}" | jq -s --argjson s "$summary" '{summary:$s,circles:map(select(. != null))}'
else
  printf '%-44s %-8s %-4s %-5s %-7s %-8s %-7s %-6s %s\n' CIRCLE BLOCK INV PART STARTED FINISHED CONTRIB CLOSED INDEPENDENT
  for r in "${rows[@]:-}"; do
    [ -z "$r" ] && continue
    jq -r '[.circle,.block,.invited,.participants,.started,.finished,.contributions,.roundsClosed,.independent]|@tsv' <<<"$r" |
      awk -F'\t' '{printf "%-44s %-8s %-4s %-5s %-7s %-8s %-7s %-6s %s\n",$1,$2,$3,$4,$5,$6,$7,$8,$9}'
  done
  echo; jq . <<<"$summary"
fi

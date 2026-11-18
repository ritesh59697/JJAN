#!/usr/bin/env bash
# Top up pilot testers with a little GIWA Sepolia ETH for gas, from the deployer
# wallet (PRIVATE_KEY in .env). Testnet only.
#
# Dry run by default: prints the plan, the deployer balance, and roughly how many
# transactions the top-up covers, priced from a real recent Jjan transaction
# (L2 gas + L1 data fee). Nothing is sent without --yes.
#
# Config (nothing hardcoded):
#   PRIVATE_KEY, GIWA_RPC_URL, GIWA_EXPLORER_API_URL   from .env
#   NEXT_PUBLIC_FACTORY                                from web/.env.local
#   FUND_AMOUNT_ETH or --amount <eth>                  per-tester top-up (required)
#
# Usage:  scripts/fund-testers.sh --amount 0.0001 0xabc... 0xdef...
#         scripts/fund-testers.sh --amount 0.0001 --yes 0xabc... 0xdef...
# Testers who already hold at least the amount are skipped.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Read only the named variables (never source whole env files).
get() { # file VAR -> value, unless already set in the environment
  local v="${!2:-}"; [ -n "$v" ] && { echo "$v"; return; }
  [ -f "$1" ] && sed -n "s/^$2=//p" "$1" | tail -1 | sed 's/[[:space:]]#.*//; s/[[:space:]]*$//' | tr -d '"'"'"'\r' || true
}
GIWA_RPC_URL="$(get "$ROOT/.env" GIWA_RPC_URL)"
GIWA_EXPLORER_API_URL="$(get "$ROOT/.env" GIWA_EXPLORER_API_URL)"
PRIVATE_KEY="$(get "$ROOT/.env" PRIVATE_KEY)"
NEXT_PUBLIC_FACTORY="$(get "$ROOT/web/.env.local" NEXT_PUBLIC_FACTORY)"

RPC="${GIWA_RPC_URL:?GIWA_RPC_URL not set (.env)}"
API="${GIWA_EXPLORER_API_URL:?GIWA_EXPLORER_API_URL not set (.env)}"; API="${API%/}"
FACTORY="${NEXT_PUBLIC_FACTORY:?NEXT_PUBLIC_FACTORY not set (web/.env.local)}"
: "${PRIVATE_KEY:?PRIVATE_KEY not set (.env)}"

AMOUNT="${FUND_AMOUNT_ETH:-}"; SEND=false; TESTERS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --amount) AMOUNT="$2"; shift 2 ;;
    --yes) SEND=true; shift ;;
    0x*) [[ "$1" =~ ^0x[0-9a-fA-F]{40}$ ]] || { echo "bad address: $1" >&2; exit 1; }; TESTERS+=("$1"); shift ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done
[ -n "$AMOUNT" ] || { echo "set --amount <eth> or FUND_AMOUNT_ETH" >&2; exit 1; }
[ ${#TESTERS[@]} -gt 0 ] || { echo "pass at least one tester address" >&2; exit 1; }

AMOUNT_WEI="$(cast to-wei "$AMOUNT" ether)"
FROM="$(cast wallet address --private-key "$PRIVATE_KEY")"
BAL="$(cast balance "$FROM" --rpc-url "$RPC")"

# Price one typical action from the newest circle's most recent tx receipt.
NEWEST="$(curl -fsS "$API?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=$FACTORY&topic0=$(cast keccak 'CircleCreated(address,address,uint256)')" |
  jq -r '.result[-1].transactionHash')"
RCPT="$(cast receipt "$NEWEST" --rpc-url "$RPC" --json)"
hex() { cast to-dec "$(jq -r "$1 // \"0x0\"" <<<"$RCPT")"; }
COST="$(echo "$(hex .gasUsed) * $(hex .effectiveGasPrice) + $(hex .l1Fee)" | bc)"

need=0; plan=()
for a in "${TESTERS[@]}"; do
  have="$(cast balance "$a" --rpc-url "$RPC")"
  if [ "$(echo "$have >= $AMOUNT_WEI" | bc)" = 1 ]; then
    echo "skip  $a  already has $(cast from-wei "$have") ETH"
  else
    plan+=("$a"); need="$(echo "$need + $AMOUNT_WEI" | bc)"
    echo "send  $a  $AMOUNT ETH  (has $(cast from-wei "$have"))"
  fi
done

echo
echo "from        $FROM"
echo "balance     $(cast from-wei "$BAL") ETH"
echo "total send  $(cast from-wei "$need") ETH to ${#plan[@]} tester(s)"
echo "per tester  covers ~$(echo "$AMOUNT_WEI / $COST" | bc) circle-creation-sized txs (priced from $NEWEST)"
[ "$(echo "$BAL > $need" | bc)" = 1 ] || { echo "deployer balance too low" >&2; exit 1; }

if ! $SEND; then echo; echo "dry run — re-run with --yes to send"; exit 0; fi
for a in "${plan[@]}"; do
  tx="$(cast send "$a" --value "$AMOUNT_WEI" --private-key "$PRIVATE_KEY" --rpc-url "$RPC" --json | jq -r .transactionHash)"
  echo "sent  $a  $tx"
done

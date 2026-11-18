# Pilot plan (for Ritesh) — Nov 18–23, 2026

Goal: real, independent usage to report in the Phase 3 performance report (Phase 4
item 5). Deadline for the Phase 4 form is **Nov 30, 23:59 KST**.

## Baseline (before the pilot)

As of block 41,666,608 (Nov 18): 5 circles, all including the deployer or demo
wallets, so **0 independent circles**. Re-run `scripts/pilot-metrics.sh` for the
current numbers.

## How to run it

1. **Recruit.** Aim for 6–9 testers, enough for 2–3 circles of 3. Send them
   `pilot/TESTER-GUIDE.md`.
2. **Gas.** Collect their addresses, then:
   ```bash
   scripts/fund-testers.sh --amount 0.0001 0xADDR1 0xADDR2 ...        # dry run
   scripts/fund-testers.sh --amount 0.0001 --yes 0xADDR1 0xADDR2 ...  # send
   ```
   0.0001 ETH covers ~200+ Jjan transactions per tester (the script prices this
   from a real receipt). The deployer has ~0.0034 ETH, which is enough for ~30
   testers. Top it up from a faucet if needed.
3. **Group them.** 3 per circle, with a tester as organizer. **Don't join or organize
   the pilot circles yourself.** Circles that include your wallets don't count as
   independent in the metrics. If you have to step in, say so in the report.
4. **Avoid stalls.** A circle only starts once every invited member has joined, and
   there's no exit before it starts. Only invite people who've finished setup, and
   have them join within the hour.
5. **Collect feedback and quote permission** (guide step 4). Save the replies in
   `pilot/feedback.md` (gitignored if it holds names).

## Measuring

```bash
scripts/pilot-metrics.sh            # table + summary
scripts/pilot-metrics.sh --json     # for the report
FROM_BLOCK=41666608 scripts/pilot-metrics.sh   # pilot-only window
EXCLUDE=0xYOUR_OTHER_WALLET scripts/pilot-metrics.sh
```

Report numbers to use: `circlesIndependent` (started, with none of your wallets),
`independentFinished`, `independentContributions`, `independentRoundsClosed`, and
`uniqueNonDemoParticipants` (addresses that actually joined or contributed, not
just ones invited), plus tester quotes and the bugs found and fixed.

Run the first group of 3 as a test before sending the guide to everyone, and fix
anything in the guide that doesn't match the app.

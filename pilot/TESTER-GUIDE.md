# Try Jjan (짠) — tester guide

Jjan is a savings circle (*kye*, 곗) that runs on a smart contract instead of trust.
Everyone puts in the same amount each round, and the pot goes to one member per round
in a fixed order. No one, including the person who set it up, can take the money.

**This is a test.** It runs on GIWA Sepolia (a testnet) with a fake stablecoin called
mKRW. Nothing here is real money. Plan for about 15 minutes of setup, plus one click
per round.

## What you need

- A browser wallet on desktop: MetaMask or Rabby
- Your wallet address, to send to Ritesh so he can send you a little test ETH for gas

If you have more than one wallet extension installed (for example MetaMask and Rabby),
turn off the ones you won't use for this test. They fight over the connection.

## 1. Set up (5 minutes)

1. Open **https://jjan-gamma.vercel.app/dashboard**.
2. Click **Connect wallet** and approve.
3. If you see **Switch to GIWA Sepolia**, click it and approve adding the network.
4. Send your wallet address to Ritesh. Wait until he says your test ETH has arrived;
   the **ETH (for gas)** number on the dashboard will go above 0.
5. Click **Get 1,000,000 test mKRW** and confirm. This is your fake money.

## 2. Make or join a circle

Each circle has 3 people. One person creates it; the other two join.

**If you're the organizer**
1. Collect the wallet addresses of the 2 other members. Only use addresses from people
   who have finished step 1.
2. In **Start a savings circle**, click **+ Add my wallet** (it fills the first box),
   paste the second member's address into the next box, then click **+ Add member**
   and paste the third. The order of the list is the order people get paid.
3. Use these settings: contribution **10,000**, bond **10,000**, round length **60**
   minutes.
4. Click **Create circle**, confirm, and send the circle address (it starts with `0x`)
   to the group.

**Everyone, including the organizer**
1. Find the circle in the list on the dashboard and open it.
2. Click **1. Approve mKRW**, confirm, then **2. Join**, and confirm again.
3. Once all 3 have joined, anyone clicks **Start circle**.

> Please join within an hour of being invited. A circle can't start until every
> invited member has joined.

## 3. Each round

- Click **Contribute this round** before the round timer runs out.
- When the timer hits zero, anyone can click **Close round, pay out**. The pot goes
  to that round's member automatically.
- If you miss a round, your bond covers your share. With these settings that uses
  the whole bond. That's the feature working as designed, not a bug.

After the last round, click **Withdraw bond** to get your bond back.

## 4. Tell us how it went (2 minutes)

Reply to Ritesh with short answers:

1. What was confusing or broken? (Screenshots help.)
2. Would you use something like this with friends or family for real money? Why or
   why not?
3. Have you been in a kye or savings group before? How did it work?
4. Can we quote your answers (first name, or anonymous) in our GIWA GASOK report?
   Yes / anonymous only / no.

Thank you! 감사합니다!

---
name: launch-trade-challenge
description: 'Launch the local 20-Day Trading Challenge app so you can start your trading day and record trades. Use when the user asks to start their trading day, open or launch the trading journal, or use /launch-trade-challenge.'
argument-hint: 'Optionally say whether you plan to trade today.'
user-invocable: true
---

# Launch the Trading Challenge

Open the user's local trading app so they can decide whether to start the day and record trades. The application stores its journal locally in the browser. Do not initialize a day, log trades, change settings, or clear browser data on the user's behalf.

## Launch procedure

1. Use the current project workspace. Resolve its full path before using the launcher; do not assume a particular computer-specific folder.
2. Check whether the app already responds at that URL. If it does, reuse that app instance; do not launch another server.
3. If the app is not responding, run the workspace launcher:

   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Minimized -File "<workspace>\Start-TradeJournal.ps1"
   ```

   Replace `<workspace>` with the resolved full path. Run it as a long-lived process so the local web server remains available while the user records their trades. Do not stop or kill a server that is already running. If startup fails because the address is in use, check whether the existing app responds before reporting an error.
4. Confirm the local URL responds successfully.
5. Open `http://127.0.0.1:8765/` in the available browser. Reuse an existing page if possible; do not force a duplicate tab.
6. Briefly confirm that the app is open and remind the user to choose **Yes, start my day** or **Not trading today**. If the user gave their intention as input, mention it, but let them confirm in the app.

## Safety and errors

- Never place, recommend, or execute trades. This app is only for the user's personal record-keeping.
- Do not mark the user as trading or skipped, enter an opening balance, or write any journal data. Those choices belong to the user in the app.
- Preserve the local server while it is in use. Do not stop unrelated processes or clear browser storage.
- If the launcher or local URL fails, explain the error and give the user the retry command using the current workspace path. Do not claim the app is open unless you verified it.

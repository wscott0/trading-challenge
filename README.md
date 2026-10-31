# TradeBook

An offline-first app with a 20-day green-day trading journal and a compounded profit-goal planner. Your trades, goals, and settings are saved in this browser on this device; they are not sent to a server.

## Share with friends

The project can be shared from a public GitHub repository. Each person runs their own local copy and stores their journal in their own browser; publishing the app's source does not publish anyone's trades. Do not add exported CSVs or JSON backups to the repository.

Friends can download the repository as a ZIP from GitHub, extract it, then use the **One-click desktop shortcut** or **Start it manually** instructions below.

## Run the app

### One-click desktop shortcut

Run this once in PowerShell from the project folder to create a shortcut on your Windows desktop:

```powershell
powershell -ExecutionPolicy Bypass -File .\Install-DesktopShortcut.ps1
```

After that, double-click **20-Day Trading Challenge** on your desktop to open the app. If the local server is already running, the shortcut reuses it. The server window stays minimized while the app is in use; close that window to stop the local server.

The shortcut launches the included PowerShell app rather than a standalone native `.exe`, so keep the project folder in place.

### Start it manually

1. Open PowerShell in this folder.
2. Run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\Start-TradeJournal.ps1
   ```

3. Keep the PowerShell window open while using the app. Press **Ctrl+C** in that window to stop the local server.

The launcher opens the app in Microsoft Edge's app window when Edge is installed. The app shell is cached for offline use after its first successful load. You can install it from Edge's **Apps** menu if you want a Start menu or taskbar shortcut.

## Use your challenge

The app has two modes. Choose **TradeChallenge** to use the 20-day green-day journal, or **Goal Mode** to estimate the starting capital and daily targets for a profit goal. Your selected mode and Goal Mode settings are saved in this browser.

### Goal Mode

- Enter your starting account balance and profit goal, then choose 1 week (5 trading days), 2 weeks (10 trading days), or 1 month (20 trading days).
- Review the compounded daily percentage and dollar gain target, along with the projected balance path. Confirm the plan to start tracking.
- Start each trading day, log as many trades as you need, and end the day. Goal Mode has no daily trade limit. Actual signed trade results update both the day's target progress and overall goal progress; losing days reduce progress but do not end the goal. The required compounded percentage and next target balance recalculate from your current balance and remaining trading days, so the next day's target reflects any overachievement or shortfall.
- Goal Mode keeps its own trade history, separate from TradeChallenge. You can edit Goal Mode trades from its history table or start a new goal to replace the current plan and progress.
- Projections assume the target percentage is gained on one trade each trading day and gains compound. Actual trading results vary; logged losses, additional trades, fees, and slippage can change results. This is not financial or investment advice.

- When prompted, choose whether you are trading today. A day only counts toward the challenge if you start it. Skipping a day leaves the challenge progress unchanged.
- Starting your day records your opening account balance. Each trade is a symbol, a positive or negative result, and the absolute dollar amount of that result.
- You may log up to three trades per started day. Mark **Major news event today** to allow one additional trade, for a maximum of four.
- After each saved trade, the app shows your editable green- or red-trade encouragement. Choose **Edit trade messages** under the challenge progress to personalize both.
- Daily net P&L is the sum of positive amounts minus negative amounts. Finish the day when you are done; days with zero or negative net P&L end that challenge run. A new 20-day run can be started afterward.
- **End day & export CSV** saves the day's result and downloads a spreadsheet-compatible CSV containing its summary and individual trades. The browser remains the source of truth; on the next day, the last finished day's calculated closing balance is pre-filled as your opening balance, which you can adjust.
- Use **Edit** beside a trade in Trade history to correct its date, symbol, result, or amount. Editing a finished day's trade recalculates the affected day's result and challenge status.
- The displayed closing balance is an estimate calculated from the opening balance plus the day's net P&L. Fees and currency conversion are not included. The daily CSV opens in spreadsheet programs such as Excel, but it is not a native `.xlsx` workbook.
- Filter the trade history by date, and use **Export backup** to download a JSON copy of your journal.

Trade records and challenge progress are stored in this browser's local storage. They are not encrypted; use **Export backup** regularly and keep backup files somewhere private. Clearing browser data will remove the local journal. Existing trade records from the previous version are migrated to the simplified history the first time the new version is opened.

This app is for personal record-keeping only and does not provide financial or investment advice.

(() => {
  const STORAGE_KEY = 'trade-journal-challenge-v2';
  const LEGACY_STORAGE_KEY = 'trade-journal-data-v1';
  const DAILY_TRADE_LIMIT = 3;
  const NEWS_TRADE_LIMIT = 4;
  const CHALLENGE_LENGTH = 20;
  const DEFAULT_ENCOURAGEMENT = {
    positive: 'Celebrate the win, then stay grounded. Stick to your plan and protect your progress.',
    negative: 'One trade does not define you. Take a breath, learn from it, and follow your plan.'
  };
  const DEFAULT_GOAL_MODE = {
    goalAmount: null,
    timeframe: 5,
    dailyReturnPercent: 20,
    startingBalance: null,
    status: 'setup',
    days: [],
    trades: []
  };
  const emptyGoalMode = () => ({
    ...DEFAULT_GOAL_MODE,
    days: [],
    trades: []
  });

  const elements = {
    todayLabel: document.querySelector('#today-label'),
    todayPnl: document.querySelector('#today-pnl'),
    todayPnlCaption: document.querySelector('#today-pnl-caption'),
    todayTrades: document.querySelector('#today-trades'),
    todayTradesCaption: document.querySelector('#today-trades-caption'),
    todayResult: document.querySelector('#today-result'),
    todayResultCaption: document.querySelector('#today-result-caption'),
    challengeCount: document.querySelector('#challenge-count'),
    challengeDescription: document.querySelector('#challenge-description'),
    challengeProgress: document.querySelector('#challenge-progress'),
    challengeStatus: document.querySelector('#challenge-status'),
    dayPanel: document.querySelector('#day-panel'),
    dayEyebrow: document.querySelector('#day-eyebrow'),
    dayHeading: document.querySelector('#day-heading'),
    dayDescription: document.querySelector('#day-description'),
    dayStartingBalance: document.querySelector('#day-starting-balance'),
    dayControls: document.querySelector('#day-controls'),
    newsEvent: document.querySelector('#news-event'),
    dayClosed: document.querySelector('#day-closed'),
    startDayCard: document.querySelector('#start-day-card'),
    startDayDescription: document.querySelector('#start-day-description'),
    startChallengeButton: document.querySelector('#start-challenge-button'),
    dayActionButton: document.querySelector('#day-action-button'),
    startDaySecondaryButton: document.querySelector('#start-day-secondary-button'),
    addTradeButton: document.querySelector('#add-trade-button'),
    finishDayButton: document.querySelector('#finish-day-button'),
    tradeDialog: document.querySelector('#trade-dialog'),
    tradeForm: document.querySelector('#trade-form'),
    tradeDialogTitle: document.querySelector('#trade-dialog-title'),
    tradeDialogEyebrow: document.querySelector('#trade-dialog-eyebrow'),
    tradeCountHint: document.querySelector('#trade-count-hint'),
    tradeSubmitButton: document.querySelector('#trade-submit-button'),
    tradeDateField: document.querySelector('#trade-date-field'),
    tradeDate: document.querySelector('#trade-date'),
    encouragementDialog: document.querySelector('#encouragement-dialog'),
    encouragementTitle: document.querySelector('#encouragement-title'),
    encouragementMessage: document.querySelector('#encouragement-message'),
    encouragementContinue: document.querySelector('#encouragement-continue'),
    editEncouragementButton: document.querySelector('#edit-encouragement-button'),
    encouragementEditDialog: document.querySelector('#encouragement-edit-dialog'),
    encouragementEditForm: document.querySelector('#encouragement-edit-form'),
    positiveEncouragementInput: document.querySelector('#positive-encouragement'),
    negativeEncouragementInput: document.querySelector('#negative-encouragement'),
    dayDialog: document.querySelector('#day-dialog'),
    dayForm: document.querySelector('#day-form'),
    startingBalance: document.querySelector('#starting-balance'),
    startNewsEvent: document.querySelector('#start-news-event'),
    dayDialogTitle: document.querySelector('#day-dialog-title'),
    dayPromptDescription: document.querySelector('#day-prompt-description'),
    finishDialog: document.querySelector('#finish-dialog'),
    finishForm: document.querySelector('#finish-form'),
    finishSummary: document.querySelector('#finish-summary'),
    tradesBody: document.querySelector('#trades-body'),
    emptyState: document.querySelector('#empty-state'),
    historyFilter: document.querySelector('#history-filter'),
    historyFooter: document.querySelector('#history-footer'),
    storageError: document.querySelector('#storage-error'),
    exportButton: document.querySelector('#export-button'),
    challengeModeButton: document.querySelector('#challenge-mode-button'),
    goalModeButton: document.querySelector('#goal-mode-button'),
    challengeModeView: document.querySelector('#challenge-mode-view'),
    goalModeView: document.querySelector('#goal-mode-view'),
    challengeNavigation: document.querySelector('#challenge-navigation'),
    challengeNavigationLabel: document.querySelector('.challenge-navigation-label'),
    goalForm: document.querySelector('#goal-form'),
    goalAmount: document.querySelector('#goal-amount'),
    goalStartingInput: document.querySelector('#goal-starting-input'),
    goalReview: document.querySelector('#goal-review'),
    goalStartingCapital: document.querySelector('#goal-starting-capital'),
    goalTradeTarget: document.querySelector('#goal-trade-target'),
    goalTradeTargetAmount: document.querySelector('#goal-trade-target-amount'),
    goalSummaryTimeframe: document.querySelector('#goal-summary-timeframe'),
    goalEndingBalance: document.querySelector('#goal-ending-balance'),
    goalScheduleDescription: document.querySelector('#goal-schedule-description'),
    goalScheduleBody: document.querySelector('#goal-schedule-body'),
    confirmGoalButton: document.querySelector('#confirm-goal-button'),
    goalTracker: document.querySelector('#goal-tracker'),
    goalTrackerStarting: document.querySelector('#goal-tracker-starting'),
    goalCurrentBalance: document.querySelector('#goal-current-balance'),
    goalCurrentPnl: document.querySelector('#goal-current-pnl'),
    goalTrackerGoal: document.querySelector('#goal-tracker-goal'),
    goalTrackerTimeframe: document.querySelector('#goal-tracker-timeframe'),
    goalProgressTitle: document.querySelector('#goal-progress-title'),
    goalProgressDescription: document.querySelector('#goal-progress-description'),
    goalProgressPercent: document.querySelector('#goal-progress-percent'),
    goalProgressBar: document.querySelector('#goal-progress-bar'),
    goalProgressFill: document.querySelector('#goal-progress-fill'),
    goalNextTarget: document.querySelector('#goal-next-target'),
    goalNewsToggle: document.querySelector('#goal-news-toggle'),
    goalNewsEvent: document.querySelector('#goal-news-event'),
    goalStartDayButton: document.querySelector('#goal-start-day-button'),
    goalAddTradeButton: document.querySelector('#goal-add-trade-button'),
    goalFinishDayButton: document.querySelector('#goal-finish-day-button'),
    goalDayClosed: document.querySelector('#goal-day-closed'),
    goalTradesBody: document.querySelector('#goal-trades-body'),
    goalEmptyState: document.querySelector('#goal-empty-state'),
    goalHistoryFooter: document.querySelector('#goal-history-footer'),
    goalNewButton: document.querySelector('#goal-new-button'),
    goalResetDialog: document.querySelector('#goal-reset-dialog'),
    goalResetForm: document.querySelector('#goal-reset-form')
  };

  const localToday = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  };

  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

  const createId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const formatMoney = amount => new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  const formatDate = date => new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${date}T12:00:00`));

  const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

  const isValidTrade = trade => trade !== null
    && typeof trade === 'object'
    && typeof trade.id === 'string'
    && isDate(trade.date)
    && typeof trade.symbol === 'string'
    && ['positive', 'negative', 'flat', 'open'].includes(trade.result)
    && Number.isFinite(trade.amount)
    && trade.amount >= 0
    && typeof trade.createdAt === 'string';

  const isValidState = value => value !== null
    && typeof value === 'object'
    && value.version === 2
    && Array.isArray(value.trades)
    && value.trades.every(isValidTrade)
    && Array.isArray(value.days)
    && value.days.every(day => day
      && typeof day.id === 'string'
      && isDate(day.date)
      && Number.isFinite(day.startingBalance)
      && day.startingBalance >= 0
      && typeof day.majorNewsEvent === 'boolean'
      && typeof day.finished === 'boolean'
      && (day.green === null || typeof day.green === 'boolean')
      && (day.challengeId === null || typeof day.challengeId === 'string'))
    && Array.isArray(value.challenges)
    && value.challenges.every(challenge => challenge
      && typeof challenge.id === 'string'
      && isDate(challenge.startedAt)
      && ['active', 'failed', 'completed'].includes(challenge.status)
      && Array.isArray(challenge.dayIds)
      && challenge.dayIds.every(id => typeof id === 'string')
      && (challenge.failedDate === null || isDate(challenge.failedDate)))
    && (value.currentChallengeId === null || typeof value.currentChallengeId === 'string')
    && Array.isArray(value.skippedDates)
    && value.skippedDates.every(isDate)
    && (value.encouragement === undefined || value.encouragement !== null
      && typeof value.encouragement === 'object'
      && typeof value.encouragement.positive === 'string'
      && value.encouragement.positive.trim().length > 0
      && value.encouragement.positive.length <= 280
      && typeof value.encouragement.negative === 'string'
      && value.encouragement.negative.trim().length > 0
      && value.encouragement.negative.length <= 280)
    && (value.activeMode === undefined || ['challenge', 'goal'].includes(value.activeMode))
    && (value.goalMode === undefined || value.goalMode !== null
      && typeof value.goalMode === 'object'
      && (value.goalMode.goalAmount === null || Number.isFinite(value.goalMode.goalAmount)
        && value.goalMode.goalAmount > 0)
      && [5, 10, 20].includes(value.goalMode.timeframe)
      && Number.isFinite(value.goalMode.dailyReturnPercent)
      && value.goalMode.dailyReturnPercent > 0
      && (value.goalMode.startingBalance === undefined || value.goalMode.startingBalance === null
        || Number.isFinite(value.goalMode.startingBalance) && value.goalMode.startingBalance > 0)
      && (value.goalMode.status === undefined || ['setup', 'draft', 'active', 'completed'].includes(value.goalMode.status))
      && (value.goalMode.status === undefined || value.goalMode.status === 'setup'
        || Number.isFinite(value.goalMode.startingBalance) && value.goalMode.startingBalance > 0
        && Number.isFinite(value.goalMode.goalAmount) && value.goalMode.goalAmount > 0)
      && (value.goalMode.days === undefined || Array.isArray(value.goalMode.days)
        && value.goalMode.days.every(day => day
          && typeof day.id === 'string'
          && isDate(day.date)
          && Number.isFinite(day.startingBalance)
          && day.startingBalance >= 0
          && typeof day.majorNewsEvent === 'boolean'
          && typeof day.finished === 'boolean'))
      && (value.goalMode.trades === undefined || Array.isArray(value.goalMode.trades)
        && value.goalMode.trades.every(isValidTrade)));

  const emptyState = () => ({
    version: 2,
    trades: [],
    days: [],
    challenges: [],
    currentChallengeId: null,
    skippedDates: [],
    encouragement: { ...DEFAULT_ENCOURAGEMENT },
    activeMode: 'challenge',
    goalMode: emptyGoalMode()
  });

  const migrateLegacyState = legacy => {
    if (legacy === null || typeof legacy !== 'object' || !Array.isArray(legacy.trades)) {
      throw new Error('Your previous journal could not be migrated because its data format is invalid.');
    }
    const migrated = emptyState();

    for (const trade of legacy.trades) {
      if (!trade || !isDate(trade.date) || typeof trade.symbol !== 'string'
        || !Number.isFinite(trade.entryPrice) || !Number.isFinite(trade.quantity)
        || (trade.side !== 'long' && trade.side !== 'short')) {
        throw new Error('A previous trade has invalid data, so your journal was not changed.');
      }

      const isOpen = trade.exitPrice === null;
      const pnl = isOpen
        ? null
        : (trade.exitPrice - trade.entryPrice) * trade.quantity * (trade.side === 'long' ? 1 : -1);
      if (!isOpen && !Number.isFinite(pnl)) {
        throw new Error('A previous trade has invalid prices, so your journal was not changed.');
      }
      migrated.trades.push({
        id: typeof trade.id === 'string' ? trade.id : createId(),
        date: trade.date,
        symbol: trade.symbol,
        result: isOpen ? 'open' : pnl === 0 ? 'flat' : pnl > 0 ? 'positive' : 'negative',
        amount: pnl === null ? 0 : Math.abs(pnl),
        createdAt: typeof trade.createdAt === 'string' ? trade.createdAt : new Date().toISOString()
      });
    }

    return migrated;
  };

  const readStoredState = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (!isValidState(parsed)) {
        throw new Error('Your saved challenge has an invalid format. Your data was not overwritten.');
      }
      const needsMigration = parsed.encouragement === undefined
        || parsed.activeMode === undefined
        || parsed.goalMode === undefined
        || parsed.goalMode.startingBalance === undefined
        || parsed.goalMode.status === undefined
        || parsed.goalMode.days === undefined
        || parsed.goalMode.trades === undefined;
      if (parsed.encouragement === undefined) {
        parsed.encouragement = { ...DEFAULT_ENCOURAGEMENT };
      }
      if (parsed.activeMode === undefined) {
        parsed.activeMode = 'challenge';
      }
      if (parsed.goalMode === undefined) {
        parsed.goalMode = emptyGoalMode();
      } else {
        parsed.goalMode = {
          ...emptyGoalMode(),
          ...parsed.goalMode,
          days: parsed.goalMode.days || [],
          trades: parsed.goalMode.trades || []
        };
      }
      return { value: parsed, migrated: needsMigration };
    }

    const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyStored !== null) {
      return { value: migrateLegacyState(JSON.parse(legacyStored)), migrated: true };
    }
    return { value: emptyState(), migrated: false };
  };

  let state;
  let storageAvailable = true;

  const showStorageError = message => {
    elements.storageError.textContent = message;
    elements.storageError.hidden = false;
  };

  try {
    const stored = readStoredState();
    state = stored.value;
    if (stored.migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    storageAvailable = false;
    state = emptyState();
    showStorageError(`Could not load your journal: ${error.message} Your existing data was not overwritten.`);
  }

  const persist = () => {
    if (!storageAvailable) {
      return false;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      elements.storageError.hidden = true;
      return true;
    } catch (error) {
      showStorageError(`Could not save your journal: ${error.message}. Your latest changes may be lost.`);
      return false;
    }
  };

  const changeState = change => {
    if (!storageAvailable) {
      showStorageError('Journal changes are disabled because saved data could not be loaded.');
      return false;
    }
    const previousState = JSON.stringify(state);
    change();
    if (!persist()) {
      state = JSON.parse(previousState);
      render();
      return false;
    }
    return true;
  };

  const getTodayDay = () => state.days.find(day => day.date === localToday()) || null;
  const getTodayGoalDay = () => state.goalMode.days.find(day => day.date === localToday()) || null;
  const getChallenge = id => state.challenges.find(challenge => challenge.id === id) || null;
  const getCurrentChallenge = () => getChallenge(state.currentChallengeId);
  const getDayTrades = date => state.trades.filter(trade => trade.date === date);
  const getGoalDayTrades = date => state.goalMode.trades.filter(trade => trade.date === date);
  const getLastFinishedDay = () => [...state.days]
    .filter(day => day.finished && day.date < localToday())
    .sort((left, right) => right.date.localeCompare(left.date))[0] || null;

  const getTradeAmount = trade => {
    if (trade.result === 'open') {
      return null;
    }
    return trade.result === 'negative' ? -trade.amount : trade.amount;
  };

  const getDayPnl = date => getDayTrades(date).reduce((sum, trade) => {
    const amount = getTradeAmount(trade);
    return sum + (amount === null ? 0 : amount);
  }, 0);

  const getGoalPnl = () => state.goalMode.trades.reduce((sum, trade) => {
    const amount = getTradeAmount(trade);
    return sum + (amount === null ? 0 : amount);
  }, 0);

  const getGoalBalance = () => (state.goalMode.startingBalance || 0) + getGoalPnl();

  const getGoalTarget = () => {
    const goal = state.goalMode;
    if (!goal.startingBalance || !goal.goalAmount) {
      return null;
    }
    const targetBalance = goal.startingBalance + goal.goalAmount;
    const dailyReturn = (targetBalance / goal.startingBalance) ** (1 / goal.timeframe) - 1;
    return Number.isFinite(dailyReturn) ? dailyReturn : null;
  };

  const getRequiredGoalReturn = (currentBalance, remainingDays) => {
    const goal = state.goalMode;
    const targetBalance = goal.startingBalance + goal.goalAmount;
    if (!Number.isFinite(currentBalance) || currentBalance <= 0 || remainingDays <= 0) {
      return null;
    }
    if (currentBalance >= targetBalance) {
      return 0;
    }
    const dailyReturn = (targetBalance / currentBalance) ** (1 / remainingDays) - 1;
    return Number.isFinite(dailyReturn) ? dailyReturn : null;
  };

  const refreshChallengeResult = challenge => {
    const days = challenge.dayIds.map(id => state.days.find(day => day.id === id)).filter(Boolean);
    const failedDay = days.find(day => day.finished && !day.green);
    challenge.failedDate = failedDay ? failedDay.date : null;
    challenge.status = failedDay
      ? 'failed'
      : days.length >= CHALLENGE_LENGTH && days.slice(0, CHALLENGE_LENGTH).every(day => day.finished && day.green)
        ? 'completed'
        : 'active';
  };

  const finishDayRecord = day => {
    if (day.finished) {
      return;
    }
    const netPnl = getDayPnl(day.date);
    day.finished = true;
    day.green = netPnl > 0;
    if (day.challengeId) {
      const challenge = getChallenge(day.challengeId);
      if (challenge && challenge.status === 'active') {
        if (!day.green) {
          challenge.status = 'failed';
          challenge.failedDate = day.date;
        } else if (challenge.dayIds.length >= CHALLENGE_LENGTH) {
          challenge.status = 'completed';
        }
      }
    }
  };

  const finishPreviousDays = () => {
    const unfinishedDays = state.days
      .filter(day => !day.finished && day.date < localToday())
      .sort((left, right) => left.date.localeCompare(right.date));
    if (unfinishedDays.length === 0 || !storageAvailable) {
      return;
    }
    changeState(() => unfinishedDays.forEach(finishDayRecord));
  };

  const openDayDialog = () => {
    const challenge = getCurrentChallenge();
    if (challenge && challenge.status === 'failed') {
      elements.dayDialogTitle.textContent = 'Start a fresh challenge?';
      elements.dayPromptDescription.textContent = `Your last run ended on ${formatDate(challenge.failedDate)}. Starting a new day begins another 20-day challenge. Enter your opening balance to continue.`;
      document.querySelector('#day-form button[name="action"][value="start"]').textContent = 'Start a fresh challenge';
    } else if (challenge && challenge.status === 'completed') {
      elements.dayDialogTitle.textContent = 'Start another challenge?';
      elements.dayPromptDescription.textContent = 'You completed 20 green trading days. Start a new run, or skip today.';
      document.querySelector('#day-form button[name="action"][value="start"]').textContent = 'Start a new challenge';
    } else {
      elements.dayDialogTitle.textContent = 'Are you trading today?';
      elements.dayPromptDescription.textContent = 'If you start your day, it counts as one of your 20 challenge days. Enter your opening account balance to begin.';
      document.querySelector('#day-form button[name="action"][value="start"]').textContent = 'Yes, start my day';
    }
    elements.dayForm.reset();
    const previousDay = getLastFinishedDay();
    if (previousDay) {
      const previousClosingBalance = previousDay.startingBalance + getDayPnl(previousDay.date);
      elements.startingBalance.value = previousClosingBalance.toFixed(2);
      elements.dayPromptDescription.textContent += ` Your last closing balance (${formatMoney(previousClosingBalance)}) is pre-filled; you can adjust it.`;
    } else {
      elements.startingBalance.value = '';
    }
    elements.dayDialog.showModal();
  };

  const renderChallenge = () => {
    const challenge = getCurrentChallenge();
    const days = challenge
      ? challenge.dayIds.map(id => state.days.find(day => day.id === id)).filter(Boolean)
      : [];
    const greenDays = days.filter(day => day.finished && day.green).length;
    const currentDay = getTodayDay();
    const challengeDayIndex = challenge && currentDay && currentDay.challengeId === challenge.id
      ? challenge.dayIds.indexOf(currentDay.id)
      : -1;

    elements.challengeCount.textContent = challenge?.status === 'completed'
      ? String(CHALLENGE_LENGTH)
      : String(greenDays);

    if (!challenge) {
      elements.challengeDescription.textContent = 'A day counts when you choose to trade. Finish each trading day with positive net P&L to keep the run going.';
      elements.challengeStatus.textContent = 'Ready when you are.';
      elements.startChallengeButton.hidden = true;
    } else if (challenge.status === 'failed') {
      elements.challengeDescription.textContent = 'A day finished without positive net P&L, so this run has ended. Your trade history is saved.';
      elements.challengeStatus.textContent = `Run ended on ${formatDate(challenge.failedDate)} · ${greenDays} of 20 green days`;
      elements.startChallengeButton.hidden = Boolean(currentDay);
    } else if (challenge.status === 'completed') {
      elements.challengeDescription.textContent = 'You finished 20 trading days in a row with positive daily net P&L.';
      elements.challengeStatus.textContent = 'Challenge complete · 20 of 20 green days';
      elements.startChallengeButton.hidden = Boolean(currentDay);
    } else {
      elements.challengeDescription.textContent = "A day counts when you choose to trade. Each day's combined P&L must be above $0 to keep this run going.";
      elements.challengeStatus.textContent = currentDay && challengeDayIndex >= 0 && !currentDay.finished
        ? `Day ${challengeDayIndex + 1} is in progress`
        : `${greenDays} green ${greenDays === 1 ? 'day' : 'days'} completed`;
      elements.startChallengeButton.hidden = true;
    }

    elements.challengeProgress.replaceChildren();
    for (let index = 0; index < CHALLENGE_LENGTH; index += 1) {
      const segment = document.createElement('span');
      segment.className = 'challenge-segment';
      if (challenge && challenge.status === 'completed') {
        segment.classList.add('complete');
      } else if (index < greenDays) {
        segment.classList.add('complete');
      } else if (index === challengeDayIndex && currentDay && !currentDay.finished && challenge.status === 'active') {
        segment.classList.add('in-progress');
      } else if (challenge && challenge.status === 'failed' && challenge.dayIds.length > 0
        && index === challenge.dayIds.length - 1) {
        segment.classList.add('failed');
      }
      segment.setAttribute('aria-hidden', 'true');
      elements.challengeProgress.append(segment);
    }
    const progressLabel = challenge && challenge.status === 'completed'
      ? '20 green trading days completed'
      : `${greenDays} green trading ${greenDays === 1 ? 'day' : 'days'} completed`;
    elements.challengeProgress.setAttribute('aria-label', progressLabel);
  };

  const renderToday = () => {
    const today = localToday();
    const day = getTodayDay();
    const trades = getDayTrades(today);
    const pnl = getDayPnl(today);
    const allowedTrades = day && day.majorNewsEvent ? NEWS_TRADE_LIMIT : DAILY_TRADE_LIMIT;

    elements.todayLabel.textContent = new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date());
    elements.todayPnl.textContent = formatMoney(pnl);
    elements.todayPnl.classList.toggle('positive', pnl > 0);
    elements.todayPnl.classList.toggle('negative', pnl < 0);
    elements.todayPnlCaption.textContent = day ? `From ${trades.length} ${trades.length === 1 ? 'trade' : 'trades'} today` : 'Start your day to begin';
    elements.todayTrades.textContent = `${trades.length} / ${allowedTrades}`;
    elements.todayTradesCaption.textContent = day && day.majorNewsEvent
      ? 'Major news event · 1 extra trade allowed'
      : 'Maximum 3 trades';

    if (!day) {
      elements.todayResult.textContent = 'NOT STARTED';
      elements.todayResult.className = 'stat-value status-neutral';
      elements.todayResultCaption.textContent = state.skippedDates.includes(today)
        ? 'Not counted in your challenge'
        : "Choose whether you're trading today";
      elements.dayPanel.hidden = true;
      elements.startDayCard.hidden = false;
      elements.startDayDescription.textContent = state.skippedDates.includes(today)
        ? 'You skipped today. You can still start a challenge day if you decide to trade.'
        : 'Choose whether you are trading today. Only started days count toward your challenge.';
      elements.dayActionButton.textContent = 'Start today';
      elements.dayActionButton.disabled = false;
      return;
    }

    const resultLabel = day.finished
      ? day.green ? 'GREEN DAY' : 'NOT GREEN'
      : pnl > 0 ? 'GREEN SO FAR' : pnl < 0 ? 'IN THE RED' : 'IN PROGRESS';
    elements.todayResult.textContent = resultLabel;
    elements.todayResult.className = `stat-value ${day.finished ? day.green ? 'positive' : 'negative' : pnl > 0 ? 'positive' : pnl < 0 ? 'negative' : 'status-neutral'}`;
    elements.todayResultCaption.textContent = day.finished
      ? 'Trading day finished'
      : 'Day counts once you choose to start';

    elements.dayPanel.hidden = false;
    elements.startDayCard.hidden = true;
    elements.dayStartingBalance.textContent = formatMoney(day.startingBalance);
    elements.newsEvent.checked = day.majorNewsEvent;
    elements.newsEvent.disabled = day.finished || trades.length >= NEWS_TRADE_LIMIT;
    elements.dayControls.hidden = day.finished;
    elements.dayClosed.hidden = !day.finished;
    elements.dayClosed.textContent = day.finished
      ? `${day.green ? 'Green day!' : 'This day was not green.'} Final net P&L: ${formatMoney(pnl)} · Closing balance: ${formatMoney(day.startingBalance + pnl)}`
      : '';
    elements.addTradeButton.disabled = day.finished || trades.length >= allowedTrades;
    elements.addTradeButton.textContent = trades.length >= allowedTrades
      ? 'Daily trade limit reached'
      : `＋ Log ${trades.length === 3 && day.majorNewsEvent ? '4th ' : 'a '}trade`;
    elements.finishDayButton.disabled = false;
    elements.dayActionButton.textContent = day.finished ? 'Day finished' : 'Day in progress';
    elements.dayActionButton.disabled = true;
    elements.dayDescription.textContent = day.finished
      ? `Trading day complete · ${trades.length} ${trades.length === 1 ? 'trade' : 'trades'} logged`
      : `${trades.length} of ${allowedTrades} trades logged · ${pnl > 0 ? 'Net P&L is green' : pnl < 0 ? 'Net P&L is currently negative' : 'Add trades to track today’s net'}`;
    elements.dayEyebrow.textContent = day.finished ? 'COMPLETED TRADING DAY' : 'YOUR TRADING DAY';
  };

  const renderHistory = () => {
    const filter = elements.historyFilter.value;
    const trades = [...state.trades]
      .filter(trade => !filter || trade.date === filter)
      .sort((left, right) => right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt));

    elements.tradesBody.replaceChildren();
    elements.emptyState.hidden = trades.length > 0;
    elements.historyFooter.textContent = trades.length === 0
      ? ''
      : `${trades.length} ${trades.length === 1 ? 'trade' : 'trades'}${filter ? ` on ${formatDate(filter)}` : ' in your journal'}`;

    for (const trade of trades) {
      const resultLabel = trade.result === 'open' ? 'Open (previous log)' : trade.result === 'flat' ? 'Flat (previous log)' : trade.result;
      const signedAmount = getTradeAmount(trade);
      const amountLabel = signedAmount === null ? '—' : formatMoney(signedAmount);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(formatDate(trade.date))}</td>
        <td class="symbol-cell">${escapeHtml(trade.symbol)}</td>
        <td><span class="result-badge ${trade.result === 'positive' ? 'positive' : trade.result === 'negative' ? 'negative' : 'neutral'}">${escapeHtml(resultLabel)}</span></td>
        <td class="pnl-cell ${trade.result === 'positive' ? 'positive' : trade.result === 'negative' ? 'negative' : ''}">${escapeHtml(amountLabel)}</td>
        <td class="trade-actions"></td>`;
      if (trade.result === 'positive' || trade.result === 'negative') {
        const editButton = document.createElement('button');
        editButton.className = 'trade-edit-button';
        editButton.type = 'button';
        editButton.dataset.editTrade = trade.id;
        editButton.setAttribute('aria-label', `Edit ${trade.symbol} trade from ${formatDate(trade.date)}`);
        editButton.textContent = 'Edit';
        row.querySelector('.trade-actions').append(editButton);
      }
      elements.tradesBody.append(row);
    }
  };

  const renderMode = () => {
    const goalModeActive = state.activeMode === 'goal';
    elements.challengeModeView.hidden = goalModeActive;
    elements.goalModeView.hidden = !goalModeActive;
    elements.challengeNavigation.hidden = goalModeActive;
    elements.challengeNavigationLabel.hidden = goalModeActive;
    elements.dayActionButton.hidden = goalModeActive;
    elements.challengeModeButton.classList.toggle('active', !goalModeActive);
    elements.goalModeButton.classList.toggle('active', goalModeActive);
    elements.challengeModeButton.setAttribute('aria-pressed', String(!goalModeActive));
    elements.goalModeButton.setAttribute('aria-pressed', String(goalModeActive));
  };

  const renderGoalMode = () => {
    const goal = state.goalMode;
    elements.goalAmount.value = goal.goalAmount ?? '';
    elements.goalStartingInput.value = goal.startingBalance ?? '';
    elements.goalForm.querySelector(`input[name="timeframe"][value="${goal.timeframe}"]`).checked = true;
    elements.goalScheduleBody.replaceChildren();

    const hasPlan = goal.goalAmount !== null && goal.startingBalance !== null;
    const targetReturn = getGoalTarget();
    const targetBalance = goal.startingBalance === null || goal.goalAmount === null
      ? null
      : goal.startingBalance + goal.goalAmount;
    elements.goalReview.hidden = !hasPlan || goal.status !== 'draft';
    elements.goalTracker.hidden = !['active', 'completed'].includes(goal.status);
    const planLocked = ['active', 'completed'].includes(goal.status);
    elements.goalForm.querySelector('button[type="submit"]').disabled = planLocked;
    elements.goalStartingInput.disabled = planLocked;
    elements.goalAmount.disabled = planLocked;
    elements.goalForm.querySelectorAll('input[name="timeframe"]').forEach(input => {
      input.disabled = planLocked;
    });

    if (!hasPlan || goal.status !== 'draft' || targetReturn === null || targetBalance === null) {
      return;
    }

    const tradingDays = goal.timeframe;
    elements.goalStartingCapital.textContent = formatMoney(goal.startingBalance);
    elements.goalTradeTarget.textContent = `${(targetReturn * 100).toFixed(2)}%`;
    elements.goalTradeTargetAmount.textContent = `${formatMoney(goal.startingBalance * targetReturn)} target gain on the first trade day`;
    elements.goalSummaryTimeframe.textContent = `${tradingDays} trading days · ${formatMoney(goal.goalAmount)} profit goal`;
    elements.goalEndingBalance.textContent = formatMoney(targetBalance);
    elements.goalScheduleDescription.textContent = `Assuming one target trade per trading day, this compounded return reaches the goal balance in ${tradingDays} trading days.`;

    let balance = goal.startingBalance;
    for (let day = 1; day <= tradingDays; day += 1) {
      const dailyGain = balance * targetReturn;
      const row = document.createElement('tr');
      for (const value of [
        `Day ${day}`,
        formatMoney(balance),
        formatMoney(dailyGain),
        formatMoney(balance + dailyGain)
      ]) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      elements.goalScheduleBody.append(row);
      balance += dailyGain;
    }

  };

  const renderGoalTracker = () => {
    const goal = state.goalMode;
    if (!['active', 'completed'].includes(goal.status)) {
      return;
    }

    const todayDay = getTodayGoalDay();
    const completedDays = goal.days.filter(day => day.finished).length;
    const currentBalance = getGoalBalance();
    const targetBalance = goal.startingBalance + goal.goalAmount;
    const profit = currentBalance - goal.startingBalance;
    const progress = Math.max(0, Math.min(100, profit / goal.goalAmount * 100));
    const remainingDays = goal.timeframe - completedDays;
    const dailyReturn = getRequiredGoalReturn(currentBalance, remainingDays);
    const tradeCount = todayDay ? getGoalDayTrades(todayDay.date).length : 0;
    const tradeLimit = todayDay && todayDay.majorNewsEvent ? NEWS_TRADE_LIMIT : DAILY_TRADE_LIMIT;

    elements.goalTrackerStarting.textContent = formatMoney(goal.startingBalance);
    elements.goalCurrentBalance.textContent = formatMoney(currentBalance);
    elements.goalCurrentPnl.textContent = `${formatMoney(profit)} net P&L`;
    elements.goalTrackerGoal.textContent = formatMoney(goal.goalAmount);
    elements.goalTrackerTimeframe.textContent = `${goal.timeframe} trading-day target`;
    elements.goalProgressPercent.textContent = `${Math.floor(progress)}%`;
    elements.goalProgressBar.setAttribute('aria-valuenow', String(Math.floor(progress)));
    elements.goalProgressFill.style.width = `${progress}%`;
    elements.goalProgressTitle.textContent = goal.status === 'completed' ? 'Profit goal reached' : 'Goal progress';
    elements.goalProgressDescription.textContent = goal.status === 'completed'
      ? `Your account is at or above the goal balance of ${formatMoney(targetBalance)}.`
      : `${completedDays} of ${goal.timeframe} trading days completed · ${formatMoney(Math.max(0, targetBalance - currentBalance))} remaining to reach your ${formatMoney(goal.goalAmount)} profit goal.`;
    const nextTargetBalance = dailyReturn === null ? null : currentBalance * (1 + dailyReturn);
    const nextTradeTarget = dailyReturn === null ? null : currentBalance * dailyReturn;
    elements.goalNextTarget.textContent = goal.status === 'completed'
      ? 'This goal is complete. Your trades and history remain saved.'
      : completedDays >= goal.timeframe
        ? `Your ${goal.timeframe}-day timeframe has passed. Keep recording actual results toward the ${formatMoney(targetBalance)} goal balance.`
      : dailyReturn === null
        ? `A compounded percentage target cannot be calculated with a current balance of $0 or less. ${formatMoney(Math.max(0, targetBalance - currentBalance))} remains to reach your goal balance.`
        : `Target: ${(dailyReturn * 100).toFixed(2)}% per trade · Next target balance: ${formatMoney(nextTargetBalance)} · Approx. gain at current balance: ${formatMoney(nextTradeTarget)}`;

    elements.goalStartDayButton.hidden = Boolean(todayDay) || goal.status === 'completed';
    elements.goalNewsToggle.hidden = !todayDay || todayDay.finished || goal.status === 'completed';
    elements.goalNewsEvent.checked = Boolean(todayDay && todayDay.majorNewsEvent);
    elements.goalNewsEvent.disabled = Boolean(todayDay && getGoalDayTrades(todayDay.date).length >= NEWS_TRADE_LIMIT);
    elements.goalAddTradeButton.hidden = !todayDay || todayDay.finished || goal.status === 'completed';
    elements.goalFinishDayButton.hidden = !todayDay || todayDay.finished || goal.status === 'completed';
    elements.goalAddTradeButton.disabled = !todayDay || tradeCount >= tradeLimit;
    elements.goalAddTradeButton.textContent = tradeCount >= tradeLimit
      ? 'Daily trade limit reached'
      : `＋ Log ${tradeCount === 3 && todayDay.majorNewsEvent ? '4th ' : 'a '}trade`;
    elements.goalDayClosed.hidden = !todayDay || !todayDay.finished;
    elements.goalDayClosed.textContent = todayDay && todayDay.finished
      ? `Day complete · ${tradeCount} ${tradeCount === 1 ? 'trade' : 'trades'} · Day net: ${formatMoney(getGoalDayTrades(todayDay.date).reduce((sum, trade) => sum + getTradeAmount(trade), 0))} · Current balance: ${formatMoney(currentBalance)}`
      : '';
  };

  const renderGoalHistory = () => {
    const trades = [...state.goalMode.trades]
      .sort((left, right) => right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt));
    elements.goalTradesBody.replaceChildren();
    elements.goalEmptyState.hidden = trades.length > 0;
    elements.goalHistoryFooter.textContent = trades.length === 0
      ? ''
      : `${trades.length} goal ${trades.length === 1 ? 'trade' : 'trades'}`;

    for (const trade of trades) {
      const amount = getTradeAmount(trade);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(formatDate(trade.date))}</td>
        <td class="symbol-cell">${escapeHtml(trade.symbol)}</td>
        <td><span class="result-badge ${trade.result === 'positive' ? 'positive' : 'negative'}">${escapeHtml(trade.result)}</span></td>
        <td class="pnl-cell ${trade.result}">${escapeHtml(formatMoney(amount))}</td>
        <td class="trade-actions"></td>`;
      const editButton = document.createElement('button');
      editButton.className = 'trade-edit-button';
      editButton.type = 'button';
      editButton.dataset.editGoalTrade = trade.id;
      editButton.setAttribute('aria-label', `Edit ${trade.symbol} goal trade from ${formatDate(trade.date)}`);
      editButton.textContent = 'Edit';
      row.querySelector('.trade-actions').append(editButton);
      elements.goalTradesBody.append(row);
    }
  };

  const render = () => {
    renderMode();
    renderChallenge();
    renderToday();
    renderHistory();
    renderGoalMode();
    renderGoalTracker();
    renderGoalHistory();
  };

  const startDay = formData => {
    const today = localToday();
    if (getTodayDay()) {
      showStorageError('A trading day has already been started for today.');
      return false;
    }

    const startingBalance = Number(formData.get('startingBalance'));
    if (!Number.isFinite(startingBalance) || startingBalance < 0) {
      showStorageError('Enter a valid starting balance.');
      return false;
    }

    return changeState(() => {
      let challenge = getCurrentChallenge();
      if (!challenge || challenge.status !== 'active') {
        challenge = {
          id: createId(),
          startedAt: today,
          status: 'active',
          dayIds: [],
          failedDate: null
        };
        state.challenges.push(challenge);
        state.currentChallengeId = challenge.id;
      }

      const day = {
        id: createId(),
        date: today,
        startingBalance,
        majorNewsEvent: elements.startNewsEvent.checked,
        finished: false,
        green: null,
        challengeId: challenge.id
      };
      state.days.push(day);
      challenge.dayIds.push(day.id);
      state.skippedDates = state.skippedDates.filter(date => date !== today);
    });
  };

  const startGoalDay = () => {
    const goal = state.goalMode;
    if (goal.status !== 'active' || getTodayGoalDay()) {
      return;
    }
    if (changeState(() => {
      goal.days.filter(day => !day.finished && day.date < localToday())
        .forEach(day => {
          day.finished = true;
        });
      goal.days.push({
        id: createId(),
        date: localToday(),
        startingBalance: getGoalBalance(),
        majorNewsEvent: false,
        finished: false
      });
    })) {
      render();
    }
  };

  const finishGoalDay = () => {
    const day = getTodayGoalDay();
    if (!day || day.finished || state.goalMode.status !== 'active') {
      return;
    }
    if (changeState(() => {
      day.finished = true;
      if (getGoalBalance() >= state.goalMode.startingBalance + state.goalMode.goalAmount) {
        state.goalMode.status = 'completed';
      }
    })) {
      render();
    }
  };

  const openTradeDialog = () => {
    const goalMode = state.activeMode === 'goal';
    const day = goalMode ? getTodayGoalDay() : getTodayDay();
    if (!day || day.finished) {
      return;
    }
    const count = goalMode ? getGoalDayTrades(localToday()).length : getDayTrades(localToday()).length;
    const limit = day.majorNewsEvent ? NEWS_TRADE_LIMIT : DAILY_TRADE_LIMIT;
    if (count >= limit) {
      showStorageError('You have reached the trade limit for today.');
      return;
    }
    elements.tradeForm.reset();
    editingTradeId = null;
    editingTradeMode = goalMode ? 'goal' : 'challenge';
    elements.tradeDateField.hidden = true;
    elements.tradeDate.disabled = true;
    elements.tradeDialogTitle.textContent = 'Log a trade';
    elements.tradeDialogEyebrow.firstChild.textContent = goalMode ? "GOAL MODE TRADE " : "TODAY'S TRADE ";
    elements.tradeSubmitButton.textContent = 'Save trade';
    elements.tradeCountHint.textContent = ` · ${count + 1} of ${limit}`;
    elements.tradeDialog.showModal();
    document.querySelector('#trade-symbol').focus();
  };

  let editingTradeId = null;
  let editingTradeMode = 'challenge';

  const openEditTradeDialog = (tradeId, mode = 'challenge') => {
    const trades = mode === 'goal' ? state.goalMode.trades : state.trades;
    const trade = trades.find(item => item.id === tradeId);
    if (!trade || !['positive', 'negative'].includes(trade.result)) {
      return;
    }

    elements.tradeForm.reset();
    editingTradeId = trade.id;
    editingTradeMode = mode;
    elements.tradeDateField.hidden = false;
    elements.tradeDate.disabled = false;
    elements.tradeDate.value = trade.date;
    elements.tradeDialogTitle.textContent = 'Edit trade';
    elements.tradeDialogEyebrow.firstChild.textContent = mode === 'goal' ? 'GOAL TRADE HISTORY ' : 'TRADE HISTORY ';
    elements.tradeCountHint.textContent = ` · ${formatDate(trade.date)}`;
    elements.tradeForm.elements.symbol.value = trade.symbol;
    elements.tradeForm.elements.amount.value = trade.amount;
    elements.tradeForm.querySelector(`input[name="result"][value="${trade.result}"]`).checked = true;
    elements.tradeSubmitButton.textContent = 'Save changes';
    elements.tradeDialog.showModal();
    document.querySelector('#trade-symbol').focus();
  };

  const openEncouragementDialog = result => {
    const isPositive = result === 'positive';
    elements.encouragementTitle.textContent = isPositive ? 'A green trade!' : 'A red trade.';
    elements.encouragementMessage.textContent = state.encouragement[result];
    elements.encouragementDialog.classList.toggle('encouragement-negative', !isPositive);
    elements.encouragementDialog.showModal();
    elements.encouragementContinue.focus();
  };

  const openEncouragementEditor = () => {
    elements.positiveEncouragementInput.value = state.encouragement.positive;
    elements.negativeEncouragementInput.value = state.encouragement.negative;
    elements.encouragementEditDialog.showModal();
    elements.positiveEncouragementInput.focus();
  };

  const csvCell = value => {
    let text = value === null || value === undefined ? '' : String(value);
    if (typeof value === 'string' && /^[=+\-@]/.test(text)) {
      text = `'${text}`;
    }
    return `"${text.replace(/"/g, '""')}"`;
  };

  const downloadCsv = day => {
    const challenge = getChallenge(day.challengeId);
    const challengeDay = challenge ? challenge.dayIds.indexOf(day.id) + 1 : '';
    const netPnl = getDayPnl(day.date);
    const closingBalance = day.startingBalance + netPnl;
    const challengeResult = challenge?.status === 'completed'
      ? 'Challenge complete'
      : challenge?.status === 'failed'
        ? `Challenge ended${challenge.failedDate ? ` ${challenge.failedDate}` : ''}`
        : 'In progress';
    const records = [
      ['Record type', 'Date', 'Challenge day', 'Symbol', 'Result', 'Trade amount', 'Starting balance', 'Closing balance', 'Daily net P&L', 'Major news event', 'Challenge status'],
      ['DAY SUMMARY', day.date, challengeDay, '', day.green ? 'Green day' : 'Not green', '', day.startingBalance, closingBalance, netPnl, day.majorNewsEvent ? 'Yes' : 'No', challengeResult],
      ...getDayTrades(day.date).map(trade => [
        'TRADE',
        trade.date,
        challengeDay,
        trade.symbol,
        trade.result,
        getTradeAmount(trade),
        '',
        '',
        '',
        '',
        ''
      ])
    ];
    const csv = `\uFEFF${records.map(record => record.map(csvCell).join(',')).join('\r\n')}\r\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trade-challenge-${day.date}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const closeToday = () => {
    const day = getTodayDay();
    if (!day || day.finished) {
      return;
    }
    if (changeState(() => finishDayRecord(day))) {
      elements.finishDialog.close();
      render();
      try {
        downloadCsv(day);
      } catch (error) {
        showStorageError(`Your day was saved, but the CSV backup could not be created: ${error.message}. Use Export backup to save a JSON copy.`);
      }
    }
  };

  const skipToday = () => changeState(() => {
    if (!state.skippedDates.includes(localToday())) {
      state.skippedDates.push(localToday());
    }
  });

  elements.dayActionButton.addEventListener('click', () => {
    if (!getTodayDay()) {
      openDayDialog();
    }
  });
  elements.challengeModeButton.addEventListener('click', () => {
    if (changeState(() => {
      state.activeMode = 'challenge';
    })) {
      render();
    }
  });
  elements.goalModeButton.addEventListener('click', () => {
    if (changeState(() => {
      state.activeMode = 'goal';
    })) {
      render();
    }
  });
  elements.goalForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!elements.goalForm.reportValidity()) {
      return;
    }
    const formData = new FormData(elements.goalForm);
    const startingBalance = Number(formData.get('startingBalance'));
    const goalAmount = Number(formData.get('goalAmount'));
    const timeframe = Number(formData.get('timeframe'));
    if (!Number.isFinite(startingBalance) || startingBalance <= 0
      || !Number.isFinite(goalAmount) || goalAmount <= 0
      || ![5, 10, 20].includes(timeframe)) {
      showStorageError('Enter a valid starting balance, profit goal, and timeframe.');
      return;
    }
    const targetBalance = startingBalance + goalAmount;
    const dailyReturnPercent = ((targetBalance / startingBalance) ** (1 / timeframe) - 1) * 100;
    if (!Number.isFinite(targetBalance) || !Number.isFinite(dailyReturnPercent)) {
      showStorageError('Those values are too large to calculate. Try a smaller starting balance or profit goal.');
      return;
    }
    if (changeState(() => {
      state.goalMode = {
        ...DEFAULT_GOAL_MODE,
        goalAmount,
        startingBalance,
        timeframe,
        dailyReturnPercent,
        status: 'draft'
      };
    })) {
      render();
    }
  });
  elements.confirmGoalButton.addEventListener('click', () => {
    if (state.goalMode.status !== 'draft') {
      return;
    }
    if (changeState(() => {
      state.goalMode.status = 'active';
    })) {
      render();
    }
  });
  elements.goalStartDayButton.addEventListener('click', startGoalDay);
  elements.goalAddTradeButton.addEventListener('click', openTradeDialog);
  elements.goalFinishDayButton.addEventListener('click', finishGoalDay);
  elements.goalNewsEvent.addEventListener('change', () => {
    const day = getTodayGoalDay();
    if (!day || day.finished || state.goalMode.status !== 'active') {
      return;
    }
    if (changeState(() => {
      day.majorNewsEvent = elements.goalNewsEvent.checked;
    })) {
      render();
    }
  });
  elements.goalNewButton.addEventListener('click', () => {
    elements.goalResetDialog.showModal();
  });
  elements.startDaySecondaryButton.addEventListener('click', openDayDialog);
  elements.startChallengeButton.addEventListener('click', openDayDialog);
  elements.addTradeButton.addEventListener('click', openTradeDialog);
  elements.historyFilter.addEventListener('change', renderHistory);
  elements.tradesBody.addEventListener('click', event => {
    const button = event.target.closest('button[data-edit-trade]');
    if (button) {
      openEditTradeDialog(button.dataset.editTrade);
    }
  });
  elements.goalTradesBody.addEventListener('click', event => {
    const button = event.target.closest('button[data-edit-goal-trade]');
    if (button) {
      openEditTradeDialog(button.dataset.editGoalTrade, 'goal');
    }
  });

  document.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => button.closest('dialog').close());
  });
  [elements.dayDialog, elements.tradeDialog, elements.finishDialog, elements.encouragementDialog, elements.encouragementEditDialog, elements.goalResetDialog].forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });
  elements.goalResetForm.addEventListener('submit', event => {
    event.preventDefault();
    if (changeState(() => {
      state.goalMode = emptyGoalMode();
    })) {
      elements.goalResetDialog.close();
      render();
      elements.goalStartingInput.focus();
    }
  });

  elements.dayForm.addEventListener('submit', event => {
    event.preventDefault();
    const action = event.submitter?.value;
    if (action === 'skip') {
      if (skipToday()) {
        elements.dayDialog.close();
        render();
      }
      return;
    }
    if (!elements.dayForm.reportValidity()) {
      return;
    }
    if (startDay(new FormData(elements.dayForm))) {
      elements.dayDialog.close();
      render();
    }
  });

  elements.newsEvent.addEventListener('change', () => {
    const day = getTodayDay();
    if (!day || day.finished) {
      return;
    }
    const newsEvent = elements.newsEvent.checked;
    if (changeState(() => {
      day.majorNewsEvent = newsEvent;
    })) {
      render();
    }
  });

  elements.tradeForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!elements.tradeForm.reportValidity()) {
      return;
    }
    const formData = new FormData(elements.tradeForm);
    const symbol = String(formData.get('symbol')).trim().toUpperCase();
    const result = String(formData.get('result'));
    const amount = Number(formData.get('amount'));
    if (!symbol || !['positive', 'negative'].includes(result) || !Number.isFinite(amount) || amount <= 0) {
      showStorageError('Enter a symbol and an amount greater than zero.');
      return;
    }

    if (editingTradeId) {
      const trades = editingTradeMode === 'goal' ? state.goalMode.trades : state.trades;
      const trade = trades.find(item => item.id === editingTradeId);
      if (!trade) {
        showStorageError('This trade is no longer in your journal. Close the dialog and try again.');
        elements.tradeDialog.close();
        return;
      }
      const date = String(formData.get('date'));
      if (!isDate(date)) {
        showStorageError('Enter a valid trade date.');
        return;
      }
      if (changeState(() => {
        const previousDate = trade.date;
        const savedTrade = trades.find(item => item.id === editingTradeId);
        if (!savedTrade) {
          throw new Error('This trade is no longer in your journal.');
        }
        savedTrade.symbol = symbol;
        savedTrade.result = result;
        savedTrade.amount = amount;
        savedTrade.date = date;
        if (editingTradeMode === 'goal') {
          const targetBalance = state.goalMode.startingBalance + state.goalMode.goalAmount;
          state.goalMode.status = getGoalBalance() >= targetBalance ? 'completed' : 'active';
        } else {
          const affectedChallenges = new Set();
          for (const day of state.days.filter(item => item.finished
            && (item.date === previousDate || item.date === date))) {
            day.green = getDayPnl(day.date) > 0;
            if (day.challengeId) {
              affectedChallenges.add(day.challengeId);
            }
          }
          for (const challengeId of affectedChallenges) {
            const challenge = getChallenge(challengeId);
            if (challenge) {
              refreshChallengeResult(challenge);
            }
          }
        }
      })) {
        elements.tradeDialog.close();
        editingTradeId = null;
        editingTradeMode = 'challenge';
        elements.tradeDateField.hidden = true;
        elements.tradeDate.disabled = true;
        render();
      }
      return;
    }

    const goalMode = state.activeMode === 'goal';
    const day = goalMode ? getTodayGoalDay() : getTodayDay();
    if (!day || day.finished) {
      showStorageError('Start a trading day before logging trades.');
      elements.tradeDialog.close();
      return;
    }

    const limit = day.majorNewsEvent ? NEWS_TRADE_LIMIT : DAILY_TRADE_LIMIT;
    const dayTrades = goalMode ? getGoalDayTrades(day.date) : getDayTrades(day.date);
    if (dayTrades.length >= limit) {
      showStorageError(`Today's limit is ${limit} trades.`);
      elements.tradeDialog.close();
      return;
    }

    const trade = {
      id: createId(),
      date: day.date,
      symbol,
      result,
      amount,
      createdAt: new Date().toISOString()
    };
    if (changeState(() => {
      if (goalMode) {
        state.goalMode.trades.push(trade);
        const targetBalance = state.goalMode.startingBalance + state.goalMode.goalAmount;
        if (getGoalBalance() >= targetBalance) {
          state.goalMode.status = 'completed';
          day.finished = true;
        }
      } else {
        state.trades.push(trade);
      }
    })) {
      elements.tradeDialog.close();
      render();
      openEncouragementDialog(result);
    }
  });

  elements.finishDayButton.addEventListener('click', () => {
    const day = getTodayDay();
    if (!day || day.finished) {
      return;
    }
    const pnl = getDayPnl(day.date);
    const tradeCount = getDayTrades(day.date).length;
    const endingBalance = day.startingBalance + pnl;
    elements.finishSummary.textContent = `${tradeCount} ${tradeCount === 1 ? 'trade' : 'trades'} · Net P&L: ${formatMoney(pnl)} · Estimated closing balance: ${formatMoney(endingBalance)}${pnl > 0 ? ' · This will be a green day.' : ' · This will end your current challenge run.'}`;
    elements.finishDialog.showModal();
  });
  elements.finishForm.addEventListener('submit', event => {
    event.preventDefault();
    closeToday();
  });

  elements.editEncouragementButton.addEventListener('click', openEncouragementEditor);
  elements.encouragementContinue.addEventListener('click', () => elements.encouragementDialog.close());
  elements.encouragementEditForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!elements.encouragementEditForm.reportValidity()) {
      return;
    }
    const positive = elements.positiveEncouragementInput.value.trim();
    const negative = elements.negativeEncouragementInput.value.trim();
    if (!positive || !negative) {
      showStorageError('Enter an encouragement message for both green and red trades.');
      return;
    }
    if (changeState(() => {
      state.encouragement = { positive, negative };
    })) {
      elements.encouragementEditDialog.close();
    }
  });

  elements.exportButton.addEventListener('click', () => {
    const backup = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(backup);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trade-challenge-backup-${localToday()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./service-worker.js').catch(error => {
      showStorageError(`Offline app setup failed: ${error.message}. Your saved trades remain on this device.`);
    });
  }

  finishPreviousDays();
  render();
  if (state.activeMode === 'challenge' && !getTodayDay() && !state.skippedDates.includes(localToday())) {
    openDayDialog();
  }
})();

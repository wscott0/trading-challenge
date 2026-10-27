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
    tradeCountHint: document.querySelector('#trade-count-hint'),
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
    exportButton: document.querySelector('#export-button')
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
      && value.encouragement.negative.length <= 280);

  const emptyState = () => ({
    version: 2,
    trades: [],
    days: [],
    challenges: [],
    currentChallengeId: null,
    skippedDates: [],
    encouragement: { ...DEFAULT_ENCOURAGEMENT }
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
      if (parsed.encouragement === undefined) {
        parsed.encouragement = { ...DEFAULT_ENCOURAGEMENT };
        return { value: parsed, migrated: true };
      }
      return { value: parsed, migrated: false };
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
  const getChallenge = id => state.challenges.find(challenge => challenge.id === id) || null;
  const getCurrentChallenge = () => getChallenge(state.currentChallengeId);
  const getDayTrades = date => state.trades.filter(trade => trade.date === date);
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
        <td class="pnl-cell ${trade.result === 'positive' ? 'positive' : trade.result === 'negative' ? 'negative' : ''}">${escapeHtml(amountLabel)}</td>`;
      elements.tradesBody.append(row);
    }
  };

  const render = () => {
    renderChallenge();
    renderToday();
    renderHistory();
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

  const openTradeDialog = () => {
    const day = getTodayDay();
    if (!day || day.finished) {
      return;
    }
    const count = getDayTrades(localToday()).length;
    const limit = day.majorNewsEvent ? NEWS_TRADE_LIMIT : DAILY_TRADE_LIMIT;
    if (count >= limit) {
      showStorageError('You have reached the trade limit for today.');
      return;
    }
    elements.tradeForm.reset();
    elements.tradeCountHint.textContent = ` · ${count + 1} of ${limit}`;
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
  elements.startDaySecondaryButton.addEventListener('click', openDayDialog);
  elements.startChallengeButton.addEventListener('click', openDayDialog);
  elements.addTradeButton.addEventListener('click', openTradeDialog);
  elements.historyFilter.addEventListener('change', renderHistory);

  document.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => button.closest('dialog').close());
  });
  [elements.dayDialog, elements.tradeDialog, elements.finishDialog, elements.encouragementDialog, elements.encouragementEditDialog].forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
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
    const day = getTodayDay();
    if (!day || day.finished) {
      showStorageError('Start a trading day before logging trades.');
      elements.tradeDialog.close();
      return;
    }

    const formData = new FormData(elements.tradeForm);
    const symbol = String(formData.get('symbol')).trim().toUpperCase();
    const result = String(formData.get('result'));
    const amount = Number(formData.get('amount'));
    const limit = day.majorNewsEvent ? NEWS_TRADE_LIMIT : DAILY_TRADE_LIMIT;
    if (!symbol || !['positive', 'negative'].includes(result) || !Number.isFinite(amount) || amount <= 0) {
      showStorageError('Enter a symbol and an amount greater than zero.');
      return;
    }
    if (getDayTrades(day.date).length >= limit) {
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
    if (changeState(() => state.trades.push(trade))) {
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
  if (!getTodayDay() && !state.skippedDates.includes(localToday())) {
    openDayDialog();
  }
})();

'use strict';

/* ==========================================================
   Helpers
   ========================================================== */
const $ = (id) => document.getElementById(id);

// Format a number with commas and exactly 2 decimals (e.g. 14,000.00)
const money = (value) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Show a message in a result element (green by default, red for errors)
const showMessage = (element, text, isError = false) => {
  element.textContent = text;
  element.classList.toggle('error', isError);
};

/* ==========================================================
   ASSIGNMENT 1 - CONVERSION
   ========================================================== */
const conversions = {
  c2f:  { convert: (c) => (c * 9) / 5 + 32, from: '°C', to: '°F' },
  f2c:  { convert: (f) => ((f - 32) * 5) / 9, from: '°F', to: '°C' },
  m2ft: { convert: (m) => m * 3.28084, from: 'm', to: 'ft' },
  ft2m: { convert: (ft) => ft / 3.28084, from: 'ft', to: 'm' },
};

document.querySelectorAll('[data-conv]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const { convert, from, to } = conversions[form.dataset.conv];
    const input = form.querySelector('input');
    const output = form.querySelector('.result');
    const value = Number(input.value);

    if (input.value.trim() === '' || Number.isNaN(value)) {
      showMessage(output, 'Please enter a valid number.', true);
      return;
    }

    const answer = convert(value);
    showMessage(output, `${value} ${from} = ${Number(answer.toFixed(4))} ${to}`);
  });
});

/* ==========================================================
   ASSIGNMENT 2 - INCOME TAX CALCULATOR
   Income Tax = Basic Tax + (Rate x excess over the bracket floor)
   Brackets are listed from highest to lowest so find() picks the
   first one the income is over.
   ========================================================== */
const taxBrackets = [
  { over: 8000000, basicTax: 2410000, rate: 0.35 },
  { over: 2000000, basicTax: 490000,  rate: 0.32 },
  { over: 800000,  basicTax: 130000,  rate: 0.30 },
  { over: 400000,  basicTax: 30000,   rate: 0.25 },
  { over: 250000,  basicTax: 0,       rate: 0.20 },
];

const computeTax = (income) => {
  const bracket = taxBrackets.find((b) => income > b.over);

  // Income of 250,000 or below is taxed at 0%
  if (!bracket) {
    return { basicTax: 0, rate: 0, over: 0, excess: 0, tax: 0 };
  }

  const excess = income - bracket.over;
  const tax = Math.round((bracket.basicTax + excess * bracket.rate) * 100) / 100;
  return { ...bracket, excess, tax };
};

$('taxForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const result = $('taxResult');
  const income = Number($('taxIncome').value);

  if ($('taxIncome').value.trim() === '' || Number.isNaN(income) || income < 0) {
    showMessage(result, 'Please enter a valid taxable income (0 or more).', true);
    return;
  }

  const { basicTax, rate, over, excess, tax } = computeTax(income);
  result.classList.remove('error');

  const detail = tax === 0
    ? 'Taxable income is within the 0% bracket.'
    : `Basic Tax ₱${money(basicTax)} + ${rate * 100}% of the excess ₱${money(excess)} over ₱${money(over)}`;

  result.innerHTML = '';
  const main = document.createElement('span');
  main.textContent = `Income Tax: ₱${money(tax)}`;
  const breakdown = document.createElement('span');
  breakdown.className = 'breakdown';
  breakdown.textContent = detail;
  result.append(main, breakdown);
});

/* ==========================================================
   ASSIGNMENT 3 - LOOPING
   ========================================================== */

// 3.1 nth factorial - uses a WHILE loop
const factorial = (n) => {
  let result = 1;
  let i = n;
  while (i > 1) {
    result *= i;
    i--;
  }
  return result;
};

// 3.2 sum of the first n numbers - uses a DO...WHILE loop
const sumFirstN = (n) => {
  let sum = 0;
  let i = 1;
  do {
    sum += i;
    i++;
  } while (i <= n);
  return sum;
};

// 3.3 average of the first n numbers - uses a FOR loop
const averageFirstN = (n) => {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum / n;
};

const loopTasks = {
  factorial: {
    min: 0,
    max: 170,
    run: (n) => `${n}! = ${factorial(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
  },
  sum: {
    min: 1,
    max: Infinity,
    run: (n) => `Sum of 1 to ${n} = ${sumFirstN(n).toLocaleString('en-US')}`,
  },
  average: {
    min: 1,
    max: Infinity,
    run: (n) => `Average of 1 to ${n} = ${averageFirstN(n).toLocaleString('en-US', { maximumFractionDigits: 4 })}`,
  },
};

document.querySelectorAll('[data-loop]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const task = loopTasks[form.dataset.loop];
    const input = form.querySelector('input');
    const output = form.querySelector('.result');
    const n = Number(input.value);

    if (input.value.trim() === '' || !Number.isInteger(n) || n < task.min || n > task.max) {
      const limit = task.max === Infinity ? `${task.min} or more` : `${task.min} to ${task.max}`;
      showMessage(output, `Please enter a whole number (${limit}).`, true);
      return;
    }

    showMessage(output, task.run(n));
  });
});

/* ==========================================================
   ASSIGNMENT 4 - PAYROLL
   ========================================================== */
const employees = [];

const grossPay = (emp) => emp.daysWorked * emp.dailyRate;
const netPay = (emp) => grossPay(emp) - emp.deduction;

const renderPayroll = () => {
  const body = $('payrollBody');
  body.innerHTML = '';

  if (employees.length === 0) {
    const row = body.insertRow();
    row.className = 'empty-row';
    const cell = row.insertCell();
    cell.colSpan = 7;
    cell.textContent = 'No employees yet. Add one above.';
    return;
  }

  employees.forEach((emp, index) => {
    const row = body.insertRow();
    const cells = [
      index + 1,                   // No. = line number
      emp.name,
      emp.daysWorked,
      money(emp.dailyRate),
      money(grossPay(emp)),        // Gross Pay = Days Worked * Daily Rate
      money(emp.deduction),
      money(netPay(emp)),          // Net Pay = Gross Pay - Deduction Amount
    ];
    // textContent (not innerHTML) keeps names safe to display
    cells.forEach((value) => {
      row.insertCell().textContent = value;
    });
  });
};

$('payrollForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const message = $('addMessage');
  const name = $('empName').value.trim();
  const daysWorked = Number($('daysWorked').value);
  const dailyRate = Number($('dailyRate').value);
  const deduction = Number($('deduction').value);

  const fieldsEmpty = [$('daysWorked'), $('dailyRate'), $('deduction')].some((i) => i.value.trim() === '');
  const invalid = [daysWorked, dailyRate, deduction].some((v) => Number.isNaN(v) || v < 0);

  if (name === '' || fieldsEmpty || invalid) {
    showMessage(message, 'Please fill in every field with valid values (numbers cannot be negative).', true);
    return;
  }

  employees.push({ name, daysWorked, dailyRate, deduction });
  renderPayroll();
  showMessage(message, `${name} was added to the payroll list.`);
  $('payrollForm').reset();
  $('empName').focus();
});

$('deleteForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const message = $('deleteMessage');
  const line = Number($('deleteLine').value);

  if ($('deleteLine').value.trim() === '' || !Number.isInteger(line) || line < 1 || line > employees.length) {
    const range = employees.length === 0 ? 'The list is empty.' : `Enter a line number from 1 to ${employees.length}.`;
    showMessage(message, `Invalid line number. ${range}`, true);
    return;
  }

  const [removed] = employees.splice(line - 1, 1);
  renderPayroll();
  showMessage(message, `Line ${line} (${removed.name}) was deleted.`);
  $('deleteForm').reset();
});

renderPayroll();

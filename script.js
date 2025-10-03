// A simple parser and evaluator for arithmetic expressions (+, -, *, /, parentheses)
// Does NOT use eval or Function constructor, so it's CSP-safe
// Also supports sin, cos, tan with Deg/Rad toggle

let isDegree = true;

function append(char) {
  clearError();
  document.getElementById('display').value += char;
}

function clearDisplay() {
  document.getElementById('display').value = '';
  clearError();
}

function backspace() {
  let disp = document.getElementById('display');
  disp.value = disp.value.slice(0, -1);
  clearError();
}

function trig(func) {
  try {
    clearError();
    let value = parseFloat(document.getElementById('display').value);
    if (isNaN(value)) {
      showError('Enter a number first');
      return;
    }
    if (isDegree) value = value * Math.PI / 180;
    let result;
    switch (func) {
      case 'sin': result = Math.sin(value); break;
      case 'cos': result = Math.cos(value); break;
      case 'tan': result = Math.tan(value); break;
    }
    document.getElementById('display').value = result;
  } catch (e) {
    showError('Invalid input for trigonometric function');
  }
}

function toggleAngle() {
  isDegree = !isDegree;
  let mode = isDegree ? 'Degrees' : 'Radians';
  showError('Mode: ' + mode, true);
}

function calculate() {
  try {
    clearError();
    let expression = document.getElementById('display').value;
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      throw new Error('Invalid characters');
    }
    let result = simpleEval(expression);
    if (!isFinite(result)) {
      throw new Error('Division by zero or invalid result');
    }
    document.getElementById('display').value = result;
  } catch (e) {
    showError(e.message);
  }
}

function showError(msg, info=false) {
  let el = document.getElementById('error');
  el.textContent = msg;
  el.style.color = info ? '#2980b9' : '#e74c3c';
}
function clearError() {
  document.getElementById('error').textContent = '';
}

// ----------- Safe Arithmetic Expression Evaluator ---------------
// Supports +, -, *, /, parentheses, decimals
function simpleEval(expr) {
  // Shunting Yard algorithm to convert to RPN
  let output = [];
  let ops = [];
  let tokens = tokenize(expr);
  let prec = {'+':1,'-':1,'*':2,'/':2};
  let assoc = {'+':'L','-':'L','*':'L','/':'L'};
  for(let token of tokens) {
    if(isNumeric(token)) {
      output.push(parseFloat(token));
    } else if(token in prec) {
      while(ops.length && ops[ops.length-1] in prec &&
        ((assoc[token]==='L' && prec[token]<=prec[ops[ops.length-1]])
         || (assoc[token]==='R' && prec[token]<prec[ops[ops.length-1]]))
      ) {
        output.push(ops.pop());
      }
      ops.push(token);
    } else if(token==='(') {
      ops.push(token);
    } else if(token===')') {
      while(ops.length && ops[ops.length-1]!=='(') {
        output.push(ops.pop());
      }
      if(ops.length && ops[ops.length-1]==='(') ops.pop();
      else throw new Error('Mismatched parentheses');
    }
  }
  while(ops.length) {
    let op = ops.pop();
    if(op==='('||op===')') throw new Error('Mismatched parentheses');
    output.push(op);
  }
  // Evaluate RPN
  let stack = [];
  for(let token of output) {
    if(typeof token==='number') {
      stack.push(token);
    } else if(token in prec) {
      if(stack.length<2) throw new Error('Invalid expression');
      let b = stack.pop(), a = stack.pop();
      switch(token) {
        case '+': stack.push(a+b); break;
        case '-': stack.push(a-b); break;
        case '*': stack.push(a*b); break;
        case '/': stack.push(a/b); break;
      }
    }
  }
  if(stack.length!==1) throw new Error('Invalid expression');
  return stack[0];
}
function tokenize(expr) {
  let tokens = [];
  let num = '';
  for(let c of expr.replace(/\s+/g,'') ) {
    if('0123456789.'.includes(c)) {
      num += c;
    } else {
      if(num) { tokens.push(num); num=''; }
      tokens.push(c);
    }
  }
  if(num) tokens.push(num);
  return tokens;
}
function isNumeric(str) {
  return !isNaN(str) && !isNaN(parseFloat(str));
}
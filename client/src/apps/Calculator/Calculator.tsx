import React, { useState } from 'react';
import './Calculator.css';

interface CalculatorProps {
  windowId: string;
}

const Calculator: React.FC<CalculatorProps> = ({ windowId }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(`${parseFloat(newValue.toFixed(7))}`);
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      performOperation('=');
      setOperation(null);
      setPreviousValue(null);
      setWaitingForNewValue(true);
    }
  };

  const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode }> = ({
    onClick,
    className = '',
    children
  }) => (
    <button className={`calc-button ${className}`} onClick={onClick}>
      {children}
    </button>
  );

  return (
    <div className="calculator">
      <div className="calc-display">
        <div className="calc-display-text">{display}</div>
      </div>
      
      <div className="calc-buttons">
        <Button onClick={clear} className="function">C</Button>
        <Button onClick={() => {}} className="function">±</Button>
        <Button onClick={() => {}} className="function">%</Button>
        <Button onClick={() => performOperation('÷')} className="operator">÷</Button>
        
        <Button onClick={() => inputNumber('7')}>7</Button>
        <Button onClick={() => inputNumber('8')}>8</Button>
        <Button onClick={() => inputNumber('9')}>9</Button>
        <Button onClick={() => performOperation('×')} className="operator">×</Button>
        
        <Button onClick={() => inputNumber('4')}>4</Button>
        <Button onClick={() => inputNumber('5')}>5</Button>
        <Button onClick={() => inputNumber('6')}>6</Button>
        <Button onClick={() => performOperation('-')} className="operator">-</Button>
        
        <Button onClick={() => inputNumber('1')}>1</Button>
        <Button onClick={() => inputNumber('2')}>2</Button>
        <Button onClick={() => inputNumber('3')}>3</Button>
        <Button onClick={() => performOperation('+')} className="operator">+</Button>
        
        <Button onClick={() => inputNumber('0')} className="zero">0</Button>
        <Button onClick={inputDecimal}>.</Button>
        <Button onClick={handleEquals} className="equals">=</Button>
      </div>
    </div>
  );
};

export default Calculator;
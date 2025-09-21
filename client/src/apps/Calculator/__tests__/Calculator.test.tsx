import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from '../Calculator';

describe('Calculator Component', () => {
  it('renders calculator with initial display of 0', () => {
    render(<Calculator windowId="calc-1" />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
  });

  it('displays numbers when clicked', () => {
    render(<Calculator windowId="calc-1" />);

    fireEvent.click(screen.getByText('7'));
    expect(screen.getByText('7')).toBeInTheDocument();

    fireEvent.click(screen.getByText('3'));
    expect(screen.getByText('73')).toBeInTheDocument();
  });

  it('performs basic addition', () => {
    render(<Calculator windowId="calc-1" />);

    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));

    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('performs basic subtraction', () => {
    render(<Calculator windowId="calc-1" />);

    fireEvent.click(screen.getByText('9'));
    fireEvent.click(screen.getByText('-'));
    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText('='));

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('performs basic multiplication', () => {
    render(<Calculator windowId="calc-1" />);

    fireEvent.click(screen.getByText('6'));
    fireEvent.click(screen.getByText('×'));
    fireEvent.click(screen.getByText('7'));
    fireEvent.click(screen.getByText('='));

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('performs basic division', () => {
    render(<Calculator windowId="calc-1" />);

    fireEvent.click(screen.getByText('8'));
    fireEvent.click(screen.getByText('÷'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('='));

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('clears display when C is clicked', () => {
    render(<Calculator windowId="calc-1" />);

    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('C'));

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles decimal numbers', () => {
    render(<Calculator windowId="calc-1" />);

    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('.'));
    fireEvent.click(screen.getByText('5'));

    expect(screen.getByText('3.5')).toBeInTheDocument();
  });
});
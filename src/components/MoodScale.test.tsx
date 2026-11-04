import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MoodScale from '@/components/MoodScale';

describe('MoodScale', () => {
  it('shows an empty state until the user picks a value', () => {
    const onChange = vi.fn();

    render(<MoodScale label="Мій стан" value={null} onChange={onChange} />);

    const slider = screen.getByRole('slider', { name: 'Мій стан' });
    expect(slider).toHaveAttribute('aria-valuetext', 'Ще не оцінено');
    expect(screen.getByText(/—/)).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '8' } });
    expect(onChange).toHaveBeenCalledWith(8);
  });

  it('describes the chosen value', () => {
    render(<MoodScale label="Мій стан" value={9} onChange={() => {}} />);

    const slider = screen.getByRole('slider', { name: 'Мій стан' });
    expect(slider).toHaveValue('9');
    expect(slider).toHaveAttribute('aria-valuetext', '9 з 10 — дуже важко');
  });
});

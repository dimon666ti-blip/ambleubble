import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '@/App';

describe('SituationForm', () => {
  it('clears the validation error after choosing an example', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /Допоможи мені повернути контроль/ }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Мені складно почати роботу над важливим проєктом' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

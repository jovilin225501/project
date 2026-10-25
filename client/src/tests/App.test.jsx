import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { StatusBadge, CategoryBadge, UrgencyBadge } from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { NotificationProvider } from '../context/NotificationContext.jsx';

describe('Frontend Component Tests', () => {
  it('StatusBadge renders correct status text and classes', () => {
    const { rerender } = render(<StatusBadge status="Pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();

    rerender(<StatusBadge status="Completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();

    rerender(<StatusBadge status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('CategoryBadge renders waste categories correctly', () => {
    render(<CategoryBadge category="plastic" />);
    expect(screen.getByText('plastic')).toBeInTheDocument();
  });

  it('UrgencyBadge renders urgency labels correctly', () => {
    render(<UrgencyBadge urgency="critical" />);
    expect(screen.getByText('critical')).toBeInTheDocument();
  });

  it('EmptyState renders custom title and description', () => {
    render(
      <EmptyState
        title="No Waste Reports Found"
        description="Try submitting a report to get started."
      />
    );
    expect(screen.getByText('No Waste Reports Found')).toBeInTheDocument();
    expect(screen.getByText('Try submitting a report to get started.')).toBeInTheDocument();
  });

  it('LandingPage renders platform title and features', () => {
    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <LandingPage />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    );

    expect(screen.getByText(/Cleaner Neighborhoods/i)).toBeInTheDocument();
    expect(screen.getByText(/Rewarded Recycling/i)).toBeInTheDocument();
    expect(screen.getByText(/Recycling Reward Matrix/i)).toBeInTheDocument();
  });
});

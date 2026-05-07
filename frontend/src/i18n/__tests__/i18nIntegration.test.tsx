import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import en from '../locales/en.json';
import es from '../locales/es.json';
import RecruiterDashboard from '../../components/RecruiterDashboard';

const createI18nInstance = (lng: string) => {
  const instance = i18n.createInstance();
  instance.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  return instance;
};

describe('RecruiterDashboard i18n', () => {
  it('renders English heading with default locale', () => {
    const instance = createI18nInstance('en');
    render(
      <MemoryRouter>
        <I18nextProvider i18n={instance}>
          <RecruiterDashboard />
        </I18nextProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Recruiter Dashboard')).toBeInTheDocument();
  });

  it('renders Spanish heading with locale es', () => {
    const instance = createI18nInstance('es');
    render(
      <MemoryRouter>
        <I18nextProvider i18n={instance}>
          <RecruiterDashboard />
        </I18nextProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard del Reclutador')).toBeInTheDocument();
  });
});

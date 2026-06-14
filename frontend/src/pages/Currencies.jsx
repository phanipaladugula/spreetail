import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';
import './Currencies.css';

function Currencies() {
  const navigate = useNavigate();
  const [currencies, setCurrencies] = useState([]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: '$',
    AUD: '$',
    CHF: 'CHF',
    CNY: '¥',
    SGD: '$',
    HKD: '$',
    NZD: '$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    THB: '฿',
    MYR: 'RM',
    IDR: 'Rp',
    PHP: '₱',
    VND: '₫',
    KRW: '₩',
    BRL: 'R$',
    MXN: '$',
    ZAR: 'R',
    TRY: '₺',
    RUB: '₽',
    AED: 'د.إ',
    SAR: '﷼',
    EGP: '£',
    NGN: '₦',
    KES: 'KSh'
  };

  const currencyNames = {
    USD: 'United States Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    INR: 'Indian Rupee',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar',
    NZD: 'New Zealand Dollar',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    PLN: 'Polish Zloty',
    THB: 'Thai Baht',
    MYR: 'Malaysian Ringgit',
    IDR: 'Indonesian Rupiah',
    PHP: 'Philippine Peso',
    VND: 'Vietnamese Dong',
    KRW: 'South Korean Won',
    BRL: 'Brazilian Real',
    MXN: 'Mexican Peso',
    ZAR: 'South African Rand',
    TRY: 'Turkish Lira',
    RUB: 'Russian Ruble',
    AED: 'United Arab Emirates Dirham',
    SAR: 'Saudi Riyal',
    EGP: 'Egyptian Pound',
    NGN: 'Nigerian Naira',
    KES: 'Kenyan Shilling'
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    setLoading(true);
    try {
      const currenciesData = await api.getCurrencies();
      setCurrencies(Array.isArray(currenciesData) ? currenciesData : Object.keys(currencyNames).map(code => ({
        code,
        name: currencyNames[code],
        symbol: currencySymbols[code]
      })));

      const ratesData = await api.getCurrencyRates();
      setRates(ratesData || {});
    } catch (error) {
      console.error('Error loading currencies:', error);
      setCurrencies(Object.keys(currencyNames).map(code => ({
        code,
        name: currencyNames[code],
        symbol: currencySymbols[code],
        rate: 1
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRates = async () => {
    setSyncing(true);
    try {
      await api.syncCurrencies();
      await loadCurrencies();
      alert('Currency rates synced successfully!');
    } catch (error) {
      alert('Failed to sync rates: ' + (error.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  const getCurrencyFlag = (code) => {
    const flagMap = {
      USD: '🇺🇸',
      EUR: '🇪🇺',
      GBP: '🇬🇧',
      INR: '🇮🇳',
      JPY: '🇯🇵',
      CAD: '🇨🇦',
      AUD: '🇦🇺',
      CHF: '🇨🇭',
      CNY: '🇨🇳',
      SGD: '🇸🇬',
      HKD: '🇭🇰',
      NZD: '🇳🇿',
      SEK: '🇸🇪',
      NOK: '🇳🇴',
      DKK: '🇩🇰',
      PLN: '🇵🇱',
      THB: '🇹🇭',
      MYR: '🇲🇾',
      IDR: '🇮🇩',
      PHP: '🇵🇭',
      VND: '🇻🇳',
      KRW: '🇰🇷',
      BRL: '🇧🇷',
      MXN: '🇲🇽',
      ZAR: '🇿🇦',
      TRY: '🇹🇷',
      RUB: '🇷🇺',
      AED: '🇦🇪',
      SAR: '🇸🇦',
      EGP: '🇪🇬',
      NGN: '🇳🇬',
      KES: '🇰🇪'
    };
    return flagMap[code] || '💱';
  };

  const getRateDisplay = (code) => {
    if (code === 'INR') return 'Base';
    const rate = rates[code];
    return rate ? `1 ${code} = ${rate.toFixed(4)} INR` : 'N/A';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading currencies...</p>
      </div>
    );
  }

  return (
    <div className="currencies-page">
      <header className="page-header">
        <Logo />
        <div className="page-title">
          <h1>Currencies</h1>
          <p>Manage supported currencies and exchange rates</p>
        </div>
        <button
          onClick={handleSyncRates}
          className="btn btn-primary"
          disabled={syncing}
        >
          {syncing ? 'Syncing...' : '🔄 Sync Rates'}
        </button>
      </header>

      <div className="currencies-content">
        <div className="currencies-info">
          <div className="info-card">
            <h3>💡 How it works</h3>
            <p>Convert expenses between 30+ supported currencies. Rates are updated daily from live market data.</p>
          </div>

          <div className="info-card">
            <h3>💰 Exchange Rates</h3>
            <p>All amounts are displayed in INR by default. Select a currency to see converted values.</p>
          </div>

          <div className="info-card">
            <h3>🔄 Auto-sync</h3>
            <p>Exchange rates are automatically updated daily. Click sync to force an update now.</p>
          </div>
        </div>

        <div className="currencies-list">
          {currencies.map(currency => (
            <div key={currency.code} className="currency-card">
              <div className="currency-flag">
                {getCurrencyFlag(currency.code)}
              </div>
              <div className="currency-info">
                <div className="currency-header">
                  <span className="currency-code">{currency.code}</span>
                  <span className="currency-symbol">{currencySymbols[currency.code]}</span>
                </div>
                <p className="currency-name">{currency.name}</p>
                <span className="currency-rate">{getRateDisplay(currency.code)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Currencies;
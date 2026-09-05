import { useBankAccounts } from '../hooks/useFinance';

export function BankingPage() {
  const { data: accounts } = useBankAccounts();

  return (
    <div>
      <h2>Bank Accounts</h2>
      {accounts && accounts.length > 0 ? (
        <div className="banking-list">
          {accounts.map((acc) => (
            <div key={acc.id} className="banking-item">
              <h3>{acc.bankName}</h3>
              <p>Type: {acc.accountType}</p>
              <p>Account: {acc.accountNumberMasked}</p>
              <p>Balance: ${acc.balance.toFixed(2)}</p>
              <p className="security-note">🔒 Secured with encrypted credentials</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No bank accounts added yet.</p>
      )}
    </div>
  );
}

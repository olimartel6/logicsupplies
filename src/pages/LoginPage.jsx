import { useState } from 'react'

export default function LoginPage({ onLogin, onAdminLogin }) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('phone') // phone | verify

  const handleSendCode = (e) => {
    e.preventDefault()
    if (phone.length >= 10) {
      setStep('verify')
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    if (code === '0000') {
      onAdminLogin()
    } else if (code.length === 4) {
      onLogin()
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">💎</div>
        <h1>Institut d'Épilation Laser</h1>
        <p>Programme de fidélité</p>

        {step === 'phone' ? (
          <form onSubmit={handleSendCode}>
            <div className="input-group">
              <label>Numéro de téléphone</label>
              <input
                type="tel"
                placeholder="418-555-0123"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={phone.length < 10}>
              Recevoir mon code SMS
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-light)' }}>
              Code envoyé au {phone}
            </p>
            <div className="input-group">
              <label>Code de vérification</label>
              <input
                type="text"
                placeholder="1234"
                maxLength={4}
                value={code}
                onChange={e => setCode(e.target.value)}
                autoFocus
                style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={code.length < 4}>
              Connexion
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: 8 }}
              onClick={() => { setStep('phone'); setCode('') }}
            >
              Changer de numéro
            </button>
            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              Demo: entrez n'importe quel code. Code "0000" = admin.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

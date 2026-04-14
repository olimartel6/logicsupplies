export default function Privacy() {
  return (
    <div className="page-content" style={{ paddingBottom: 40 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Politique de confidentialité</h1>

      <div style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 20, marginBottom: 8 }}>
          1. Collecte de données
        </h3>
        <p>Nous collectons uniquement les données nécessaires au fonctionnement du programme de fidélité :</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Nom</li>
          <li>Numéro de téléphone</li>
          <li>Date de naissance (optionnel)</li>
          <li>Historique de points et d'échanges</li>
        </ul>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 20, marginBottom: 8 }}>
          2. Utilisation des données
        </h3>
        <p>Vos données sont utilisées exclusivement pour :</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Gérer votre compte fidélité et vos points</li>
          <li>Vous envoyer des notifications sur vos récompenses (SMS, si consenti)</li>
          <li>Vous offrir des bonus d'anniversaire</li>
          <li>Améliorer nos services</li>
        </ul>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 20, marginBottom: 8 }}>
          3. Partage des données
        </h3>
        <p>Nous ne vendons, ne louons et ne partageons jamais vos données personnelles avec des tiers. Vos données sont uniquement accessibles au commerce participant et à LogicSupplies (fournisseur de la plateforme).</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 20, marginBottom: 8 }}>
          4. Sécurité
        </h3>
        <p>Vos données sont stockées de manière sécurisée sur des serveurs protégés. L'accès est limité au personnel autorisé.</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 20, marginBottom: 8 }}>
          5. Vos droits (Loi 25 du Québec)
        </h3>
        <p>Conformément à la Loi 25 sur la protection des renseignements personnels du Québec, vous avez le droit de :</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Accéder à vos données personnelles</li>
          <li>Rectifier vos informations</li>
          <li>Demander la suppression de votre compte et de toutes vos données</li>
          <li>Retirer votre consentement à tout moment</li>
        </ul>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 20, marginBottom: 8 }}>
          6. Consentement SMS
        </h3>
        <p>En acceptant de recevoir des SMS, vous consentez à recevoir des messages relatifs à votre compte fidélité (points gagnés, récompenses, anniversaire). Vous pouvez vous désinscrire à tout moment en répondant STOP.</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 20, marginBottom: 8 }}>
          7. Suppression du compte
        </h3>
        <p>Vous pouvez supprimer votre compte à tout moment depuis l'onglet Profil de l'application. La suppression entraîne l'effacement définitif de toutes vos données personnelles dans un délai de 30 jours.</p>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 20, marginBottom: 8 }}>
          8. Contact
        </h3>
        <p>Pour toute question concernant vos données personnelles, contactez-nous à : info@logicsupplies.com</p>

        <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
          Dernière mise à jour : avril 2026
        </p>
      </div>
    </div>
  )
}

export enum BoardMessageTitle {
    // The user will see these, so they are in french
    InProcess = 'Demande de placement en cours de traitement',
    InvalidPlacement = 'Placement invalide',
    SuccessfulPlacement = 'Placement valide',
    RulesBroken = 'Le placement a brisé les règles du jeu',

    // The user will not see these, so we keep them in english
    NoRulesBroken = 'No rules broken',
}

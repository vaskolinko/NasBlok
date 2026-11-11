export const ROLE_LABELS = {
  MANAGER: 'upravnik',
  REPRESENTATIVE: 'predstavnik lastnikov',
  OWNER: 'lastnik',
  TENANT: 'najemnik',
  CONTRACTOR: 'serviser',
}

// najemnik in serviser ne glasujeta
export const VOTING_ROLES = ['OWNER', 'REPRESENTATIVE', 'MANAGER']

// serviser obvestil stavbe ne vidi
export const ANNOUNCEMENT_ROLES = ['OWNER', 'REPRESENTATIVE', 'TENANT', 'MANAGER']

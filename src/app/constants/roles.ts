export interface Roles {
    id: number;
    name: string;
    description: string;
}

export const ROLES: Roles[] = [
    { id: 1, name: 'Admin', description: 'Administrator with full access - all restaurants' },
    { id: 2, name: 'Manager', description: 'Manager with full access - in a restaurant' },
    { id: 3, name: 'Member', description: 'Member with basic access - in a restaurant' },
    { id: 4, name: 'Customer', description: 'Customer with view-only access - in a restaurant' }
];
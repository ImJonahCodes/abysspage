import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function LoginsPage() {
  const logins = [
    { id: 1, user: 'john@example.com', timestamp: '2024-03-11 10:30:00', status: 'Success' },
    { id: 2, user: 'jane@example.com', timestamp: '2024-03-11 09:15:00', status: 'Success' },
    { id: 3, user: 'bob@example.com', timestamp: '2024-03-11 08:45:00', status: 'Failed' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Login History</h1>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logins.map((login) => (
              <TableRow key={login.id}>
                <TableCell>{login.user}</TableCell>
                <TableCell>{login.timestamp}</TableCell>
                <TableCell className={login.status === 'Success' ? 'text-green-500' : 'text-red-500'}>
                  {login.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
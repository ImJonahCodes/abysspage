import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function LogsPage() {
  const logs = [
    { id: 1, type: 'INFO', message: 'System startup', timestamp: '2024-03-11 10:00:00' },
    { id: 2, type: 'WARNING', message: 'High memory usage', timestamp: '2024-03-11 09:30:00' },
    { id: 3, type: 'ERROR', message: 'Database connection failed', timestamp: '2024-03-11 09:15:00' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Logs</h1>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className={
                  log.type === 'ERROR' ? 'text-red-500' :
                  log.type === 'WARNING' ? 'text-yellow-500' :
                  'text-blue-500'
                }>
                  {log.type}
                </TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{log.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
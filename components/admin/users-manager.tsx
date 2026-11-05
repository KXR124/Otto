import { setUserRole } from '@/app/actions'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import type { Profile } from '@/lib/types'

export function UsersManager({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="hidden md:table-cell">Joined</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((p) => {
            const isSelf = p.id === currentUserId
            const nextRole = p.role === 'admin' ? 'user' : 'admin'
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {p.full_name || 'Unnamed'}
                  {isSelf && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{p.email}</TableCell>
                <TableCell>
                  <span
                    className={
                      p.role === 'admin'
                        ? 'rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary'
                        : 'rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'
                    }
                  >
                    {p.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {new Date(p.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                </TableCell>
                <TableCell className="text-right">
                  {!isSelf && (
                    <form action={setUserRole}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="role" value={nextRole} />
                      <Button type="submit" size="sm" variant="outline">
                        {nextRole === 'admin' ? 'Make admin' : 'Remove admin'}
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

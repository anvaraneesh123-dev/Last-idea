import type { Plugin } from 'vite';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('database', 'nexus_community.db');

interface SqliteVolunteerRow {
  id: string;
  profile_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  skills: string;
  languages: string;
  service_area: string;
  availability: string;
  verification_status: string;
  missions_completed: number;
  hours_contributed: number;
  emergency_certified: number;
  is_first_aid_certified: number;
  certifications: string;
  neighborhood_zone: string;
  contact_protected: number;
}

interface SqliteMissionRow {
  id: string;
  title: string;
  category: string;
  urgency: string;
  location: string;
  volunteers_needed: number;
  volunteers_enrolled: string;
  description: string;
  deadline: string;
  organizer: string;
}

function getDb(): DatabaseSync {
  return new DatabaseSync(DB_PATH);
}

export function localSqlitePlugin(): Plugin {
  return {
    name: 'local-sqlite-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/volunteers' && req.method === 'GET') {
          try {
            const db = getDb();
            const rows = db.prepare('SELECT * FROM volunteers ORDER BY name ASC').all() as unknown as SqliteVolunteerRow[];
            const volunteers = rows.map(r => ({
              id: r.id,
              profileId: r.profile_id,
              name: r.name,
              email: r.email,
              phone: r.phone,
              role: r.role,
              avatar: r.avatar,
              skills: JSON.parse(r.skills || '[]'),
              languages: JSON.parse(r.languages || '[]'),
              serviceArea: r.service_area,
              availability: r.availability,
              verificationStatus: r.verification_status,
              missionsCompleted: Number(r.missions_completed),
              hoursContributed: Number(r.hours_contributed),
              emergencyCertified: Boolean(r.emergency_certified),
              isFirstAidCertified: Boolean(r.is_first_aid_certified),
              certifications: JSON.parse(r.certifications || '[]'),
              neighborhoodZone: r.neighborhood_zone,
              contactProtected: Boolean(r.contact_protected),
            }));

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(volunteers));
            return;
          } catch (err: unknown) {
            res.statusCode = 500;
            const message = err instanceof Error ? err.message : String(err);
            res.end(JSON.stringify({ error: message }));
            return;
          }
        }

        if (url === '/api/missions' && req.method === 'GET') {
          try {
            const db = getDb();
            const rows = db.prepare('SELECT * FROM missions').all() as unknown as SqliteMissionRow[];
            const missions = rows.map(r => ({
              id: r.id,
              title: r.title,
              category: r.category,
              urgency: r.urgency,
              location: r.location,
              volunteersNeeded: Number(r.volunteers_needed),
              volunteersEnrolled: JSON.parse(r.volunteers_enrolled || '[]'),
              description: r.description,
              deadline: r.deadline,
              organizer: r.organizer,
            }));

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(missions));
            return;
          } catch (err: unknown) {
            res.statusCode = 500;
            const message = err instanceof Error ? err.message : String(err);
            res.end(JSON.stringify({ error: message }));
            return;
          }
        }

        if (url === '/api/database/status' && req.method === 'GET') {
          try {
            const db = getDb();
            const countRow = db.prepare('SELECT count(*) as count FROM volunteers').get() as { count: number };
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              engine: 'SQLite 3 (Laptop Native node:sqlite & sqlite3.exe)',
              databasePath: DB_PATH,
              volunteersCount: countRow.count,
              status: 'connected',
              timestamp: new Date().toISOString()
            }));
            return;
          } catch (err: unknown) {
            res.statusCode = 500;
            const message = err instanceof Error ? err.message : String(err);
            res.end(JSON.stringify({ error: message }));
            return;
          }
        }

        next();
      });
    }
  };
}

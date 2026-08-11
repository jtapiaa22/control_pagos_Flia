# Control de Pagos

App familiar (PWA) para llevar el control de vencimientos y pagos: Claro,
Wifi, streaming, tarjetas, etc. Next.js + TypeScript + Supabase (Postgres,
Auth, Storage) + Vercel.

## 1. Poner en marcha Supabase (una sola vez)

Tu proyecto Supabase ya existe (`dzcczrjfpbbavbvdhwzm`). Faltan 3 pasos, todos
desde [supabase.com/dashboard](https://supabase.com/dashboard):

### 1.1 Aplicar las migraciones SQL

Entrá a tu proyecto → **SQL Editor** → **New query**. Pegá y ejecutá,
**en este orden**, el contenido completo de cada archivo (uno por vez, esperar
a que diga "Success" antes de pasar al siguiente):

1. `supabase/migrations/0001_init_schema.sql`
2. `supabase/migrations/0002_rls_policies.sql`
3. `supabase/migrations/0003_recurrence_function.sql`
4. `supabase/migrations/0004_push_subscriptions.sql`
5. `supabase/migrations/0005_notificaciones_tracking.sql`

### 1.2 Copiar la "secret key"

Project Settings → **API** → sección **API Keys** → copiá la **secret key**
(antes se llamaba `service_role`). Pegala en `.env`, en la línea:

```
SUPABASE_SECRET_KEY=
```

**Nunca** la compartas en un chat, ni la subas a git, ni le pongas el prefijo
`NEXT_PUBLIC_`. Solo se usa del lado del servidor (alta de usuarios y cron).

### 1.3 Crear tu cuenta y marcarla como admin

1. Authentication → **Users** → **Add user** → creá tu usuario con tu email y
   una contraseña (marcá "Auto Confirm User").
2. Volvé al **SQL Editor** y corré (reemplazando el email si hace falta):

```sql
update public.profiles set role = 'admin'
where email = 'jorgealejandrotapiaahumada@gmail.com';
```

A partir de ahí, los demás miembros de la familia los creás vos desde la app
(`/admin/usuarios/nuevo`), no hace falta tocar Supabase de nuevo para eso.

## 2. Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). El middleware te va a
mandar a `/login`; entrá con la cuenta admin que creaste en el paso 1.3.

Las notificaciones push (VAPID) ya están generadas y en `.env`. Si en algún
momento querés generar un par nuevo:

```bash
node scripts/generate-vapid-keys.mjs
```

## 3. Desplegar en Vercel

1. Subí este repo a GitHub (privado).
2. Importalo en [vercel.com/new](https://vercel.com/new).
3. Cargá las variables de entorno de `.env` (todas, incluida
   `SUPABASE_SECRET_KEY`) en Project Settings → Environment Variables.
4. Deploy. El cron diario (`vercel.json`) se activa solo en producción —
   revisá en Vercel → tu proyecto → **Cron Jobs** que haya quedado creado.
5. Para probar el cron a mano:

```bash
curl -H "Authorization: Bearer TU_CRON_SECRET" https://tu-app.vercel.app/api/cron/check-vencimientos
```

## Estructura

- `supabase/migrations/` — esquema, políticas de seguridad (RLS) y funciones.
- `src/app/(auth)` — login.
- `src/app/(app)` — dashboard, pagos, configuración, admin (protegidos por
  sesión; `admin/*` además requiere rol admin).
- `src/app/api/` — rutas de mutación (pagos, alta de usuarios, push, cron).
- `src/lib/supabase/` — clientes Supabase (browser, server, admin/service-role).

## Seguridad

El aislamiento de datos entre miembros de la familia se garantiza con **Row
Level Security** en Postgres (`supabase/migrations/0002_rls_policies.sql`),
no solo en la interfaz: cada usuario únicamente puede leer/editar sus propios
pagos, salvo el admin, que además puede *leer* (no editar) los de todos, tal
como se acordó.

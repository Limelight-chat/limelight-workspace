# Supabase Authentication Integration

## What Was Added

### 1. Dependencies

- Installed `@supabase/supabase-js`

### 2. Configuration Files

- **`.env.local`** - Environment variables for Supabase and API URL
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_URL`

### 3. Core Files Created

#### `src/lib/supabase.ts`

- Supabase client initialization
- Used throughout the app for authentication

#### `src/lib/api.ts`

- API utility functions for calling your backend
- Automatically includes JWT token in requests
- Functions:
  - `uploadFile(file)` - Upload CSV/Excel files
  - `getJobStatus(jobId)` - Check upload job status
  - `getTables()` - Get user's tables
  - `getTableSchema(tableId)` - Get table details
  - `deleteTable(tableId)` - Delete a table
  - `executeQuery(query, tableIds?)` - Run natural language queries

#### `src/hooks/useAuth.ts`

- React hook for authentication state
- Returns `{ user, loading }`
- Automatically updates when auth state changes

#### `src/components/ProtectedRoute.tsx`

- Wrapper component for protected pages
- Redirects to `/login` if not authenticated
- Shows loading state while checking auth

### 4. Pages Created

#### `src/app/login/page.tsx`

- Login and signup page
- Email/password authentication
- Toggle between sign in and sign up modes

### 5. Updated Pages

#### `src/app/chat/page.tsx`

- Now protected with authentication
- Loads and displays user's uploaded tables
- Shows sign out button
- Dynamically renders tables from backend

## How to Use

### Start the Frontend

```bash
cd limelight-workspace
npm run dev
```

Visit http://localhost:3000

### User Flow

1. **First Visit** → Redirected to `/login`
2. **Sign Up** → Create account with email/password
3. **Sign In** → Login with credentials
4. **Access Chat** → View your uploaded tables
5. **Upload Files** → Use the API to upload files
6. **Query Data** → Execute natural language queries

### Example: Upload a File

```typescript
import { api } from "@/lib/api";

const handleUpload = async (file: File) => {
  try {
    const result = await api.uploadFile(file);
    console.log("Job ID:", result.job_id);

    // Poll for job status
    const status = await api.getJobStatus(result.job_id);
    console.log("Status:", status);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### Example: Execute Query

```typescript
import { api } from "@/lib/api";

const handleQuery = async () => {
  try {
    const result = await api.executeQuery("show me all data");
    console.log("SQL:", result.sql);
    console.log("Rows:", result.rows);
  } catch (error) {
    console.error("Query failed:", error);
  }
};
```

## Environment Variables

Make sure to update `.env.local` with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Protected Routes

To protect any page, wrap it with `ProtectedRoute`:

```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## Next Steps

1. **Update InputBox component** to call `api.executeQuery()`
2. **Add file upload UI** to connections page
3. **Display query results** in the chat interface
4. **Add loading states** for better UX
5. **Handle errors** with toast notifications

## Testing

1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Sign up at http://localhost:3000/login
4. Navigate to http://localhost:3000/chat
5. See your tables loaded from the backend!

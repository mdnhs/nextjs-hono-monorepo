export default function UnauthorizedPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-6 text-center'>
      <h1 className='text-4xl font-bold'>403 - Unauthorized</h1>
      <p className='mt-4 text-muted-foreground'>
        You do not have permission to access this page.
      </p>
    </div>
  );
}
